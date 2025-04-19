import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SimulatedLeague } from '@/simulation/models/league.models';

@Component({
  selector: 'app-league-info',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
      <div class="card-header p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
        <h2 class="text-xl font-bold">Season Information</h2>
      </div>
      <div class="card-body p-4">
        <p class="mb-2"><strong>League:</strong> {{ league.name }}</p>
        <p class="mb-2"><strong>Teams:</strong> {{ league.teamIds.length }}</p>
        <p class="mb-2"><strong>Matches:</strong> {{ totalMatches }}</p>
        <p class="mb-2">
          <strong>Progress:</strong>
          {{ playedMatches }}/{{ totalMatches }} ({{ progressPercentage }}%)
        </p>

        <div
          class="mt-3 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
        >
          <div
            class="bg-blue-600 h-2.5 rounded-full"
            [style.width.%]="progressPercentage"
          ></div>
        </div>
      </div>
    </div>
  `,
})
export class LeagueInfoComponent {
  @Input() league!: SimulatedLeague;
  @Input() teamNames: Record<string, string> = {};
  @Input() totalMatches = 0;
  @Input() playedMatches = 0;
  @Input() progressPercentage = 0;
}
