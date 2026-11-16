export interface ProjectInput {
  name: string;
  id?: string;
}

export async function readProjectInput(request: Request, allowDefault = false): Promise<ProjectInput | Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Expected a JSON object." }, { status: 400 });
  }
  const name = "name" in body ? body.name : undefined;
  if (!(name === undefined && allowDefault) && (typeof name !== "string" || !name.trim())) {
    return Response.json({ error: "Project name must be a nonempty string." }, { status: 400 });
  }
  const id = "id" in body ? body.id : undefined;
  if (allowDefault && id !== undefined && (typeof id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*-[a-f0-9]{8}$/.test(id) || id.length > 200)) {
    return Response.json({ error: "Invalid project room ID." }, { status: 400 });
  }
  return {
    name: typeof name === "string" ? name.trim() : "Untitled Project",
    ...(allowDefault && typeof id === "string" ? { id } : {}),
  };
}
