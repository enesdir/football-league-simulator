import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { Team } from '@/simulation/models/league.models';

@Component({
  selector: 'app-team-card',
  standalone: true,
  imports: [CommonModule, FormsModule, SliderModule, InputTextModule],
  template: `
    <div
      class="team-card p-3 border rounded-lg hover:shadow-md transition-shadow"
    >
      @if (editable) {
      <div class="mb-2">
        <label class="block text-sm">Team Name</label>
        <input
          type="text"
          pInputText
          [(ngModel)]="team.name"
          class="w-full"
          (change)="teamChange.emit(team)"
        />
      </div>
      <div class="mb-2">
        <label class="block text-sm">Team Code</label>
        <input
          type="text"
          pInputText
          [(ngModel)]="team.teamCode"
          class="w-full"
          maxlength="3"
          (change)="teamChange.emit(team)"
        />
      </div>
      <div>
        <label class="block text-sm mb-1">Strength: {{ team.strength }}</label>
        <p-slider
          [(ngModel)]="team.strength"
          [min]="0"
          [max]="100"
          (onChange)="teamChange.emit(team)"
        ></p-slider>
      </div>
      } @else {
      <div class="flex justify-between items-center">
        <div>
          <h3 class="font-semibold">{{ team.name }}</h3>
          <span class="text-sm text-gray-500">{{ team.teamCode }}</span>
        </div>
        <div class="w-1/2">
          <label class="block text-sm mb-1">Strength: {{ strength }}</label>
          <p-slider
            [(ngModel)]="strength"
            [min]="0"
            [max]="100"
            (onChange)="strengthChange.emit(strength)"
          ></p-slider>
        </div>
      </div>
      }
    </div>
  `,
})
export class TeamCardComponent {
  @Input() team!: Team;
  @Input() editable = false;
  @Input() strength = 50;

  @Output() teamChange = new EventEmitter<Team>();
  @Output() strengthChange = new EventEmitter<number>();
}
