import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { LeagueService } from './league.service';

interface Team {
  id: number;
  name: string;
  strength: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference?: number;
  championshipProbability?: number;
  noChance?: boolean;
  hasChance: boolean;
}

interface Match {
  id: number;
  week: number;
  homeTeam: Team;
  awayTeam: Team;
  homeGoals?: number;
  awayGoals?: number;
  played: boolean;
  editable?: boolean;
}

describe('LeagueService', () => {
  let service: LeagueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LeagueService);
  });

  it('should initialize the league with default teams', () => {
    service.initializeLeague();
    service.teams$.subscribe((teams) => {
      expect(teams.length).toBe(4);
      expect(teams[0].name).toBe('Arsenal');
    });
    service.matches$.subscribe((matches) => {
      expect(matches.length).toBeGreaterThan(0);
    });
    service.currentWeek$.subscribe((week) => {
      expect(week).toBe(0);
    });
    service.isLeagueComplete$.subscribe((isComplete) => {
      expect(isComplete).toBeFalse();
    });
  });

  it('should initialize the league with custom teams', () => {
    const customTeams: Team[] = [
      {
        id: 1,
        name: 'Team A',
        strength: 70,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        hasChance: true,
      },
      {
        id: 2,
        name: 'Team B',
        strength: 75,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        hasChance: true,
      },
    ];
    service.initializeLeague(customTeams);
    service.teams$.subscribe((teams) => {
      expect(teams.length).toBe(2);
      expect(teams[0].name).toBe('Team A');
    });
  });

  it('should generate fixtures correctly', () => {
    service.initializeLeague();
    service.matches$.subscribe((matches) => {
      expect(matches.length).toBe(12); // 4 teams -> 6 matches per round, 2 rounds
      expect(matches[0].homeTeam.name).toBeDefined();
      expect(matches[0].awayTeam.name).toBeDefined();
    });
  });

  it('should play the next week and update standings', () => {
    service.initializeLeague();
    service.playNextWeek();
    service.currentWeek$.subscribe((week) => {
      expect(week).toBe(1);
    });
    service.matches$.subscribe((matches) => {
      const playedMatches = matches.filter((m) => m.week === 1 && m.played);
      expect(playedMatches.length).toBeGreaterThan(0);
    });
    service.teams$.subscribe((teams) => {
      expect(teams[0].played).toBeGreaterThan(0);
    });
  });

  it('should play the entire league and mark it as complete', () => {
    service.initializeLeague();
    service.playEntireLeague();
    service.isLeagueComplete$.subscribe((isComplete) => {
      expect(isComplete).toBeTrue();
    });
    service.matches$.subscribe((matches) => {
      const playedMatches = matches.filter((m) => m.played);
      expect(playedMatches.length).toBe(matches.length);
    });
  });

  it('should update match results manually', () => {
    service.initializeLeague();
    service.playNextWeek();
    const matches = service.getWeekMatches(1);
    const matchToUpdate = matches[0];
    service.updateMatchResult(matchToUpdate, 3, 2);
    service.matches$.subscribe((updatedMatches) => {
      const updatedMatch = updatedMatches.find(
        (m) => m.id === matchToUpdate.id
      );
      expect(updatedMatch?.homeGoals).toBe(3);
      expect(updatedMatch?.awayGoals).toBe(2);
    });
  });

  it('should update team strength', () => {
    service.initializeLeague();
    service.updateTeamStrength(1, 95);
    service.teams$.subscribe((teams) => {
      const updatedTeam = teams.find((t) => t.id === 1);
      expect(updatedTeam?.strength).toBe(95);
    });
  });

  it('should calculate championship probabilities correctly', () => {
    service.initializeLeague();
    service.playEntireLeague();
    service.teams$.subscribe((teams) => {
      expect(teams[0].championshipProbability).toBe(100);
      expect(teams[1].championshipProbability).toBe(0);
    });
  });

  it('should determine the champion after the league ends', () => {
    service.initializeLeague();
    service.playEntireLeague();
    const champion = service.getChampion();
    expect(champion).not.toBeNull();
    expect(champion?.name).toBeDefined();
  });
});
