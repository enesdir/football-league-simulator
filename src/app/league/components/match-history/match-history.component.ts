import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { LeagueService } from '@/league/services/league.service';
import { Week } from '@/league/models/week.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-match-history',
  standalone: true,
  imports: [AccordionModule, CardModule, TableModule, NgIf],
  templateUrl: './match-history.component.html',
})
export class MatchHistoryComponent implements OnInit {
  playedWeeks: Week[] = [];

  constructor(private leagueService: LeagueService) {}

  ngOnInit(): void {
    this.leagueService.currentWeek$.subscribe(() => {
      this.playedWeeks = this.leagueService.getPlayedWeeks();
    });
  }
}
