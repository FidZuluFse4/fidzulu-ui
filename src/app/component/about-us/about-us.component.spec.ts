import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutUsComponent } from './about-us.component';
import { TeamService } from '../../services/team.service';
import { of } from 'rxjs';

class MockTeamService {
  getTeams() {
    return of([]);
  }
}

describe('AboutUsComponent', () => {
  let component: AboutUsComponent;
  let fixture: ComponentFixture<AboutUsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutUsComponent],
      providers: [{ provide: TeamService, useClass: MockTeamService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutUsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
