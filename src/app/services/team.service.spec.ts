import { TestBed } from '@angular/core/testing';
import { TeamService } from './team.service';
import { ProductService } from './product.service';
import { of, throwError } from 'rxjs';

class MockProductService {
  getTeamsForCategory(cat?: string) {
    if (cat === 'ErrorCat') return throwError(() => new Error('fail'));
    return of([
      {
        id: 't1',
        team: 'AlphaTeam',
        nickname: 'Alpha',
        members: [{ name: 'Dev1', githubUrl: 'url1', role: 'Dev' }],
      },
      {
        id: 't2',
        team: 'BetaTeam',
        nickname: 'Beta',
        members: [{ name: 'QA1', githubUrl: 'url2', role: 'QA' }],
      },
    ] as any);
  }
}

describe('TeamService', () => {
  let service: TeamService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TeamService,
        { provide: ProductService, useClass: MockProductService },
      ],
    });
    service = TestBed.inject(TeamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return teams for current category', (done) => {
    service.getTeams().subscribe((teams) => {
      expect(teams.length).toBe(2);
      done();
    });
  });

  it('should return teams for explicit category', (done) => {
    service.getTeamsForCategory('Bike').subscribe((teams) => {
      expect(teams[0].nickname).toBe('Alpha');
      expect(teams[0].members.length).toBe(1);
      done();
    });
  });

  it('should fallback to empty array on error', (done) => {
    service.getTeamsForCategory('ErrorCat').subscribe((teams) => {
      expect(teams.length).toBe(0);
      done();
    });
  });
});
