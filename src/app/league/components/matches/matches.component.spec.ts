import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchesComponent } from './matches.component';
import { Match } from '@/league/models/match.model';

describe('MatchesComponent', () => {
  let component: MatchesComponent;
  let fixture: ComponentFixture<MatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should open edit dialog and set selected match when editMatch is called', () => {
    const match: Match = {
      homeTeam: {
        id: 1,
        name: 'Team A',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      awayTeam: {
        id: 2,
        name: 'Team B',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      homeGoals: 2,
      awayGoals: 1,
      id: 0,
      played: false,
      week: 0,
    };
    component.editMatch(match);

    expect(component.selectedMatch).toEqual(match);
    expect(component.editHomeGoals).toBe(2);
    expect(component.editAwayGoals).toBe(1);
    expect(component.editDialogVisible).toBeTrue();
  });

  it('should close edit dialog and reset selected match when cancelEdit is called', () => {
    component.editDialogVisible = true;
    component.selectedMatch = {
      id: 1,
      homeTeam: {
        id: 1,
        name: 'Team A',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      awayTeam: {
        id: 2,
        name: 'Team B',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      homeGoals: 2,
      awayGoals: 1,
      played: false,
      week: 0,
    };

    component.cancelEdit();

    expect(component.editDialogVisible).toBeFalse();
    expect(component.selectedMatch).toBeNull();
  });

  it('should save match result and emit matchUpdated event when saveMatchResult is called', () => {
    const match: Match = {
      id: 1,
      homeTeam: {
        id: 1,
        name: 'Team A',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      awayTeam: {
        id: 2,
        name: 'Team B',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      homeGoals: 2,
      awayGoals: 1,
      played: false,
      week: 0,
    };
    const matchUpdatedSpy = spyOn(component.matchUpdated, 'emit');
    component.selectedMatch = match;
    component.editHomeGoals = 3;
    component.editAwayGoals = 2;

    component.saveMatchResult();

    expect(match.homeGoals).toBe(3);
    expect(match.awayGoals).toBe(2);
    expect(matchUpdatedSpy).toHaveBeenCalledWith(match);
    expect(component.editDialogVisible).toBeFalse();
    expect(component.selectedMatch).toBeNull();
  });

  it('should not emit matchUpdated event if no match is selected when saveMatchResult is called', () => {
    const matchUpdatedSpy = spyOn(component.matchUpdated, 'emit');

    component.saveMatchResult();

    expect(matchUpdatedSpy).not.toHaveBeenCalled();
    expect(component.editDialogVisible).toBeFalse();
    expect(component.selectedMatch).toBeNull();
  });

  it('should initialize with default values', () => {
    expect(component.matches).toEqual([]);
    expect(component.editDialogVisible).toBeFalse();
    expect(component.selectedMatch).toBeNull();
    expect(component.editHomeGoals).toBe(0);
    expect(component.editAwayGoals).toBe(0);
  });

  it('should update editHomeGoals and editAwayGoals when editMatch is called', () => {
    const match: Match = {
      id: 1,
      homeTeam: {
        id: 1,
        name: 'Team A',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      awayTeam: {
        id: 2,
        name: 'Team B',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      homeGoals: 4,
      awayGoals: 3,
      played: false,
      week: 0,
    };

    component.editMatch(match);

    expect(component.editHomeGoals).toBe(4);
    expect(component.editAwayGoals).toBe(3);
  });

  it('should reset editHomeGoals and editAwayGoals to 0 if match goals are undefined', () => {
    const match: Match = {
      id: 1,
      homeTeam: {
        id: 1,
        name: 'Team A',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      awayTeam: {
        id: 2,
        name: 'Team B',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
      },
      homeGoals: undefined,
      awayGoals: undefined,
      played: false,
      week: 0,
    };

    component.editMatch(match);

    expect(component.editHomeGoals).toBe(0);
    expect(component.editAwayGoals).toBe(0);
  });

  it('should not update selectedMatch or dialog visibility if cancelEdit is called without an active edit', () => {
    component.cancelEdit();

    expect(component.editDialogVisible).toBeFalse();
    expect(component.selectedMatch).toBeNull();
  });
});
