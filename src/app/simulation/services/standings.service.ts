import { Injectable } from '@angular/core';
import { Match, Standing, Team, Tiebreaker } from '../models/league.models';
import { DataService } from './data.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StandingsService {
  constructor(private dataService: DataService) {}

  calculateStandings(teamIds: string[], matches: Match[]): Standing[] {
    // Initialize standings for all teams
    const standings: Standing[] = teamIds.map((teamId) => ({
      teamId,
      position: 0, // Will be set later
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    }));

    // Process played matches
    const playedMatches = matches.filter((m) => m.played);

    for (const match of playedMatches) {
      const homeStanding = standings.find((s) => s.teamId === match.homeTeamId);
      const awayStanding = standings.find((s) => s.teamId === match.awayTeamId);
      if (
        !homeStanding ||
        !awayStanding ||
        match.homeGoals === undefined ||
        match.awayGoals === undefined
      ) {
        continue;
      }
      // Update home team standings
      homeStanding.played++;
      homeStanding.goalsFor += match.homeGoals;
      homeStanding.goalsAgainst += match.awayGoals;
      // Update away team standings
      awayStanding.played++;
      awayStanding.goalsFor += match.awayGoals;
      awayStanding.goalsAgainst += match.homeGoals;
      // Update match outcome (win/draw/loss)
      if (match.homeGoals > match.awayGoals) {
        // Home win
        homeStanding.won++;
        homeStanding.points += 3;
        awayStanding.lost++;
      } else if (match.homeGoals < match.awayGoals) {
        // Away win
        homeStanding.lost++;
        awayStanding.won++;
        awayStanding.points += 3;
      } else {
        // Draw
        homeStanding.drawn++;
        homeStanding.points += 1;
        awayStanding.drawn++;
        awayStanding.points += 1;
      }
    }

    // Calculate goal differences
    standings.forEach((s) => {
      s.goalDifference = s.goalsFor - s.goalsAgainst;
    });

    // Get teams for alphabetical sorting
    const teams: Team[] = [];

    this.dataService.teams$
      .subscribe((allTeams) => {
        teams.push(...allTeams);
      })
      .unsubscribe(); // Use and immediately unsubscribe

    // Sort standings
    const sortedStandings = [...standings].sort((a, b) => {
      // Points (higher is better)
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      // Goal difference (higher is better)
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }

      // Goals for (higher is better)
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }

      // Alphabetical (by team name)
      const teamA = teams.find((t) => t.id === a.teamId);
      const teamB = teams.find((t) => t.id === b.teamId);
      return (teamA?.name || '').localeCompare(teamB?.name || '');
    });

    // Assign positions
    sortedStandings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return sortedStandings;
  }

  async sortStandings(
    standings: Standing[],
    matches: Match[],
    tiebreakers: Tiebreaker[]
  ): Promise<Standing[]> {
    // Get all teams for alphabetical sorting if needed
    const teams = await firstValueFrom(this.dataService.teams$);

    return [...standings].sort((a, b) => {
      for (const tiebreaker of tiebreakers) {
        let comparison = 0;

        switch (tiebreaker) {
          case Tiebreaker.Points:
            comparison = b.points - a.points;
            break;
          case Tiebreaker.GoalDifference:
            comparison = b.goalDifference - a.goalDifference;
            break;
          case Tiebreaker.GoalsFor:
            comparison = b.goalsFor - a.goalsFor;
            break;
          case Tiebreaker.HeadToHead:
            comparison = this.compareHeadToHead(a.teamId, b.teamId, matches);
            break;
          case Tiebreaker.Alphabetical:
            const teamA = teams.find((t) => t.id === a.teamId);
            const teamB = teams.find((t) => t.id === b.teamId);
            comparison = (teamA?.name || '').localeCompare(teamB?.name || '');
            break;
        }

        if (comparison !== 0) {
          return comparison;
        }
      }

      return 0;
    });
  }

  private compareHeadToHead(
    teamAId: string,
    teamBId: string,
    matches: Match[]
  ): number {
    const headToHeadMatches = matches.filter(
      (m) =>
        m.played &&
        ((m.homeTeamId === teamAId && m.awayTeamId === teamBId) ||
          (m.homeTeamId === teamBId && m.awayTeamId === teamAId))
    );

    if (headToHeadMatches.length === 0) {
      return 0;
    }

    let teamAPoints = 0;
    let teamBPoints = 0;

    for (const match of headToHeadMatches) {
      if (match.homeGoals === undefined || match.awayGoals === undefined)
        continue;

      if (match.homeTeamId === teamAId) {
        if (match.homeGoals > match.awayGoals) {
          teamAPoints += 3;
        } else if (match.homeGoals < match.awayGoals) {
          teamBPoints += 3;
        } else {
          teamAPoints += 1;
          teamBPoints += 1;
        }
      } else {
        if (match.homeGoals > match.awayGoals) {
          teamBPoints += 3;
        } else if (match.homeGoals < match.awayGoals) {
          teamAPoints += 3;
        } else {
          teamAPoints += 1;
          teamBPoints += 1;
        }
      }
    }

    return teamBPoints - teamAPoints;
  }

  calculateChampionshipChances(
    standings: Standing[],
    remainingMatches: number
  ): Standing[] {
    if (remainingMatches === 0) {
      // Season is over, champion is determined
      return standings.map((s) => ({
        ...s,
        championshipChance: s.position === 1 ? 100 : 0,
        hasChampionshipChance: s.position === 1,
      }));
    }

    // Max points any team can get
    const updatedStandings = standings.map((s) => {
      const maxPossiblePoints = s.points + remainingMatches * 3;
      const currentLeader = standings[0];
      const hasChance = maxPossiblePoints >= currentLeader.points;

      // Simple chance calculation based on current points and position
      let chance = 0;
      if (hasChance) {
        // Simple formula: normalize current points as percentage of max possible
        const pointsNeeded = currentLeader.points - s.points;
        const maxPointsAvailable = remainingMatches * 3;
        chance = Math.max(0, 100 - (pointsNeeded / maxPointsAvailable) * 100);

        // Adjust by position - higher positions have better chances
        chance = chance * (1 - (s.position - 1) * 0.05);
      }
      return {
        ...s,
        hasChampionshipChance: hasChance,
        championshipChance: Math.round(chance),
      };
    });

    // Normalize chances to sum to 100%
    const totalChances = updatedStandings.reduce(
      (sum, s) => sum + (s.championshipChance || 0),
      0
    );
    if (totalChances > 0) {
      return updatedStandings.map((s) => ({
        ...s,
        championshipChance: Math.round(
          ((s.championshipChance || 0) * 100) / totalChances
        ),
      }));
    }
    return updatedStandings;
  }
}
