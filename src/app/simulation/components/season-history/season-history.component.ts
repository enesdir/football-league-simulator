import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { SeasonHistory } from '@/simulation/models/league.models';

@Component({
  selector: 'app-season-history',
  standalone: true,
  imports: [CommonModule, AccordionModule, ButtonModule],
  template: `
    <div class="card bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
      <div class="card-header p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
        <h2 class="text-xl font-bold">Previous Seasons</h2>
      </div>
      <div class="card-body p-0">
        <p-accordion>
          @for (history of histories; track history.id) {
          <p-accordion-panel>
            <p-accordion-header
              >Season
              {{ getSeasonNumber(history.seasonId) }}</p-accordion-header
            >
            <p-accordion-content>
              <div class="p-3">
                @if (history.championTeamId) {
                <p class="mb-2">
                  <strong>Champion:</strong>
                  <span class="text-green-600 font-bold">{{
                    getTeamName(history.championTeamId)
                  }}</span>
                </p>
                } @if (history.promotedTeamIds.length > 0) {
                <p class="mb-2">
                  <strong>Promoted:</strong>
                  <span class="text-blue-600">
                    @for (teamId of history.promotedTeamIds; track teamId; let
                    last = $last) {
                    {{ getTeamName(teamId) }}{{ !last ? ', ' : '' }}
                    }
                  </span>
                </p>
                } @if (history.relegatedTeamIds.length > 0) {
                <p class="mb-2">
                  <strong>Relegated:</strong>
                  <span class="text-red-600">
                    @for (teamId of history.relegatedTeamIds; track teamId; let
                    last = $last) {
                    {{ getTeamName(teamId) }}{{ !last ? ', ' : '' }}
                    }
                  </span>
                </p>
                } @if (history.uefaQualifiers && history.uefaQualifiers.length >
                0) {
                <div class="mb-2">
                  <strong>UEFA Qualifiers:</strong>
                  @for (qualifier of history.uefaQualifiers; track
                  qualifier.competition) {
                  <p class="ml-3 mt-1">
                    <strong>{{ qualifier.competition }}:</strong>
                    <span>
                      @for (teamId of qualifier.teamIds; track teamId; let last
                      = $last) {
                      {{ getTeamName(teamId) }}{{ !last ? ', ' : '' }}
                      }
                    </span>
                  </p>
                  }
                </div>
                }

                <!-- View Match Results Button -->

                <button
                  pButton
                  label="View Match Results"
                  icon="pi pi-list"
                  class="p-button-outlined mt-3"
                  (click)="viewMatchHistory.emit(history)"
                ></button>
              </div>
            </p-accordion-content>
          </p-accordion-panel>
          }
        </p-accordion>
      </div>
    </div>
  `,
})
export class SeasonHistoryComponent {
  @Input() histories: SeasonHistory[] = [];
  @Input() teamNames: Record<string, string> = {};

  @Output() viewMatchHistory = new EventEmitter<SeasonHistory>();

  getTeamName(teamId: string): string {
    return this.teamNames[teamId] || 'Unknown Team';
  }

  getSeasonNumber(seasonId: string): number {
    // This is a simplified approach - in a real app you'd have proper season numbering
    return parseInt(seasonId.substring(0, 8), 16) % 100;
  }
}
