import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  Country,
  League,
  Team,
  CupCompetition,
  SimulationState,
} from '@/simulation/models/league.models';
import { BrowserStorageService } from '@/core/services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private http = inject(HttpClient);
  private storage = inject(BrowserStorageService);

  private _countries = new BehaviorSubject<Country[]>([]);
  private _leagues = new BehaviorSubject<League[]>([]);
  private _teams = new BehaviorSubject<Team[]>([]);
  private _cups = new BehaviorSubject<CupCompetition[]>([]);

  // Storage keys
  private readonly STATE_KEY = 'football-sim-state';
  private readonly TIMESTAMP_KEY = 'football-sim-timestamp';

  countries$ = this._countries.asObservable();
  leagues$ = this._leagues.asObservable();
  teams$ = this._teams.asObservable();
  cups$ = this._cups.asObservable();

  private dataLoaded = false;

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    if (this.dataLoaded) return;

    forkJoin({
      countries: this.http.get<Country[]>('assets/data/countries.json'),
      leagues: this.http.get<League[]>('assets/data/leagues.json'),
      teams: this.http.get<Team[]>('assets/data/teams.json'),
      cups: this.http.get<CupCompetition[]>('assets/data/cups.json'),
    }).subscribe((data) => {
      this._countries.next(data.countries);
      this._leagues.next(data.leagues);
      this._teams.next(data.teams);
      this._cups.next(data.cups);
      this.dataLoaded = true;
    });
  }

  getCountry(id: string): Observable<Country | undefined> {
    return this.countries$.pipe(
      map((countries) => countries.find((c) => c.id === id))
    );
  }

  getLeague(id: string): Observable<League | undefined> {
    return this.leagues$.pipe(
      map((leagues) => leagues.find((l) => l.id === id))
    );
  }

  getTeam(id: string): Observable<Team | undefined> {
    return this.teams$.pipe(map((teams) => teams.find((t) => t.id === id)));
  }

  getLeaguesByCountry(countryId: string): Observable<League[]> {
    return this.leagues$.pipe(
      map((leagues) => leagues.filter((l) => l.countryId === countryId))
    );
  }

  getTeamsByLeague(leagueId: string): Observable<Team[]> {
    return forkJoin([this.getLeague(leagueId), this.teams$]).pipe(
      map(([league, teams]) => {
        if (!league) return [];
        return teams.filter((team) => league.teamIds.includes(team.id));
      })
    );
  }

  getCupsByCountry(countryId: string): Observable<CupCompetition[]> {
    return this.cups$.pipe(
      map((cups) =>
        cups.filter((cup) => {
          // Logic to match cups to countries
          return cup.id.includes(countryId);
        })
      )
    );
  }

  // Method to create/update custom data
  saveCustomData(
    customCountry: Country,
    customLeagues: League[],
    customTeams: Team[]
  ): void {
    // Save custom country
    const updatedCountries = [
      ...this._countries.value.filter((c) => c.id !== 'custom'),
      customCountry,
    ];
    this._countries.next(updatedCountries);

    // Save custom leagues
    const updatedLeagues = [
      ...this._leagues.value.filter((l) => !l.id.includes('custom-')),
      ...customLeagues,
    ];
    this._leagues.next(updatedLeagues);

    // Save custom teams
    const updatedTeams = [
      ...this._teams.value.filter((t) => !t.id.includes('custom-')),
      ...customTeams,
    ];
    this._teams.next(updatedTeams);
  }

  addLeague(league: League): void {
    const currentLeagues = [...this._leagues.value];
    const index = currentLeagues.findIndex((l) => l.id === league.id);

    if (index >= 0) {
      currentLeagues[index] = league;
    } else {
      currentLeagues.push(league);
    }

    this._leagues.next(currentLeagues);
  }

  addTeams(newTeams: Team[]): void {
    if (!newTeams || newTeams.length === 0) return;

    const currentTeams = [...this._teams.value];
    const existingIds = new Set(currentTeams.map((t) => t.id));

    // Only add teams that don't already exist
    const teamsToAdd = newTeams.filter((t) => !existingIds.has(t.id));

    if (teamsToAdd.length > 0) {
      this._teams.next([...currentTeams, ...teamsToAdd]);
    }
  }

  updateTeamStrengths(updates: { id: string; strength: number }[]): void {
    if (!updates || updates.length === 0) return;

    const currentTeams = [...this._teams.value];
    let updated = false;

    for (const update of updates) {
      const teamIndex = currentTeams.findIndex((t) => t.id === update.id);
      if (
        teamIndex >= 0 &&
        currentTeams[teamIndex].strength !== update.strength
      ) {
        currentTeams[teamIndex] = {
          ...currentTeams[teamIndex],
          strength: update.strength,
        };
        updated = true;
      }
    }

    if (updated) {
      this._teams.next(currentTeams);
    }
  }

  // Gets the current value of teams as an array without using getValue()
  getTeamsSync(): Team[] {
    let teams: Team[] = [];
    this.teams$
      .subscribe((t) => {
        teams = t;
      })
      .unsubscribe();

    return teams;
  }

  // Gets the current value of leagues as an array without using getValue()
  getLeaguesSync(): League[] {
    let leagues: League[] = [];
    this.leagues$
      .subscribe((l) => {
        leagues = l;
      })
      .unsubscribe();
    return leagues;
  }
  saveSimulation(state: SimulationState): void {
    try {
      this.storage.setItem(this.STATE_KEY, JSON.stringify(state));
      this.storage.setItem(this.TIMESTAMP_KEY, new Date().toISOString());
    } catch (e) {
      console.error('Error saving simulation:', e);
    }
  }

  loadSimulation(): {
    state: SimulationState | null;
    timestamp: string | null;
  } {
    try {
      const stateJson = this.storage.getItem(this.STATE_KEY);
      const timestamp = this.storage.getItem(this.TIMESTAMP_KEY);
      if (!stateJson) {
        return { state: null, timestamp: null };
      }
      return {
        state: JSON.parse(stateJson),
        timestamp,
      };
    } catch (e) {
      console.error('Error loading simulation:', e);
      return { state: null, timestamp: null };
    }
  }

  clearSavedSimulation(): void {
    this.storage.removeItem(this.STATE_KEY);
    this.storage.removeItem(this.TIMESTAMP_KEY);
  }
}
