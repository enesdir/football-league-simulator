import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Observable, map } from 'rxjs';

import { LeagueService } from '@/league/services/league.service';
import { Team } from '@/league/models/team.model';
import { Match } from '@/league/models/match.model';

import { StandingsComponent } from '../standings/standings.component';
import { MatchesComponent } from '../matches/matches.component';
import { TeamSelectionComponent } from '../team-selection/team-selection.component';
import { LeagueControlsComponent } from '../league-controls/league-controls.component';
import { MatchHistoryComponent } from '../match-history/match-history.component';
import { ChampionshipProbabilityComponent } from '../championship-probability/championship-probability.component';
import { LeagueSelectionComponent } from '../league-selection/league-selection.component';

@Component({
  selector: 'app-league-simulation',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ToastModule,
    StandingsComponent,
    MatchesComponent,
    LeagueSelectionComponent,
    TeamSelectionComponent,
    LeagueControlsComponent,
    MatchHistoryComponent,
    ChampionshipProbabilityComponent,
  ],
  providers: [MessageService],

  templateUrl: './league-simulation.component.html',
})
export class LeagueSimulationComponent implements OnInit {
  teams$: Observable<Team[]>;
  currentWeek$: Observable<number>;
  currentWeekMatches$: Observable<Match[]>;
  leagueSelected = false;
  leagueStarted = false;
  totalWeeks = 0;

  selectedLeagueId: string = '';
  selectedTeams: Team[] = [];

  constructor(
    private leagueService: LeagueService,
    private messageService: MessageService
  ) {
    this.teams$ = this.leagueService.teams$;
    this.currentWeek$ = this.leagueService.currentWeek$;
    this.currentWeekMatches$ = this.leagueService.currentWeek$.pipe(
      map((week) => this.leagueService.getWeekMatches(week))
    );
  }

  ngOnInit(): void {}

  onLeagueSelected(event: { leagueId: string; teams: Team[] }): void {
    this.selectedLeagueId = event.leagueId;
    this.selectedTeams = event.teams;
    this.leagueSelected = true;
    this.messageService.add({
      severity: 'success',
      summary: 'League Selected',
      detail: `You've selected ${
        this.selectedTeams.length
      } teams from ${this.getLeagueName(this.selectedLeagueId)}.`,
    });
  }

  backToLeagueSelection(): void {
    this.leagueSelected = false;
    this.selectedLeagueId = '';
    this.selectedTeams = [];
  }

  startLeague(teams: Team[]): void {
    if (teams.length < 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Not Enough Teams',
        detail: 'You need at least 2 teams to start a league.',
      });

      return;
    }

    if (teams.length > 20) {
      this.messageService.add({
        severity: 'error',
        summary: 'Too Many Teams',
        detail: 'The maximum number of teams allowed is 20.',
      });

      return;
    }

    this.leagueService.initializeLeague(teams);
    this.leagueStarted = true;
    this.totalWeeks = this.leagueService.getTotalWeeks();
    const leagueName = this.leagueService.getLeagueName(this.selectedLeagueId);
    this.messageService.add({
      severity: 'success',
      summary: 'League Started',
      detail: `The ${leagueName} has been initialized with ${teams.length} teams.`,
    });
  }

  onMatchUpdated(match: Match): void {
    this.leagueService.updateMatchResult(
      match,
      match.homeGoals!,
      match.awayGoals!
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Match Updated',
      detail: `${match.homeTeam.name} ${match.homeGoals} - ${match.awayGoals} ${match.awayTeam.name} has been updated.`,
    });
    if (this.leagueService.isLeagueFinished()) {
      this.announceChampion();
    }
  }

  resetLeague(): void {
    this.leagueStarted = false;
    this.leagueSelected = false;
    this.selectedLeagueId = '';
    this.selectedTeams = [];

    this.messageService.add({
      severity: 'info',
      summary: 'League Reset',
      detail: 'The league has been reset. Select a new league to start.',
    });
  }

  private announceChampion(): void {
    const champion = this.leagueService.getChampion();
    if (champion) {
      const leagueName = this.leagueService.getLeagueName(
        this.selectedLeagueId
      );
      this.messageService.add({
        severity: 'success',
        summary: 'Champion Crowned',
        detail: `${champion.name} is the ${leagueName} champion with ${champion.points} points!`,
        life: 5000,
      });
    }
  }
  private getLeagueName(leagueId: string): string {
    return this.leagueService.getLeagueName(leagueId);
  }
}
