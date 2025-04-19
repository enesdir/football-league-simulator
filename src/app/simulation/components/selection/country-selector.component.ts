import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Country } from '@/simulation/models/league.models';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DividerModule } from 'primeng/divider';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-country-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    RadioButtonModule,
    DividerModule,
    ImageModule,
  ],
  template: `
    <p-card
      header="Select a League"
      subheader="Choose a predefined league or create a custom one"
    >
      <div
        class="grid lg:grid-cols-8 md:grid-cols-6 sm:grid-cols-4 grid-cols-3 gap-4"
      >
        <div
          *ngFor="let country of countries"
          class="p-3 rounded-lg cursor-pointer transition-all hover:shadow-md relative"
          [ngClass]="{
            'border-2 border-blue-500 shadow-lg':
              selectedCountryId === country.id,
            'border border-gray-200': selectedCountryId !== country.id
          }"
          (click)="selectCountry(country.id)"
        >
          <div>
            <div
              *ngIf="country.flag"
              class="flex justify-center items-center h-24 2xl:h-32"
            >
              <span class="text-8xl 2xl:text-9xl pt-2">
                {{ country.flag }}</span
              >
            </div>
            <p-radioButton
              [name]="'country-group'"
              [value]="country.id"
              [(ngModel)]="selectedCountryId"
              [inputId]="'country-' + country.id"
              class="absolute top-1 right-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
            />
          </div>
          <div class="text-center font-medium mt-2">{{ country.name }}</div>
        </div>
      </div>
    </p-card>
  `,
})
export class CountrySelectorComponent {
  @Input() countries: Country[] = [];
  @Input() selectedCountryId: string | null = null;

  @Output() countrySelected = new EventEmitter<string>();

  selectCountry(id: string): void {
    this.selectedCountryId = this.selectedCountryId === id ? null : id;
    this.countrySelected.emit(this.selectedCountryId || undefined);
  }
  onCountryChange(): void {
    this.countrySelected.emit(this.selectedCountryId || undefined);
  }
}
