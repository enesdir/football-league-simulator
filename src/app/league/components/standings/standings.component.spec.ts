import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StandingsComponent } from './standings.component';
import { Team } from '@/league/models/team.model';

describe('StandingsComponent', () => {
  let component: StandingsComponent;
  let fixture: ComponentFixture<StandingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandingsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StandingsComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have an empty teams array by default', () => {
    expect(component.teams).toEqual([]);
  });

  it('should have showChampionshipProbability set to false by default', () => {
    expect(component.showChampionshipProbability).toBeFalse();
  });

  it('should render the template correctly', () => {
    component.teams = [
      { name: 'Team A', points: 10 },
      { name: 'Team B', points: 8 },
    ] as Team[];
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p-table')).toBeTruthy();
  });
});
