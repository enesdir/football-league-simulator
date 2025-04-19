import { Component, Input } from '@angular/core';
import { League } from '@/simulation/models/league.models';

@Component({
  selector: 'app-league-rules',
  standalone: true,
  template: `
    <div class="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 class="text-lg font-semibold mb-3">League Rules</h3>

      <!-- Promotions -->
      @if (league.rules.promotions && league.rules.promotions.length > 0) {
      <div class="mb-2">
        <span class="font-medium">Promotions:</span>
        Top {{ getPositionsString(league.rules.promotions) }} positions
        {{ getTypeString(league.rules.promotions) }}
      </div>
      }

      <!-- Relegations -->
      @if (league.rules.relegations && league.rules.relegations.length > 0) {
      <div class="mb-2">
        <span class="font-medium">Relegations:</span>
        Bottom {{ getPositionsString(league.rules.relegations) }} positions
        {{ getTypeString(league.rules.relegations) }}
      </div>
      }

      <!-- UEFA Qualifications -->
      @if (league.rules.uefaQualifications &&
      league.rules.uefaQualifications.length > 0) {
      <div class="mb-2">
        <span class="font-medium">UEFA Qualifications:</span>
        <ul class="list-disc pl-5 mt-1">
          @for (rule of league.rules.uefaQualifications; track rule.competition)
          {
          <li>
            {{ rule.competition }}: @if (rule.positions) { Positions
            {{ rule.positions[0] }}-{{ rule.positions[1] }}
            }
          </li>
          }
        </ul>
      </div>
      }
    </div>
  `,
})
export class LeagueRulesComponent {
  @Input() league!: League;

  getPositionsString(rules: any[]): string {
    if (!rules || rules.length === 0) return '';

    const positions = rules.flatMap((r) => r.positions);
    return positions.join(', ');
  }

  getTypeString(rules: any[]): string {
    if (!rules || rules.length === 0) return '';

    const types = new Set(rules.map((r) => r.type));

    return Array.from(types).join(' and ');
  }
}
