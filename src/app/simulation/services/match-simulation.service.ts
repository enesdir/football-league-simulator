import { inject, Injectable } from '@angular/core';
import { Match, Team } from '@/simulation/models/league.models';
import { DataService } from './data.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MatchSimulationService {
  dataService = inject(DataService);

  async simulateMatch(match: Match): Promise<Match> {
    // Skip already played matches unless they're edited
    if (match.played && !match.isEdited) {
      return match;
    }

    const homeTeam = await firstValueFrom(
      this.dataService.getTeam(match.homeTeamId)
    );
    const awayTeam = await firstValueFrom(
      this.dataService.getTeam(match.awayTeamId)
    );

    if (!homeTeam || !awayTeam) {
      throw new Error('Teams not found for match simulation');
    }

    const result = this.calculateMatchResult(homeTeam, awayTeam);

    return {
      ...match,
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
      played: true,
      isEdited: false,
      strengthDifference: homeTeam.strength - awayTeam.strength,
    };
  }

  private calculateMatchResult(
    homeTeam: Team,
    awayTeam: Team
  ): { homeGoals: number; awayGoals: number } {
    // Base expected goals based on team strength (0-100 scale)
    const homeExpectedGoals = homeTeam.strength / 20; // 0-5 range
    const awayExpectedGoals = (awayTeam.strength / 20) * 0.8; // Away teams score 20% less

    // Add home advantage
    const homeAdvantage = 0.5; // Half a goal advantage for home team

    // Add randomness
    const homeRandomness = Math.random() * 2 - 0.5; // -0.5 to 1.5
    const awayRandomness = Math.random() * 2 - 0.5; // -0.5 to 1.5

    // Calculate final expected goals
    const finalHomeExpected =
      homeExpectedGoals + homeAdvantage + homeRandomness;
    const finalAwayExpected = awayExpectedGoals + awayRandomness;

    // Convert to actual goals using Poisson distribution approximation
    const homeGoals = this.poissonRandom(finalHomeExpected);
    const awayGoals = this.poissonRandom(finalAwayExpected);

    return { homeGoals, awayGoals };
  }
  private poissonRandom(expected: number): number {
    const L = Math.exp(-expected);
    let p = 1.0;
    let k = 0;

    do {
      k++;
      p *= Math.random();
    } while (p > L);

    return k - 1;
  }

  // Edit a match result manually
  updateMatchResult(match: Match, homeGoals: number, awayGoals: number): Match {
    return {
      ...match,
      homeGoals,
      awayGoals,
      played: true,
      isEdited: true,
    };
  }
}
