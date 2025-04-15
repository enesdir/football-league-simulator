import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';
import { LeagueService } from '@/league/services/league.service';
import { Team } from '@/league/models/team.model';
import { League } from '@/league/models/league.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-league-selection',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    RadioButtonModule,
    DividerModule,
    ImageModule,
    RouterLink,
  ],
  templateUrl: './league-selection.component.html',
})
export class LeagueSelectionComponent implements OnInit {
  @Output() leagueSelected = new EventEmitter<{
    leagueId: string;
    teams: Team[];
  }>();

  availableLeagues: League[] = [];
  selectedLeagueId: string = '';

  constructor(private leagueService: LeagueService) {}

  ngOnInit(): void {
    this.availableLeagues = this.leagueService.getAvailableLeagues();
  }

  selectLeague(leagueId: string): void {
    this.selectedLeagueId = leagueId;
  }

  continueWithLeague(): void {
    if (this.selectedLeagueId) {
      const teams = this.leagueService.getTeamsForLeague(this.selectedLeagueId);
      this.leagueSelected.emit({
        leagueId: this.selectedLeagueId,
        teams: teams,
      });
    }
  }
}
