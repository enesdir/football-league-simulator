import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Match } from '@/simulation/models/league.models';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="hover:shadow-md transition-shadow rounded-xl">
      <div class="flex flex-row justify-center items-center p-4">
        <div
          class="w-5/6 grid grid-cols-13 justify-center items-center gap-2 md:text-xl text-sm"
        >
          <span
            class="col-span-6 text-ellipsis overflow-hidden whitespace-nowrap text-right "
          >
            {{ homeTeamName }}
          </span>
          <span
            class="flex items-center justify-center text-white bg-[#37003c] rounded-lg col-start-7 col-end-8 p-2 md:p-2.5"
          >
            {{ match.homeGoals }} <span>-</span>{{ match.awayGoals }}
          </span>
          <span
            class="col-span-6 text-ellipsis overflow-hidden whitespace-nowrap "
          >
            {{ awayTeamName }}
          </span>
        </div>
        <div class="w-1/6 text-center flex-row md:flex-col">
          @if (editable) {
          <button
            pButton
            icon="pi pi-pencil"
            class="p-button-text p-button-sm"
            (click)="editMatch.emit(match)"
          ></button>
          } @if (expandable) {
          <button
            pButton
            icon="pi pi-eye"
            styleClass=""
            class="p-button-text p-button-sm rounded-r-xl"
            (click)="viewDetails.emit(match)"
          ></button>
          }
        </div>
      </div>
    </div>
  `,
})
export class MatchCardComponent {
  @Input() match!: Match;
  @Input() homeTeamName = '';
  @Input() awayTeamName = '';
  @Input() editable = true;
  @Input() expandable = false;

  @Output() editMatch = new EventEmitter<Match>();
  @Output() viewDetails = new EventEmitter<Match>();
}
