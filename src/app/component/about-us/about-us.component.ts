import { Component } from '@angular/core';
import { Team } from '../../models/team.model';
import { TeamService } from '../../services/team.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css'
})
export class AboutUsComponent {
  teams: Team[] = [
    {
      team: 'Frontend',
      members: ['Alice', 'Bob', 'Carol', 'David']
    },
    {
      team: 'Backend',
      members: ['Eve', 'Frank', 'Grace', 'Hank', 'Ivy']
    },
    {
      team: 'Middle Tier',
      members: ['Jack', 'Kathy']
    }
  ];

  getPhoto(member: String, team: String): string {
    const teamFolder = team.toString().toLowerCase().replace(/\s+/g, '');
    const memberName = member.toString().toLowerCase();
    return `assets/team/${teamFolder}/${memberName}.jpg`;
  }
}
