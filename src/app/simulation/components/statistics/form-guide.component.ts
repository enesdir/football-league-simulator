import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';

interface FormRecord {
  teamId: string;
  results: ('W' | 'D' | 'L')[];
  points: number;
}

@Component({
  selector: 'app-form-guide',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="card bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div class="card-header p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
        <h2 class="text-xl font-bold">Form Guide</h2>
      </div>
      <div class="card-body p-0">
        <p-table [value]="formRecords" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Team</th>
              <th class="w-24">Last 5</th>
              <th class="w-20">Points</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-form>
            <tr>
              <td>{{ getTeamName(form.teamId) }}</td>
              <td>
                <div class="flex gap-1">
                  <span
                    *ngFor="let result of form.results"
                    [ngClass]="{
                      'bg-green-500': result === 'W',
                      'bg-yellow-500': result === 'D',
                      'bg-red-500': result === 'L'
                    }"
                    class="w-5 h-5 flex items-center justify-center text-white text-xs font-bold rounded"
                  >
                    {{ result }}
                  </span>
                </div>
              </td>
              <td class="font-bold">{{ form.points }}</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class FormGuideComponent {
  @Input() formRecords: FormRecord[] = [];
  @Input() teamNames: Record<string, string> = {};

  getTeamName(teamId: string): string {
    return this.teamNames[teamId] || 'Unknown';
  }
}
