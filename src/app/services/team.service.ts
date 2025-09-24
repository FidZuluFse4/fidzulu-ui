// src/app/services/team.service.ts
import { Injectable } from '@angular/core';
import { Team, TeamMember } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private teams: Team[] = [
    {
      team: 'Frontend',
      nickname: 'The Pixel Perfectionists',
      members: [
        {
          name: 'Dhruv Choudhary',
          githubUrl: 'https://github.com/Dhruvch1244',
        },
        { name: 'RamNaresh U', githubUrl: 'https://github.com/ramnareeesh' },
        {
          name: 'Anupama Kamath',
          githubUrl: 'https://github.com/anu1712',
        },
        {
          name: 'Rimjhim Mukherjee',
          githubUrl: 'https://github.com/rimjhim-debug',
        },
      ],
    },
    {
      team: 'Middleware',
      nickname: 'The Connection Crew',
      members: [
        { name: 'Prajwal P Amte', githubUrl: 'https://github.com/PrajwalAmte' },
        {
          name: 'Shreya Shastry',
          githubUrl: 'https://github.com/shrenisc',
        },
      ],
    },
    {
      team: 'Backend',
      nickname: 'The Data Dynamos',
      members: [
        {
          name: 'Agrima Tripathi',
          githubUrl: 'https://github.com/agrima-tripathi',
        },
        {
          name: 'Varun Sankara Narayanan',
          githubUrl: 'https://github.com/vickky1802',
        },
        {
          name: 'Sunidhi Gopalan',
          githubUrl: 'https://github.com/x-sunidhi-x',
        },
        {
          name: 'Shreeji Chandgotia',
          githubUrl: 'https://github.com/kristenlee2023',
        },
        {
          name: 'Divya Chennupalle',
          githubUrl: 'https://github.com/ShreeChandG',
        },
      ],
    },
  ];

  getTeams(): Team[] {
    return this.teams;
  }
}
