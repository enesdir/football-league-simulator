import { Injectable } from '@angular/core';
import { Match, Standing, Team } from '@/simulation/models/league.models';

export interface Scorer {
  id: string;
  name: string;
  teamId: string;
  goals: number;
}

export interface FormRecord {
  teamId: string;
  results: ('W' | 'D' | 'L')[];
  points: number;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'card' | 'substitution';
  team: 'home' | 'away';
  teamName: string;
  scoreLine: string;
  player?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  generateTopScorers(matches: Match[], teams: Team[]): Scorer[] {
    // Here we'll simulate by creating fictional players for each team
    // Create a map of team IDs to team names
    const teamMap = new Map<string, string>();
    teams.forEach((team) => teamMap.set(team.id, team.name));

    // Create fictional players for each team
    const players: Record<
      string,
      { name: string; teamId: string; goals: number }
    > = {};

    teams.forEach((team) => {
      // Create 3 players per team
      for (let i = 1; i <= 3; i++) {
        const playerId = `${team.id}-player-${i}`;
        const position = i === 1 ? 'FW' : i === 2 ? 'MF' : 'DF';
        players[playerId] = {
          name: `${position} ${team.name.split(' ')[0]} ${i}`,
          teamId: team.id,
          goals: 0,
        };
      }
    });

    // Distribute goals among players
    matches
      .filter(
        (m) =>
          m.played && m.homeGoals !== undefined && m.awayGoals !== undefined
      )
      .forEach((match) => {
        // Home team goals
        this.distributeGoals(match.homeTeamId, match.homeGoals || 0, players);

        // Away team goals
        this.distributeGoals(match.awayTeamId, match.awayGoals || 0, players);
      });

    // Convert to array and sort by goals
    return Object.entries(players)
      .map(([id, player]) => ({
        id,
        name: player.name,
        teamId: player.teamId,
        goals: player.goals,
      }))
      .filter((player) => player.goals > 0)
      .sort((a, b) => b.goals - a.goals)
      .slice(0, 10); // Top 10 scorers
  }

  private distributeGoals(
    teamId: string,
    goals: number,
    players: Record<string, any>
  ): void {
    // Get players for this team
    const teamPlayers = Object.entries(players)
      .filter(([_, player]) => player.teamId === teamId)
      .map(([id, _]) => id);

    if (teamPlayers.length === 0) return;

    // Distribute goals randomly among team players
    for (let i = 0; i < goals; i++) {
      const randomIndex = Math.floor(Math.random() * teamPlayers.length);
      const playerId = teamPlayers[randomIndex];
      players[playerId].goals++;
    }
  }

  generateFormGuide(matches: Match[], standings: Standing[]): FormRecord[] {
    // Get the last 5 matches for each team
    const teamMatches: Record<string, Match[]> = {};

    // Initialize for all teams in standings
    standings.forEach((standing) => {
      teamMatches[standing.teamId] = [];
    });

    // Only consider played matches
    const playedMatches = matches.filter(
      (m) => m.played && m.homeGoals !== undefined && m.awayGoals !== undefined
    );

    // Sort by round number (descending to get most recent first)
    playedMatches.sort((a, b) => b.roundNumber - a.roundNumber);

    // Add matches to each team's record
    playedMatches.forEach((match) => {
      // Add to home team's matches
      if (
        teamMatches[match.homeTeamId] &&
        teamMatches[match.homeTeamId].length < 5
      ) {
        teamMatches[match.homeTeamId].push(match);
      }

      // Add to away team's matches
      if (
        teamMatches[match.awayTeamId] &&
        teamMatches[match.awayTeamId].length < 5
      ) {
        teamMatches[match.awayTeamId].push(match);
      }
    });

    // Convert to form records
    const formRecords: FormRecord[] = [];

    standings.forEach((standing) => {
      const results: ('W' | 'D' | 'L')[] = [];
      let formPoints = 0;

      teamMatches[standing.teamId].forEach((match) => {
        let result: 'W' | 'D' | 'L';

        if (match.homeGoals === match.awayGoals) {
          result = 'D';
          formPoints += 1;
        } else if (match.homeTeamId === standing.teamId) {
          // Team was home
          result = match.homeGoals! > match.awayGoals! ? 'W' : 'L';
          formPoints += result === 'W' ? 3 : 0;
        } else {
          // Team was away
          result = match.awayGoals! > match.homeGoals! ? 'W' : 'L';
          formPoints += result === 'W' ? 3 : 0;
        }

        results.push(result);
      });

      formRecords.push({
        teamId: standing.teamId,
        results,
        points: formPoints,
      });
    });

    // Sort by form points
    return formRecords.sort((a, b) => b.points - a.points);
  }

  generateMatchEvents(
    match: Match,
    homeTeamName: string,
    awayTeamName: string
  ): MatchEvent[] {
    if (
      !match.played ||
      match.homeGoals === undefined ||
      match.awayGoals === undefined
    ) {
      return [];
    }

    const events: MatchEvent[] = [];
    const totalGoals = match.homeGoals + match.awayGoals;

    // Generate random goal minutes
    const minutes = Array.from(
      { length: totalGoals },
      () => Math.floor(Math.random() * 90) + 1
    ).sort((a, b) => a - b);

    // Assign goals to teams
    let homeGoals = 0;
    let awayGoals = 0;

    minutes.forEach((minute) => {
      const isHomeGoal = homeGoals < match.homeGoals!;
      const isAwayGoal = awayGoals < match.awayGoals!;

      // If both teams still have goals to score, randomly assign
      // Otherwise, assign to the team that still needs goals
      let scoringTeam;
      if (isHomeGoal && isAwayGoal) {
        scoringTeam = Math.random() > 0.5 ? 'home' : 'away';
      } else if (isHomeGoal) {
        scoringTeam = 'home';
      } else {
        scoringTeam = 'away';
      }

      if (scoringTeam === 'home') {
        homeGoals++;
        events.push({
          minute,
          type: 'goal',
          team: 'home',
          teamName: homeTeamName,
          scoreLine: `${homeGoals}-${awayGoals}`,
        });
      } else {
        awayGoals++;
        events.push({
          minute,
          type: 'goal',
          team: 'away',
          teamName: awayTeamName,
          scoreLine: `${homeGoals}-${awayGoals}`,
        });
      }
    });

    return events;
  }
}
