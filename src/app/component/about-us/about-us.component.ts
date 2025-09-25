import { Component, OnInit, OnDestroy } from '@angular/core';
import { Team, TeamMember } from '../../models/team.model';
import { TeamService } from '../../services/team.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.css',
})
export class AboutUsComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  private sub?: Subscription;

  constructor(private teamService: TeamService) {}

  ngOnInit(): void {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    this.sub = this.teamService.getTeams().subscribe((teams) => {
      this.teams = teams;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  getPhoto(member: TeamMember, team: string): string {
    // Default image if no specific image is available
    return 'assets/github-profile.png';
  }

  getGithubUsername(url: string): string {
    return url.split('/').pop() || '';
  }
}
