import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-simulation-controls',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <div class="card bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
      <div class="card-header p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
        <h2 class="text-xl font-bold">Game Controls</h2>
      </div>
      <div class="card-body p-4">
        <div class="flex flex-col gap-3">
          @if (!isFinished) {
          <button
            pButton
            label="Play Next Week"
            icon="pi pi-step-forward"
            (click)="playNextWeek.emit()"
          ></button>

          <button
            pButton
            label="Play Entire Season"
            icon="pi pi-fast-forward"
            class="p-button-secondary"
            (click)="playFullSeason.emit()"
          ></button>
          } @else {
          <button
            pButton
            label="Start Next Season"
            icon="pi pi-refresh"
            class="p-button-success"
            [disabled]="!canStartNextSeason"
            (click)="startNextSeason.emit()"
          ></button>
          }
        </div>

        <div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h3 class="text-md font-semibold mb-2">Save/Load</h3>
          <div class="flex flex-col gap-2">
            <button
              pButton
              label="Save Simulation"
              icon="pi pi-save"
              class="p-button-outlined"
              (click)="saveSimulation.emit()"
            ></button>
            <button
              pButton
              label="Load Simulation"
              icon="pi pi-download"
              class="p-button-outlined p-button-secondary"
              [disabled]="!hasSavedSimulation"
              (click)="loadSimulation.emit()"
            ></button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SimulationControlsComponent {
  @Input() isFinished = false;
  @Input() canStartNextSeason = false;
  @Input() hasSavedSimulation = false;

  @Output() playNextWeek = new EventEmitter<void>();
  @Output() playFullSeason = new EventEmitter<void>();
  @Output() startNextSeason = new EventEmitter<void>();
  @Output() saveSimulation = new EventEmitter<void>();
  @Output() loadSimulation = new EventEmitter<void>();
}
