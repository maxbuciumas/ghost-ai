import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

// Exercise the actual handlers with isolated identity and database boundaries.
function load(file, dependencies = {}) {
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  new Function('require', 'module', 'exports', output)((name) => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, loaded, loaded.exports);
  return loaded.exports;
}

test('project API identity, ownership, validation and persistence contracts', async () => {
  let userId = null;
  const records = new Map();
  let sequence = 0;
  const prisma = { project: {
    create: async ({ data }) => {
      const project = { ...data, id: data.id ?? `generated-${++sequence}` };
      if (records.has(project.id)) throw { code: 'P2002' };
      records.set(project.id, project);
      return project;
    },
    findUnique: async ({ where }) => records.get(where.id) ?? null,
    update: async ({ where, data }) => {
      assert.equal(records.get(where.id).ownerId, where.ownerId);
      Object.assign(records.get(where.id), data);
      return records.get(where.id);
    },
    deleteMany: async ({ where }) => {
      assert.equal(records.get(where.id).ownerId, where.ownerId);
      records.delete(where.id);
    },
  } };
  const dependencies = {
    '@clerk/nextjs/server': { auth: async () => ({ userId }) },
    '@/lib/prisma': { prisma },
    '@/lib/project-input': load('lib/project-input.ts'),
    '@/lib/projects': { getOwnedProjects: async (id) => [...records.values()].filter(p => p.ownerId === id) },
  };
  const collection = load('app/api/projects/route.ts', dependencies);
  const item = load('app/api/projects/[projectId]/route.ts', dependencies);
  const request = (body) => new Request('http://localhost/api/projects', {
    method: 'POST', body: JSON.stringify(body),
  });
  const context = (projectId) => ({ params: Promise.resolve({ projectId }) });
  for (const operation of [
    () => collection.GET(), () => collection.POST(request({})),
    () => item.PATCH(request({ name: 'x' }), context('x')),
    () => item.DELETE(request({}), context('x')),
  ]) assert.equal((await operation()).status, 401);
  userId = 'owner';
  const created = await collection.POST(request({ ownerId: 'attacker' }));
  assert.equal(created.status, 201);
  const { project } = await created.json();
  assert.equal(project.name, 'Untitled Project');
  assert.equal(project.ownerId, 'owner');
  assert.equal(project.id, 'generated-1');
  const custom = await collection.POST(request({ name: 'Room', id: 'room-ab12cd34', ownerId: 'attacker' }));
  assert.equal(custom.status, 201);
  assert.equal((await custom.json()).project.id, 'room-ab12cd34');
  assert.equal((await collection.POST(request({ name: 'Room', id: 'room-ab12cd34' }))).status, 409);
  assert.equal((await collection.POST(request({ id: '../invalid' }))).status, 400);
  for (const body of [null, [], { name: 42 }, { name: '  ' }]) {
    assert.equal((await collection.POST(request(body))).status, 400);
  }
  assert.equal((await collection.POST(new Request('http://localhost', { method: 'POST', body: '{' }))).status, 400);
  userId = 'outsider';
  assert.equal((await item.PATCH(request({ name: 'stolen' }), context(project.id))).status, 403);
  assert.equal((await item.DELETE(request({}), context(project.id))).status, 403);
  assert.deepEqual((await (await collection.GET()).json()).projects, []);
  userId = 'owner';
  assert.equal((await item.PATCH(request({}), context(project.id))).status, 400);
  assert.equal((await item.PATCH(request({ name: ' Renamed ' }), context(project.id))).status, 200);
  assert.equal(records.get(project.id).name, 'Renamed');
  assert.equal((await item.DELETE(request({}), context('missing'))).status, 404);
  assert.equal((await item.DELETE(request({}), context(project.id))).status, 204);
  assert.equal(records.size, 1);
});

test('project actions use real mutations and choose refresh versus active-workspace redirect', async () => {
  let slots = [], cursor = 0, pending;
  let activeId;
  let fail = false;
  const navigation = [], requests = [];
  const previousDocument = global.document;
  const previousHTMLElement = global.HTMLElement;
  const previousFetch = global.fetch;
  global.HTMLElement = class {};
  global.document = { activeElement: null };
  global.fetch = async (url, options) => {
    requests.push({ url, ...options });
    if (fail) return Response.json({ error: 'Forbidden' }, { status: 403 });
    return options.method === 'DELETE' ? new Response(null, { status: 204 })
      : Response.json({ project: { id: JSON.parse(options.body).id } });
  };
  const react = {
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = value; }];
    },
    useRef(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = { current: initial };
      return slots[index];
    },
    useTransition: () => [false, callback => { pending = callback(); }],
  };
  const { useProjectActions: runActions } = load('hooks/use-project-actions.ts', {
    react,
    'next/navigation': {
      useRouter: () => ({ push: url => navigation.push(['push', url]), replace: url => navigation.push(['replace', url]), refresh: () => navigation.push(['refresh']) }),
      useParams: () => ({ projectId: activeId }),
    },
    '@/lib/project-slug': load('lib/project-slug.ts'),
  });
  const owned = { id: 'project-12345678', name: 'Original', isOwner: true };
  const lists = { ownedProjects: [owned], sharedProjects: [] };
  const render = () => { cursor = 0; return runActions(lists); };
  try {
    let state = render();
    assert.equal(requests.length, 0, 'initial render must not fetch');
    state.openCreate();
    state = render();
    state.setName('My Architecture');
    state = render();
    assert.match(state.roomId, /^my-architecture-[a-f0-9]{8}$/);
    const roomId = state.roomId;
    state.submit();
    state.submit();
    await pending;
    assert.equal(requests.length, 1, 'duplicate submit blocked');
    assert.deepEqual(JSON.parse(requests[0].body), { name: 'My Architecture', id: roomId });
    assert.deepEqual(navigation.pop(), ['push', `/editor/${roomId}`]);
    state = render();
    state.openRename(owned);
    state = render();
    assert.equal(state.name, 'Original');
    state.setName('Renamed');
    state = render();
    state.submit(); await pending;
    assert.equal(requests.at(-1).method, 'PATCH');
    assert.deepEqual(JSON.parse(requests.at(-1).body), { name: 'Renamed' });
    assert.deepEqual(navigation.pop(), ['refresh']);
    state = render(); state.openDelete(owned); state = render();
    state.submit(); await pending;
    assert.deepEqual(navigation.pop(), ['refresh']);
    activeId = owned.id;
    state = render(); state.openDelete(owned); state = render();
    state.submit(); await pending;
    assert.deepEqual(navigation.pop(), ['replace', '/editor']);
    fail = true;
    state = render(); state.openRename(owned); state = render();
    state.submit(); await pending;
    state = render();
    assert.equal(state.error, 'Forbidden');
    assert.equal(state.dialog.kind, 'rename');
    assert.equal(navigation.length, 0);
  } finally {
    global.document = previousDocument;
    global.HTMLElement = previousHTMLElement;
    global.fetch = previousFetch;
  }
});
