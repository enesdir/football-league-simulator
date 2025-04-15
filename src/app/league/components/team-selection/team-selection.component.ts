import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { NgFor } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Team } from '@/league/models/team.model';
import { FloatLabelModule } from 'primeng/floatlabel';
import {
  DEFAULT_TEAM_NAMES,
  DEFAULT_TEAMS,
} from '@/league/mocks/default-team-names';
import { LeagueService } from '@/league/services/league.service';
@Component({
  selector: 'app-team-selection',
  standalone: true,
  imports: [
    NgFor,
    FormsModule,
    CardModule,
    ButtonModule,
    SliderModule,
    InputTextModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    FloatLabelModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './team-selection.component.html',
})
export class TeamSelectionComponent implements OnInit, OnChanges {
  @Input() selectedLeagueId: string = '';
  @Input() initialTeams: Team[] = [];
  @Output() startLeague = new EventEmitter<Team[]>();
  @Output() backToLeagueSelection = new EventEmitter<void>();

  teams: Team[] = [];
  leagueName: string = 'Custom';

  // Default team names for new teams
  private defaultTeamNames = DEFAULT_TEAM_NAMES;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private leagueService: LeagueService
  ) {}

  ngOnInit(): void {
    this.initializeTeams();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialTeams'] || changes['selectedLeagueId']) {
      this.initializeTeams();
    }
  }

  private initializeTeams(): void {
    if (this.initialTeams && this.initialTeams.length > 0) {
      // Make a deep copy to avoid modifying the original
      this.teams = this.initialTeams.map((team) => ({ ...team }));
      // Get league name from service
      this.leagueName = this.leagueService.getLeagueName(this.selectedLeagueId);
    } else {
      // Default to two teams if no initial teams provided
      this.teams = DEFAULT_TEAMS.map((team) => ({ ...team }));
      this.leagueName = 'Custom';
    }
  }

  addTeam(): void {
    if (this.teams.length >= 20) {
      this.messageService.add({
        severity: 'error',
        summary: 'Maximum Teams Reached',
        detail: 'You cannot add more than 20 teams.',
      });
      return;
    }

    const nextId = Math.max(...this.teams.map((t) => t.id)) + 1;
    const defaultName = this.getNextDefaultName();
    const randomStrength = Math.floor(Math.random() * 31) + 70; // Random strength between 70-100
    this.teams.push({
      id: nextId,
      name: defaultName,
      strength: randomStrength,
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      hasChance: true,
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Team Added',
      detail: `${defaultName} has been added to the league.`,
    });
  }

  removeTeam(index: number): void {
    if (this.teams.length <= 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Minimum Teams Required',
        detail: 'You must have at least 2 teams in the league.',
      });
      return;
    }

    const teamName = this.teams[index].name;
    this.teams.splice(index, 1);
    this.messageService.add({
      severity: 'info',
      summary: 'Team Removed',
      detail: `${teamName} has been removed from the league.`,
    });
  }

  confirmRemoveAll(): void {
    this.confirmationService.confirm({
      message:
        'Are you sure you want to remove all teams? Two default teams will remain.',
      header: 'Confirm Reset',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.resetToDefaultTeams();
      },
    });
  }

  resetToDefaultTeams(): void {
    this.teams = DEFAULT_TEAMS.map((team) => ({ ...team }));
    this.messageService.add({
      severity: 'info',
      summary: 'Teams Reset',
      detail: 'All teams have been removed and reset to default.',
    });
  }

  onStartLeague(): void {
    if (!this.isValid()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Teams',
        detail:
          'Please ensure all teams have names and there are at least 2 teams.',
      });
      return;
    }
    const teamsToEmit = this.teams.map((team) => ({ ...team }));
    this.startLeague.emit(teamsToEmit);
  }

  goBackToLeagueSelection(): void {
    this.backToLeagueSelection.emit();
  }
  isValid(): boolean {
    if (this.teams.length < 2) return false;
    // Check if all teams have names
    return this.teams.every((team) => team.name.trim() !== '');
  }

  private getNextDefaultName(): string {
    // Find a default name that's not already used
    for (const name of this.defaultTeamNames) {
      if (!this.teams.some((team) => team.name === name)) {
        return name;
      }
    }
    // If all default names are used, generate a generic name
    return `Team ${this.teams.length + 1}`;
  }
}
