import { Component, Input } from '@angular/core';
import { NgClass, NgFor } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { Team } from '@/league/models/team.model';

@Component({
  selector: 'app-championship-probability',
  standalone: true,
  imports: [NgFor, NgClass, CardModule, ProgressBarModule],
  templateUrl: './championship-probability.component.html',
})
export class ChampionshipProbabilityComponent {
  @Input() teams: Team[] = [];
}
