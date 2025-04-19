import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Standing } from '@/simulation/models/league.models';

@Component({
  selector: 'app-standings-table',
  standalone: true,
  imports: [CommonModule, TableModule, TooltipModule],
  template: `
    <p-table [value]="standings" styleClass="p-datatable-sm">
      <ng-template pTemplate="header">
        <tr>
          <th class="w-10">Pos</th>
          <th>Team</th>
          <th class="w-10">P</th>
          <th class="w-10">W</th>
          <th class="w-10">D</th>
          <th class="w-10">L</th>
          <th class="w-10">GF</th>
          <th class="w-10">GA</th>
          <th class="w-10">GD</th>
          <th class="w-10">Pts</th>
          @if (showChampionshipChance) {
          <th class="w-24">Title %</th>
          }
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-standing>
        <tr [class.text-red-500]="!standing.hasChampionshipChance">
          <td>{{ standing.position }}</td>
          <td>{{ getTeamName(standing.teamId) }}</td>
          <td>{{ standing.played }}</td>
          <td>{{ standing.won }}</td>
          <td>{{ standing.drawn }}</td>
          <td>{{ standing.lost }}</td>
          <td>{{ standing.goalsFor }}</td>
          <td>{{ standing.goalsAgainst }}</td>
          <td>{{ standing.goalDifference }}</td>
          <td class="font-bold">{{ standing.points }}</td>
          @if (showChampionshipChance) {
          <td>
            <div
              class="relative h-4 w-full bg-gray-200 rounded-full overflow-hidden"
            >
              <div
                class="absolute h-full bg-blue-500"
                [style.width.%]="standing.championshipChance"
                [pTooltip]="(standing.championshipChance || 0) + '%'"
              ></div>
            </div>
          </td>
          }
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class StandingsTableComponent {
  @Input() standings: Standing[] = [];
  @Input() showChampionshipChance = true;
  @Input() teamNames: Record<string, string> = {};

  getTeamName(teamId: string): string {
    return this.teamNames[teamId] || 'Unknown';
  }
}
