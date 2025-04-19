import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { League } from '@/simulation/models/league.models';

@Component({
  selector: 'app-league-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  template: `
    <div>
      <label class="block text-gray-700 dark:text-gray-300 mb-2"
        >Primary League</label
      >
      <p-dropdown
        [options]="leagues"
        [(ngModel)]="selectedLeagueId"
        optionLabel="name"
        optionValue="id"
        placeholder="Select a league"
        [showClear]="true"
        [disabled]="disabled"
        (onChange)="onLeagueChange()"
        styleClass="w-full"
      ></p-dropdown>
    </div>
  `,
})
export class LeagueSelectorComponent {
  @Input() leagues: League[] = [];
  @Input() selectedLeagueId: string | null = null;
  @Input() disabled = false;

  @Output() leagueSelected = new EventEmitter<string>();

  onLeagueChange(): void {
    this.leagueSelected.emit(this.selectedLeagueId ?? undefined);
  }
}
