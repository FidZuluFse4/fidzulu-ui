export interface TeamMember {
  name: string;
  githubUrl: string;
  role?: string;
}

export interface Team {
  team: string;
  nickname: string;
  members: TeamMember[];
}
