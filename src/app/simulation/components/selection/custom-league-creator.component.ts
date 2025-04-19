import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-custom-league-creator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    SliderModule,
    ButtonModule,
  ],
  template: `
    <div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-gray-700 dark:text-gray-300 mb-2"
            >Custom League Name</label
          >
          <input
            type="text"
            pInputText
            [(ngModel)]="leagueName"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-gray-700 dark:text-gray-300 mb-2"
            >Number of Teams (2-24)</label
          >
          <p-slider
            [(ngModel)]="teamCount"
            [min]="2"
            [max]="24"
            class="w-full"
          ></p-slider>
          <div class="text-center mt-2">{{ teamCount }}</div>
        </div>
      </div>

      <button
        pButton
        label="Generate Random Teams"
        icon="pi pi-refresh"
        class="mt-4"
        (click)="generateTeams.emit(teamCount)"
      ></button>
    </div>
  `,
})
export class CustomLeagueCreatorComponent {
  @Input() leagueName = 'Custom League';
  @Input() teamCount = 4;

  @Output() leagueNameChange = new EventEmitter<string>();
  @Output() teamCountChange = new EventEmitter<number>();
  @Output() generateTeams = new EventEmitter<number>();

  ngOnChanges(): void {
    this.leagueNameChange.emit(this.leagueName);
    this.teamCountChange.emit(this.teamCount);
  }
}
