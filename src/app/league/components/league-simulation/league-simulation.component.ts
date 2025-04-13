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

@Component({
  selector: 'app-league-simulation',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ToastModule,
    StandingsComponent,
    MatchesComponent,
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
  leagueStarted = false;
  totalWeeks = 0;

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
    this.messageService.add({
      severity: 'success',
      summary: 'League Started',
      detail: `The league has been initialized with ${teams.length} teams.`,
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
    this.messageService.add({
      severity: 'info',
      summary: 'League Reset',
      detail: 'The league has been reset. Select teams to start a new league.',
    });
  }

  private announceChampion(): void {
    const champion = this.leagueService.getChampion();

    if (champion) {
      this.messageService.add({
        severity: 'success',
        summary: 'Champion Crowned',
        detail: `${champion.name} is the league champion with ${champion.points} points!`,
        life: 5000,
      });
    }
  }
}
