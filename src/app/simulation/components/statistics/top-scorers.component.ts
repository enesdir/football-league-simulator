import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

interface Scorer {
  id: string;
  name: string;
  teamId: string;
  goals: number;
}

@Component({
  selector: 'app-top-scorers',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="card bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div class="card-header p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
        <h2 class="text-xl font-bold">Top Scorers</h2>
      </div>
      <div class="card-body p-0">
        <p-table [value]="scorers" styleClass="p-datatable-sm" [rows]="5">
          <ng-template pTemplate="header">
            <tr>
              <th class="w-10">Rank</th>
              <th>Player</th>
              <th>Team</th>
              <th class="w-20">Goals</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-scorer let-i="rowIndex">
            <tr>
              <td>{{ i + 1 }}</td>
              <td>{{ scorer.name }}</td>
              <td>{{ getTeamName(scorer.teamId) }}</td>
              <td class="font-bold">{{ scorer.goals }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class TopScorersComponent {
  @Input() scorers: Scorer[] = [];
  @Input() teamNames: Record<string, string> = {};

  getTeamName(teamId: string): string {
    return this.teamNames[teamId] || 'Unknown';
  }
}
