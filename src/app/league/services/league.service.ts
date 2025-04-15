import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Team } from '../models/team.model';
import { Match } from '../models/match.model';
import { Week } from '../models/week.model';
import { League } from '@/league/models/league.model';
import { PREDEFINED_LEAGUES } from '../mocks/default-leagues';
@Injectable({
  providedIn: 'root',
})
export class LeagueService {
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  private currentWeekSubject = new BehaviorSubject<number>(0);
  private isLeagueCompleteSubject = new BehaviorSubject<boolean>(false);

  teams$ = this.teamsSubject.asObservable();
  matches$ = this.matchesSubject.asObservable();
  currentWeek$ = this.currentWeekSubject.asObservable();
  isLeagueComplete$ = this.isLeagueCompleteSubject.asObservable();

  private predefinedLeagues: League[] = PREDEFINED_LEAGUES;
  private defaultTeams: Team[] = [
    {
      id: 1,
      name: 'Arsenal',
      strength: 85,
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
      name: 'Chelsea',
      strength: 80,
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
      id: 3,
      name: 'Liverpool',
      strength: 90,
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
      id: 4,
      name: 'Manchester City',
      strength: 88,
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
  // Add these methods to the LeagueService class
  getAvailableLeagues(): League[] {
    return this.predefinedLeagues;
  }

  getLeagueById(leagueId: string): League | undefined {
    return this.predefinedLeagues.find((league) => league.id === leagueId);
  }

  getTeamsForLeague(leagueId: string): Team[] {
    const league = this.getLeagueById(leagueId);
    if (league) {
      // Return a deep copy of the teams to avoid modifying the original
      return league.teams.map((team) => ({ ...team }));
    }
    return [];
  }
  constructor() {}

  initializeLeague(teams?: Team[]): void {
    // Use provided teams or default teams
    const leagueTeams = teams ? teams : this.defaultTeams;

    // Reset team stats
    const resetTeams = leagueTeams.map((team) => ({
      ...team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      championshipProbability: 0,
      noChance: false,
      hasChance: true,
    }));

    this.teamsSubject.next(resetTeams);
    this.currentWeekSubject.next(0);
    this.isLeagueCompleteSubject.next(false);
    this.generateFixture();
  }

  // src/app/core/services/league.service.ts (partial update)

  // Update the generateFixture method to handle odd number of teams
  private generateFixture(): void {
    const teams = this.teamsSubject.value;
    const matches: Match[] = [];
    let matchId = 1;

    // Handle odd number of teams by adding a "bye" team
    const teamsForFixture = [...teams];
    const isOddNumberOfTeams = teamsForFixture.length % 2 !== 0;

    if (isOddNumberOfTeams) {
      // Add a dummy team for fixture generation
      // This team won't actually play matches
      teamsForFixture.push({
        id: -1,
        name: 'BYE',
        strength: 0,
        points: 0,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        hasChance: false,
      });
    }

    const totalTeams = teamsForFixture.length;
    const totalRounds = totalTeams - 1;

    // Generate first half fixtures
    for (let round = 1; round <= totalRounds; round++) {
      const weekMatches = this.generateWeekMatches(teamsForFixture, round);

      // Filter out matches with the dummy team
      const validMatches = weekMatches.filter(
        (match) => match.homeTeam.id !== -1 && match.awayTeam.id !== -1
      );

      validMatches.forEach((match) => {
        matches.push({
          id: matchId++,
          week: round,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          played: false,
        });
      });
    }

    // Generate second half fixtures (reverse home/away)
    for (let round = totalRounds + 1; round <= totalRounds * 2; round++) {
      const firstHalfRound = round - totalRounds;
      const firstHalfMatches = matches.filter((m) => m.week === firstHalfRound);

      firstHalfMatches.forEach((match) => {
        matches.push({
          id: matchId++,
          week: round,
          homeTeam: match.awayTeam,
          awayTeam: match.homeTeam,
          played: false,
        });
      });
    }

    this.matchesSubject.next(matches);
  }

  private generateWeekMatches(
    teams: Team[],
    week: number
  ): { homeTeam: Team; awayTeam: Team }[] {
    const weekMatches: { homeTeam: Team; awayTeam: Team }[] = [];
    const n = teams.length;

    // Using circle method for fixture generation
    for (let i = 0; i < n / 2; i++) {
      const home = (week + i) % (n - 1);
      let away = (n - 1 - i + week) % (n - 1);

      // If it's the first team, play against the last team
      if (i === 0) {
        away = n - 1;
      }

      // Alternate home and away
      if ((week % 2 === 0 && i % 2 === 0) || (week % 2 === 1 && i % 2 === 1)) {
        weekMatches.push({ homeTeam: teams[home], awayTeam: teams[away] });
      } else {
        weekMatches.push({ homeTeam: teams[away], awayTeam: teams[home] });
      }
    }

    return weekMatches;
  }

  playNextWeek(): void {
    const currentWeek = this.currentWeekSubject.value;
    const totalWeeks = this.getTotalWeeks();

    if (currentWeek >= totalWeeks) {
      this.isLeagueCompleteSubject.next(true);
      return;
    }

    const nextWeek = currentWeek + 1;
    this.currentWeekSubject.next(nextWeek);

    const matches = this.matchesSubject.value;
    const weekMatches = matches.filter((m) => m.week === nextWeek);

    // Play the matches
    weekMatches.forEach((match) => {
      this.playMatch(match);
    });

    // Update matches
    this.matchesSubject.next([...matches]);

    // Update standings
    this.updateStandings();

    // Update championship probabilities if we're after week 4
    if (nextWeek >= 4) {
      this.updateChampionshipProbabilities();
    }

    // Check if league is complete
    if (nextWeek >= totalWeeks) {
      this.isLeagueCompleteSubject.next(true);
    }
  }

  playEntireLeague(): void {
    const currentWeek = this.currentWeekSubject.value;
    const totalWeeks = this.getTotalWeeks();

    for (let week = currentWeek + 1; week <= totalWeeks; week++) {
      this.currentWeekSubject.next(week);

      const matches = this.matchesSubject.value;
      const weekMatches = matches.filter((m) => m.week === week);

      // Play the matches
      weekMatches.forEach((match) => {
        this.playMatch(match);
      });

      // Update standings
      this.updateStandings();

      // Update championship probabilities if we're after week 4
      if (week >= 4) {
        this.updateChampionshipProbabilities();
      }
    }

    // Update matches
    this.matchesSubject.next([...this.matchesSubject.value]);
    this.isLeagueCompleteSubject.next(true);
  }

  private playMatch(match: Match): void {
    const homeStrength = match.homeTeam.strength;
    const awayStrength = match.awayTeam.strength;

    // Calculate goals based on team strengths
    const homeAdvantage = 1.3; // Home advantage multiplier
    const randomFactor = 0.5; // Random factor to add unpredictability

    const homeGoalBase = (homeStrength / 20) * homeAdvantage;
    const awayGoalBase = awayStrength / 25;

    const homeGoals = Math.max(
      0,
      Math.floor(
        homeGoalBase * (1 + (Math.random() * randomFactor - randomFactor / 2)) +
          Math.random() * 2
      )
    );
    const awayGoals = Math.max(
      0,
      Math.floor(
        awayGoalBase * (1 + (Math.random() * randomFactor - randomFactor / 2)) +
          Math.random() * 1
      )
    );

    match.homeGoals = homeGoals;
    match.awayGoals = awayGoals;
    match.played = true;
    match.editable = true;
  }

  updateMatchResult(match: Match, homeGoals: number, awayGoals: number): void {
    const matches = this.matchesSubject.value;
    const matchIndex = matches.findIndex((m) => m.id === match.id);

    if (matchIndex !== -1 && matches[matchIndex].played) {
      matches[matchIndex].homeGoals = homeGoals;
      matches[matchIndex].awayGoals = awayGoals;
      this.matchesSubject.next([...matches]);
      this.updateStandings();

      if (this.currentWeekSubject.value >= 4) {
        this.updateChampionshipProbabilities();
      }

      this.checkChampionshipChances();
    }
  }

  updateTeamStrength(teamId: number, strength: number): void {
    const teams = this.teamsSubject.value;
    const teamIndex = teams.findIndex((t) => t.id === teamId);

    if (teamIndex !== -1) {
      teams[teamIndex].strength = strength;
      this.teamsSubject.next([...teams]);
    }
  }

  private updateStandings(): void {
    const teams = this.teamsSubject.value.map((team) => ({
      ...team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    }));

    const matches = this.matchesSubject.value.filter((m) => m.played);

    // Update team stats based on match results
    matches.forEach((match) => {
      const homeTeamIndex = teams.findIndex((t) => t.id === match.homeTeam.id);
      const awayTeamIndex = teams.findIndex((t) => t.id === match.awayTeam.id);

      if (
        homeTeamIndex !== -1 &&
        awayTeamIndex !== -1 &&
        match.homeGoals !== undefined &&
        match.awayGoals !== undefined
      ) {
        const homeGoals = match.homeGoals;
        const awayGoals = match.awayGoals;

        // Update home team stats
        teams[homeTeamIndex].played += 1;
        teams[homeTeamIndex].goalsFor += homeGoals;
        teams[homeTeamIndex].goalsAgainst += awayGoals;

        // Update away team stats
        teams[awayTeamIndex].played += 1;
        teams[awayTeamIndex].goalsFor += awayGoals;
        teams[awayTeamIndex].goalsAgainst += homeGoals;

        if (homeGoals > awayGoals) {
          // Home win
          teams[homeTeamIndex].won += 1;
          teams[homeTeamIndex].points += 3;
          teams[awayTeamIndex].lost += 1;
        } else if (homeGoals < awayGoals) {
          // Away win
          teams[awayTeamIndex].won += 1;
          teams[awayTeamIndex].points += 3;
          teams[homeTeamIndex].lost += 1;
        } else {
          // Draw
          teams[homeTeamIndex].drawn += 1;
          teams[homeTeamIndex].points += 1;
          teams[awayTeamIndex].drawn += 1;
          teams[awayTeamIndex].points += 1;
        }
      }
    });

    // Calculate goal difference
    teams.forEach((team) => {
      team.goalDifference = team.goalsFor - team.goalsAgainst;
    });

    // Sort teams by points, then goal difference, then goals scored, then alphabetically
    teams.sort((a, b) => {
      const pointsDiff = b.points - a.points;
      if (pointsDiff !== 0) return pointsDiff;

      const goalDiffDiff = (b.goalDifference || 0) - (a.goalDifference || 0);
      if (goalDiffDiff !== 0) return goalDiffDiff;

      const goalsDiff = b.goalsFor - a.goalsFor;
      if (goalsDiff !== 0) return goalsDiff;

      return a.name.localeCompare(b.name);
    });

    this.teamsSubject.next(teams);
    this.checkChampionshipChances();
  }

  private updateChampionshipProbabilities(): void {
    const teams = [...this.teamsSubject.value];
    const currentWeek = this.currentWeekSubject.value;
    const totalWeeks = this.getTotalWeeks();
    const remainingWeeks = totalWeeks - currentWeek;

    if (remainingWeeks === 0) {
      // League is over, set champion to 100% and others to 0%
      teams[0].championshipProbability = 100;
      for (let i = 1; i < teams.length; i++) {
        teams[i].championshipProbability = 0;
        teams[i].noChance = true;
        teams[i].hasChance = false;
      }
    } else {
      const maxPossiblePointsToGain = remainingWeeks * 3;

      // Find max points any team can achieve
      const leaderPoints = teams[0].points;

      teams.forEach((team) => {
        const maxPossiblePoints = team.points + maxPossiblePointsToGain;

        if (maxPossiblePoints < leaderPoints) {
          // Team has no chance to win
          team.championshipProbability = 0;
          team.noChance = true;
          team.hasChance = false;
        } else {
          // Calculate probability based on current points and remaining matches
          const pointsGap = leaderPoints - team.points;
          const strengthFactor = team.strength / 100; // Normalize strength to 0-1

          // Simple probability formula based on points gap and team strength
          let probability =
            100 *
            (1 - pointsGap / (maxPossiblePointsToGain + 1)) *
            strengthFactor;

          // Adjust for current position
          const positionPenalty = teams.indexOf(team) * 5;
          probability = Math.max(0, probability - positionPenalty);

          team.championshipProbability = Math.round(probability);
          team.noChance = false;
          team.hasChance = true;
        }
      });

      // Normalize probabilities to sum to 100%
      const totalProbability = teams.reduce(
        (sum, team) => sum + (team.championshipProbability || 0),
        0
      );
      if (totalProbability > 0) {
        teams.forEach((team) => {
          team.championshipProbability = Math.round(
            ((team.championshipProbability || 0) * 100) / totalProbability
          );
        });
      }
    }

    this.teamsSubject.next([...teams]);
  }

  private checkChampionshipChances(): void {
    const teams = this.teamsSubject.value;
    const currentWeek = this.currentWeekSubject.value;
    const totalWeeks = this.getTotalWeeks();
    const remainingWeeks = totalWeeks - currentWeek;

    if (remainingWeeks <= 0) return;

    const maxPossiblePointsToGain = remainingWeeks * 3;
    const leaderPoints = teams[0].points;

    teams.forEach((team) => {
      if (team.points + maxPossiblePointsToGain < leaderPoints) {
        team.hasChance = false;
        team.noChance = true;
      } else {
        team.hasChance = true;
        team.noChance = false;
      }
    });

    this.teamsSubject.next([...teams]);
  }

  getCurrentWeekMatches(): Observable<Match[]> {
    return this.currentWeek$.pipe(
      map((week) => {
        return this.matchesSubject.value.filter((m) => m.week === week);
      })
    );
  }

  getWeekMatches(week: number): Match[] {
    return this.matchesSubject.value.filter((m) => m.week === week);
  }

  getAllPlayedMatches(): Match[] {
    return this.matchesSubject.value.filter((m) => m.played);
  }

  getPlayedWeeks(): Week[] {
    const matches = this.matchesSubject.value;
    const currentWeek = this.currentWeekSubject.value;
    const weeks: Week[] = [];

    for (let i = 1; i <= currentWeek; i++) {
      const weekMatches = matches.filter((m) => m.week === i);
      if (weekMatches.some((m) => m.played)) {
        weeks.push({
          weekNumber: i,
          matches: weekMatches,
        });
      }
    }

    return weeks;
  }

  getTotalWeeks(): number {
    const teams = this.teamsSubject.value;
    return (teams.length - 1) * 2;
  }

  isLeagueFinished(): boolean {
    return this.currentWeekSubject.value >= this.getTotalWeeks();
  }

  getChampion(): Team | null {
    const teams = this.teamsSubject.value;
    return teams.length > 0 ? teams[0] : null;
  }

  // Add a method to get league name by ID
  getLeagueName(leagueId: string): string {
    const league = this.getLeagueById(leagueId);
    return league ? league.name : 'Custom League';
  }
}
