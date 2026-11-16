export interface SidebarProject {
  id: string;
  name: string;
  isOwner: boolean;
}

export interface ProjectLists {
  ownedProjects: SidebarProject[];
  sharedProjects: SidebarProject[];
}
