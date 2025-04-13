import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { LeagueService } from '@/league/services/league.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-league-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  templateUrl: './league-controls.component.html',
})
export class LeagueControlsComponent {
  @Output() resetLeague = new EventEmitter<void>();
  isLeagueFinished = false;
  currentWeek$: Observable<number>;
  totalWeeks = 0;

  constructor(private leagueService: LeagueService) {
    this.leagueService.isLeagueComplete$.subscribe((isComplete) => {
      this.isLeagueFinished = isComplete;
      this.totalWeeks = this.leagueService.getTotalWeeks();
    });
    this.currentWeek$ = this.leagueService.currentWeek$;
  }

  playNextWeek(): void {
    this.leagueService.playNextWeek();
  }

  playEntireLeague(): void {
    this.leagueService.playEntireLeague();
  }

  onResetLeague(): void {
    this.resetLeague.emit();
  }
}
