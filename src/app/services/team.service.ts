// src/app/services/team.service.ts
import { Injectable } from '@angular/core';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private teams: Team[] = [
    {
      team: 'Frontend',
      members: ['Alice', 'Bob']
    },
    {
      team: 'Backend',
      members: ['Charlie', 'David']
    },
    {
      team: 'Middle Tier',
      members: ['Eve', 'Frank']
    }
  ];

  getTeams(): Team[] {
    return this.teams;
  }
}
