import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { Match } from '@/league/models/match.model';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputNumberModule,
    PanelModule,
    TableModule,
  ],
  templateUrl: './matches.component.html',
})
export class MatchesComponent {
  @Input() matches: Match[] = [];
  @Output() matchUpdated = new EventEmitter<Match>();

  editDialogVisible = false;
  selectedMatch: Match | null = null;
  editHomeGoals = 0;
  editAwayGoals = 0;

  editMatch(match: Match): void {
    this.selectedMatch = match;
    this.editHomeGoals = match.homeGoals || 0;
    this.editAwayGoals = match.awayGoals || 0;
    this.editDialogVisible = true;
  }

  cancelEdit(): void {
    this.editDialogVisible = false;
    this.selectedMatch = null;
  }

  saveMatchResult(): void {
    if (this.selectedMatch) {
      this.selectedMatch.homeGoals = this.editHomeGoals;
      this.selectedMatch.awayGoals = this.editAwayGoals;
      this.matchUpdated.emit(this.selectedMatch);
      this.editDialogVisible = false;
      this.selectedMatch = null;
    }
  }
}
