import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';
import { TableModule } from 'primeng/table';
import { Team } from '@/league/models/team.model';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [NgClass, TableModule],
  templateUrl: './standings.component.html',
})
export class StandingsComponent {
  @Input() teams: Team[] = [];
  @Input() showChampionshipProbability = false;
  rowClass(team: Team) {
    return {
      '!bg-primary !text-primary-contrast': team.noChance || !team.hasChance,
    };
  }
}
