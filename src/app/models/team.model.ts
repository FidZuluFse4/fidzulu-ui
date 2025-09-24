export interface TeamMember {
  name: string;
  githubUrl: string;
  role?: string;
}

export interface Team {
  id?: string;
  team: string;
  nickname: string;
  members: TeamMember[];
}
