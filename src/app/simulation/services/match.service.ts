import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  Match,
  SimulatedLeague,
  SimulationState,
} from '@/simulation/models/league.models';
import { SimulationService } from './simulation.service';

@Injectable({
  providedIn: 'root',
})
export class MatchService {
  private matchesSubject = new BehaviorSubject<Match[]>([]);
  public matches$ = this.matchesSubject.asObservable();

  // Store the current state for synchronous access
  private currentState: SimulationState | null = null;

  constructor(private simulationService: SimulationService) {
    // Extract all matches whenever the simulation state changes
    this.simulationService.simulationState$.subscribe((state) => {
      this.currentState = state;
      if (state && state.simulatedLeagues) {
        const allMatches = this.extractAllMatches(state.simulatedLeagues);
        this.matchesSubject.next(allMatches);
      } else {
        this.matchesSubject.next([]);
      }
    });
  }

  private extractAllMatches(leagues: SimulatedLeague[]): Match[] {
    // Create an array of matches from all leagues
    const allMatches: Match[] = [];

    leagues.forEach((league) => {
      league.fixtures.forEach((round) => {
        round.matches.forEach((match) => {
          allMatches.push(match);
        });
      });
    });

    return allMatches;
  }

  getAllMatches(): Match[] {
    return this.matchesSubject.value;
  }

  getAllPlayedMatches(): Match[] {
    return this.getAllMatches().filter((match) => match.played);
  }

  getMatchesByLeague(leagueId: string): Match[] {
    if (!this.currentState) return [];

    const league = this.currentState.simulatedLeagues.find(
      (l) => l.leagueId === leagueId
    );
    if (!league) return [];

    return league.fixtures.flatMap((round) => round.matches);
  }

  getMatchesByLeagueAndMatchday(leagueId: string, matchday: number): Match[] {
    if (!this.currentState) return [];

    const league = this.currentState.simulatedLeagues.find(
      (l) => l.leagueId === leagueId
    );
    if (!league) return [];

    const round = league.fixtures.find((r) => r.roundNumber === matchday);
    return round ? round.matches : [];
  }

  getMatchesByTeam(teamId: string): Match[] {
    return this.getAllMatches().filter(
      (match) => match.homeTeamId === teamId || match.awayTeamId === teamId
    );
  }

  getMatchById(matchId: string): Match | undefined {
    return this.getAllMatches().find((match) => match.id === matchId);
  }

  getH2HMatches(team1Id: string, team2Id: string): Match[] {
    return this.getAllMatches().filter(
      (match) =>
        (match.homeTeamId === team1Id && match.awayTeamId === team2Id) ||
        (match.homeTeamId === team2Id && match.awayTeamId === team1Id)
    );
  }

  getRecentMatches(count: number = 10): Match[] {
    // Get most recent matches based on matchday
    return [...this.getAllPlayedMatches()]
      .sort((a, b) => {
        // Sort by most recent round first
        if (a.roundNumber !== b.roundNumber)
          return b.roundNumber - a.roundNumber;
        // If same round, sort by match ID
        return a.id.localeCompare(b.id);
      })
      .slice(0, count);
  }

  // Observable-based methods for reactive components
  getMatchesByLeague$(leagueId: string): Observable<Match[]> {
    return this.simulationService.simulationState$.pipe(
      map((state) => {
        if (!state) return [];
        const league = state.simulatedLeagues.find(
          (l) => l.leagueId === leagueId
        );
        if (!league) return [];
        return league.fixtures.flatMap((round) => round.matches);
      })
    );
  }

  getMatchesByLeagueAndMatchday$(
    leagueId: string,
    matchday: number
  ): Observable<Match[]> {
    return this.simulationService.simulationState$.pipe(
      map((state) => {
        if (!state) return [];
        const league = state.simulatedLeagues.find(
          (l) => l.leagueId === leagueId
        );
        if (!league) return [];
        const round = league.fixtures.find((r) => r.roundNumber === matchday);
        return round ? round.matches : [];
      })
    );
  }
}
