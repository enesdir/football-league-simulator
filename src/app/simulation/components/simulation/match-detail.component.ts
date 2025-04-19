import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { Match } from '@/simulation/models/league.models';

interface MatchEvent {
  minute: number;
  type: 'goal' | 'card' | 'substitution';
  team: 'home' | 'away';
  teamName: string;
  scoreLine: string;
  player?: string;
}

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, DialogModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [style]="{ width: '650px' }"
      [header]="homeTeamName + ' vs ' + awayTeamName"
      [modal]="true"
      (onHide)="onClose.emit()"
    >
      <div class="p-4">
        <div
          class="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4"
        >
          <div class="text-center w-2/5">
            <h3 class="text-lg font-bold">{{ homeTeamName }}</h3>
          </div>
          <div class="text-center w-1/5">
            <div class="text-3xl font-bold">
              {{ match?.homeGoals }} - {{ match?.awayGoals }}
            </div>
            <div class="text-sm text-gray-500">Full Time</div>
          </div>
          <div class="text-center w-2/5">
            <h3 class="text-lg font-bold">{{ awayTeamName }}</h3>
          </div>
        </div>
        <h3 class="text-lg font-semibold mb-2">Match Timeline</h3>
        <div class="match-timeline">
          <div
            *ngFor="let event of events"
            class="flex items-center p-2 border-b"
            [ngClass]="{
              'justify-start': event.team === 'home',
              'justify-end': event.team === 'away'
            }"
          >
            <div
              [ngClass]="{
                'order-1': event.team === 'away',
                'order-3': event.team === 'home'
              }"
              class="w-1/3 text-center"
            >
              <span class="inline-block bg-gray-200 rounded-full px-2 py-1"
                >{{ event.minute }}'</span
              >
            </div>
            <div class="order-2 w-1/3 text-center">
              <span class="font-bold">{{ event.scoreLine }}</span>
            </div>
            <div
              [ngClass]="{
                'order-3': event.team === 'away',
                'order-1': event.team === 'home'
              }"
              class="w-1/3"
            >
              <div
                class="flex items-center"
                [ngClass]="{
                  'justify-end': event.team === 'home',
                  'justify-start': event.team === 'away'
                }"
              >
                <i class="pi pi-futbol-o text-green-600 mr-1"></i>
                <span>Goal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </p-dialog>
  `,
})
export class MatchDetailComponent {
  @Input() visible = false;
  @Input() match: Match | null = null;
  @Input() homeTeamName = '';
  @Input() awayTeamName = '';
  @Input() events: MatchEvent[] = [];

  @Output() onClose = new EventEmitter<void>();
}
