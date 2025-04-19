import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Team, League } from '../models/league.models';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private teamsMap: Map<string, Team> = new Map();
  private currentTeams: Team[] = [];
  private currentLeagues: League[] = [];

  constructor(private dataService: DataService) {
    // Subscribe to teams from DataService
    this.dataService.teams$.subscribe((teams) => {
      this.currentTeams = teams;

      // Create a map for quick lookups
      this.teamsMap.clear();
      teams.forEach((team) => this.teamsMap.set(team.id, team));
    });

    // Also subscribe to leagues to be able to get teams by league
    this.dataService.leagues$.subscribe((leagues) => {
      this.currentLeagues = leagues;
    });
  }

  getTeamById(teamId: string): Team | undefined {
    return this.teamsMap.get(teamId);
  }

  getAllTeams(): Team[] {
    return this.currentTeams;
  }

  getTeamsByLeague(leagueId: string): Team[] {
    // We need to find teams from the specific league
    const league = this.currentLeagues.find((l) => l.id === leagueId);
    if (!league) return [];

    const leagueTeams: Team[] = [];
    league.teamIds.forEach((teamId) => {
      const team = this.getTeamById(teamId);
      if (team) leagueTeams.push(team);
    });

    return leagueTeams;
  }

  getTeamName(teamId: string): string {
    const team = this.getTeamById(teamId);
    return team ? team.name : 'Unknown Team';
  }

  getTeamLogo(teamId: string): string {
    const team = this.getTeamById(teamId);
    return team?.logo || 'assets/images/default-team-logo.png';
  }

  // Observable-based methods
  getTeams$(): Observable<Team[]> {
    return this.dataService.teams$;
  }

  getTeamsByLeague$(leagueId: string): Observable<Team[]> {
    return this.dataService.leagues$.pipe(
      map((leagues) => {
        const league = leagues.find((l) => l.id === leagueId);
        if (!league) return [];

        // Map team IDs to team objects
        return league.teamIds
          .map((id) => this.teamsMap.get(id))
          .filter((team): team is Team => team !== undefined);
      })
    );
  }
}
