import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import {
  Match,
  SeasonHistory,
  SimulatedLeague,
  SimulationState,
  UEFACompetition,
} from '@/simulation/models/league.models';
import { DataService } from './data.service';
import { FixtureService } from './fixture.service';
import { MatchSimulationService } from './match-simulation.service';
import { StandingsService } from './standings.service';
import { QualificationService } from './qualification.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class SimulationService {
  private _simulationState = new BehaviorSubject<SimulationState | null>(null);
  simulationState$ = this._simulationState.asObservable();

  private _seasonHistory = new BehaviorSubject<SeasonHistory[]>([]);
  seasonHistory$ = this._seasonHistory.asObservable();

  constructor(
    private dataService: DataService,
    private fixtureService: FixtureService,
    private matchSimulationService: MatchSimulationService,
    private standingsService: StandingsService,
    private qualificationService: QualificationService
  ) {}

  async playNextRound(leagueId?: string): Promise<void> {
    const state = this._simulationState.value;

    if (!state) return;
    // Always play all leagues, regardless of which leagueId is provided
    const leaguesToUpdate = state.simulatedLeagues;
    const updatedLeagues: SimulatedLeague[] = [];

    // Process each league
    for (const league of leaguesToUpdate) {
      if (!league.isFinished) {
        // Play next round if not finished
        const updatedLeague = await this.simulateNextRound(league);
        updatedLeagues.push(updatedLeague);
      } else {
        updatedLeagues.push(league);
      }
    }
    // Check if all leagues are finished
    const allFinished = updatedLeagues.every((l) => l.isFinished);
    // Update state
    this._simulationState.next({
      ...state,
      simulatedLeagues: updatedLeagues,
      isSeasonFinished: allFinished,
    });
    // If season finished, save history
    if (allFinished) {
      await this.saveSeasonHistory();
    }
  }

  async startNewSeason(
    countryId: string,
    selectedLeagueIds: string[]
  ): Promise<void> {
    // Reset any existing simulation
    const seasonId = uuidv4();
    const simulatedLeagues: SimulatedLeague[] = [];

    // Get country data
    const country = await firstValueFrom(
      this.dataService.getCountry(countryId)
    );
    if (!country) {
      throw new Error(`Country with ID ${countryId} not found`);
    }

    // Get all connected leagues (parent/sub leagues)
    const allLeagueIds = new Set(selectedLeagueIds);
    const allLeagues = await firstValueFrom(this.dataService.leagues$);

    // Find parent leagues
    for (const leagueId of selectedLeagueIds) {
      const league = allLeagues.find((l) => l.id === leagueId);
      if (league?.parentLeagueId) {
        allLeagueIds.add(league.parentLeagueId);
      }
    }

    // Find sub leagues
    for (const leagueId of selectedLeagueIds) {
      const league = allLeagues.find((l) => l.id === leagueId);
      if (league?.subLeagueId) {
        allLeagueIds.add(league.subLeagueId);
      }
    }

    // Process each league
    for (const leagueId of Array.from(allLeagueIds)) {
      const league = allLeagues.find((l) => l.id === leagueId);
      if (!league) continue;

      // Get team IDs from the league data
      const teamIds = league.teamIds;

      if (!teamIds || teamIds.length < 2) {
        continue; // Skip if not enough teams
      }

      // Get actual team objects for fixture generation
      const allTeams = await firstValueFrom(this.dataService.teams$);
      const leagueTeams = allTeams.filter((t) => teamIds.includes(t.id));

      if (leagueTeams.length < 2) {
        continue; // Skip if not enough teams found
      }

      // Generate fixtures
      const fixtures = this.fixtureService.generateFixtures(leagueTeams);

      // Create initial standings
      const initialStandings = this.standingsService.calculateStandings(
        teamIds,
        []
      );

      // Add to simulated leagues
      simulatedLeagues.push({
        leagueId: league.id,
        name: league.name,
        level: league.parentLeagueId ? 2 : 1,
        teamIds,
        standings: initialStandings,
        fixtures,
        currentRoundIndex: 0,
        isFinished: false,
      });
    }

    // Create simulation state
    const newState: SimulationState = {
      seasonId,
      countryId,
      simulatedLeagues,
      isSeasonFinished: false,
    };

    this._simulationState.next(newState);
  }

  async playEntireSeason(): Promise<void> {
    const state = this._simulationState.value;
    if (!state) return;

    // Keep playing rounds until all leagues are finished
    let currentState = { ...state };

    while (!currentState.isSeasonFinished) {
      const updatedLeagues: SimulatedLeague[] = [];

      for (const league of currentState.simulatedLeagues) {
        if (!league.isFinished) {
          const updatedLeague = await this.simulateNextRound(league);
          updatedLeagues.push(updatedLeague);
        } else {
          updatedLeagues.push(league);
        }
      }

      const allFinished = updatedLeagues.every((l) => l.isFinished);

      currentState = {
        ...currentState,
        simulatedLeagues: updatedLeagues,
        isSeasonFinished: allFinished,
      };
    }

    // Update final state
    this._simulationState.next(currentState);

    // Save season history
    await this.saveSeasonHistory();
  }

  async startNextSeason(): Promise<void> {
    const state = this._simulationState.value;
    if (!state || !state.isSeasonFinished) return;

    // Process promotions and relegations
    const updatedLeagues = await this.processEndOfSeasonMovements();

    // Start new season with updated leagues
    const newSeasonId = uuidv4();
    const newState: SimulationState = {
      seasonId: newSeasonId,
      countryId: state.countryId,
      simulatedLeagues: updatedLeagues.map((league) => {
        // Generate new fixtures for the teams
        const teams = league.teamIds.map((id) => ({
          id,
          name: '',
          strength: 0,
          teamCode: '',
          countryId: '',
        }));
        const fixtures = this.fixtureService.generateFixtures(teams);

        return {
          ...league,
          fixtures,
          currentRoundIndex: 0,
          isFinished: false,
          standings: this.standingsService.calculateStandings(
            league.teamIds,
            []
          ),
        };
      }),
      isSeasonFinished: false,
    };

    this._simulationState.next(newState);
  }

  async updateMatchResult(
    leagueId: string,
    matchId: string,
    homeGoals: number,
    awayGoals: number
  ): Promise<void> {
    const state = this._simulationState.value;
    if (!state) return;

    // Find the league and match
    const leagueIndex = state.simulatedLeagues.findIndex(
      (l) => l.leagueId === leagueId
    );
    if (leagueIndex === -1) return;

    const league = state.simulatedLeagues[leagueIndex];
    let matchFound = false;

    // Update match across all rounds
    const updatedFixtures = league.fixtures.map((round) => {
      const updatedMatches = round.matches.map((match) => {
        if (match.id === matchId) {
          matchFound = true;
          return this.matchSimulationService.updateMatchResult(
            match,
            homeGoals,
            awayGoals
          );
        }
        return match;
      });

      return { ...round, matches: updatedMatches };
    });

    if (!matchFound) return;

    // Recalculate standings
    const allMatches = updatedFixtures.flatMap((r) => r.matches);
    const updatedStandings = this.standingsService.calculateStandings(
      league.teamIds,
      allMatches
    );

    // Update championship chances
    const remainingMatches = allMatches.filter((m) => !m.played).length;
    const standingsWithChances =
      this.standingsService.calculateChampionshipChances(
        updatedStandings,
        remainingMatches
      );

    // Create updated league
    const updatedLeague: SimulatedLeague = {
      ...league,
      fixtures: updatedFixtures,
      standings: standingsWithChances,
    };

    // Update state with new league
    const updatedLeagues = [...state.simulatedLeagues];
    updatedLeagues[leagueIndex] = updatedLeague;

    this._simulationState.next({
      ...state,
      simulatedLeagues: updatedLeagues,
    });
  }

  private async simulateNextRound(
    league: SimulatedLeague
  ): Promise<SimulatedLeague> {
    if (
      league.isFinished ||
      league.currentRoundIndex >= league.fixtures.length
    ) {
      return { ...league, isFinished: true };
    }

    // Get current round
    const currentRound = league.fixtures[league.currentRoundIndex];

    // Simulate each match in the round
    const simulatedMatches: Match[] = [];
    for (const match of currentRound.matches) {
      const simulatedMatch = await this.matchSimulationService.simulateMatch(
        match
      );
      simulatedMatches.push(simulatedMatch);
    }

    // Update the fixtures
    const updatedFixtures = [...league.fixtures];
    updatedFixtures[league.currentRoundIndex] = {
      ...currentRound,
      matches: simulatedMatches,
    };

    // Recalculate standings
    const allMatches = updatedFixtures.flatMap((r) => r.matches);
    const updatedStandings = this.standingsService.calculateStandings(
      league.teamIds,
      allMatches
    );

    // Check if this was the last round
    const isFinished = league.currentRoundIndex === league.fixtures.length - 1;

    // Calculate championship chances if not finished
    const remainingMatches = isFinished
      ? 0
      : (league.fixtures.length - league.currentRoundIndex - 1) *
        (league.teamIds.length / 2);
    const standingsWithChances =
      this.standingsService.calculateChampionshipChances(
        updatedStandings,
        remainingMatches
      );

    // Return updated league
    return {
      ...league,
      fixtures: updatedFixtures,
      standings: standingsWithChances,
      currentRoundIndex: league.currentRoundIndex + 1,
      isFinished,
    };
  }

  private async saveSeasonHistory(): Promise<void> {
    const state = this._simulationState.value;
    if (!state) return;

    const seasonHistories: SeasonHistory[] = [];

    // Get necessary data
    const leagues = await firstValueFrom(this.dataService.leagues$);

    // Process each league
    for (const simLeague of state.simulatedLeagues) {
      const league = leagues.find((l) => l.id === simLeague.leagueId);
      if (!league) continue;

      // Get champion
      const champion = simLeague.standings.find((s) => s.position === 1);

      // Calculate promotions and relegations
      let promotedTeamIds: string[] = [];
      let relegatedTeamIds: string[] = [];
      let uefaQualifiers: {
        competition: UEFACompetition;
        teamIds: string[];
      }[] = [];

      if (league.rules) {
        // Promotions
        if (league.rules.promotions) {
          promotedTeamIds = this.qualificationService.calculatePromotions(
            simLeague.standings,
            league.rules.promotions
          );
        }

        // Relegations
        if (league.rules.relegations) {
          relegatedTeamIds = this.qualificationService.calculateRelegations(
            simLeague.standings,
            league.rules.relegations
          );
        }

        // UEFA qualifications
        if (league.rules.uefaQualifications) {
          const qualifiers = this.qualificationService.calculateUEFAQualifiers(
            simLeague.standings,
            league.rules.uefaQualifications
          );

          uefaQualifiers = Array.from(qualifiers.entries()).map(
            ([competition, teamIds]) => ({
              competition,
              teamIds,
            })
          );
        }
      }

      // Create season history
      seasonHistories.push({
        id: uuidv4(),
        seasonId: state.seasonId,
        leagueId: simLeague.leagueId,
        championTeamId: champion?.teamId || null,
        promotedTeamIds,
        relegatedTeamIds,
        uefaQualifiers,
        standings: simLeague.standings,
        rounds: simLeague.fixtures,
      });
    }

    // Update history
    const existingHistory = this._seasonHistory.value;
    this._seasonHistory.next([...existingHistory, ...seasonHistories]);
  }

  private async processEndOfSeasonMovements(): Promise<SimulatedLeague[]> {
    const state = this._simulationState.value;
    if (!state) return [];

    const leagues = await firstValueFrom(this.dataService.leagues$);
    const updatedLeagues: SimulatedLeague[] = [];

    // For each league, process promotions and relegations
    for (const simLeague of state.simulatedLeagues) {
      const league = leagues.find((l) => l.id === simLeague.leagueId);
      if (!league) continue;

      // Start with existing teams
      let updatedTeamIds = [...simLeague.teamIds];

      // Process relegations
      if (league.rules.relegations) {
        const relegatedTeamIds = this.qualificationService.calculateRelegations(
          simLeague.standings,
          league.rules.relegations
        );

        // Remove relegated teams
        updatedTeamIds = updatedTeamIds.filter(
          (id) => !relegatedTeamIds.includes(id)
        );

        // If there's a lower league, send teams there
        if (league.subLeagueId) {
          const lowerLeague = state.simulatedLeagues.find(
            (l) => l.leagueId === league.subLeagueId
          );
          if (lowerLeague) {
            // Add relegated teams to lower league
            const lowerLeagueUpdated = {
              ...lowerLeague,
              teamIds: [...lowerLeague.teamIds, ...relegatedTeamIds],
            };
            updatedLeagues.push(lowerLeagueUpdated);
          }
        }
      }

      // Process promotions from lower league
      if (league.subLeagueId) {
        const lowerLeague = state.simulatedLeagues.find(
          (l) => l.leagueId === league.subLeagueId
        );
        if (lowerLeague) {
          const lowerLeagueObj = leagues.find(
            (l) => l.id === lowerLeague.leagueId
          );
          if (lowerLeagueObj?.rules.promotions) {
            const promotedTeamIds =
              this.qualificationService.calculatePromotions(
                lowerLeague.standings,
                lowerLeagueObj.rules.promotions
              );
            // Add promoted teams to this league
            updatedTeamIds = [...updatedTeamIds, ...promotedTeamIds];
          }
        }
      }
      // Add updated league to list (if not already added)
      if (!updatedLeagues.some((l) => l.leagueId === simLeague.leagueId)) {
        updatedLeagues.push({
          ...simLeague,
          teamIds: updatedTeamIds,
        });
      }
    }
    return updatedLeagues;
  }

  getSeasonHistory(
    seasonId: string,
    leagueId: string
  ): Observable<SeasonHistory | undefined> {
    return new Observable((observer) => {
      const history = this._seasonHistory.value.find(
        (h) => h.seasonId === seasonId && h.leagueId === leagueId
      );
      observer.next(history);
      observer.complete();
    });
  }
  saveCurrentSimulation(): void {
    const state = this._simulationState.value;

    if (state) {
      this.dataService.saveSimulation(state);
    }
  }

  loadSavedSimulation(): boolean {
    const { state, timestamp } = this.dataService.loadSimulation();

    if (state) {
      this._simulationState.next(state);
      return true;
    }

    return false;
  }

  clearSavedSimulation(): void {
    this.dataService.clearSavedSimulation();
  }
}
