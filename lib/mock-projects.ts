export interface MockProject {
  id: string;
  name: string;
  slug: string;
  isOwner: boolean;
}

export const MOCK_PROJECTS: MockProject[] = [
  { id: "mock-api", name: "API Platform", slug: "api-platform", isOwner: true },
  { id: "mock-commerce", name: "Commerce Backend", slug: "commerce-backend", isOwner: true },
  { id: "mock-team", name: "Team Workspace", slug: "team-workspace", isOwner: false },
];
