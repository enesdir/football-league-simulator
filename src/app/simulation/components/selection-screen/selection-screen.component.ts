import { Component, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import { Country, League, Team, Tiebreaker } from '../../models/league.models';
import { DataService } from '@/simulation/services/data.service';
import { SimulationService } from '@/simulation/services/simulation.service';
import { TeamGeneratorService } from '@/simulation/services/team-generator.service';
import { v4 as uuidv4 } from 'uuid';

import { CountrySelectorComponent } from '@/simulation/components/selection/country-selector.component';
import { LeagueSelectorComponent } from '@/simulation/components/selection/league-selector.component';
import { CustomLeagueCreatorComponent } from '@/simulation/components/selection/custom-league-creator.component';
import { TeamCardComponent } from '@/simulation/components/common/team-card.component';
import { LeagueRulesComponent } from '@/simulation/components/common/league-rules.component';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { take } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RippleModule } from 'primeng/ripple';
@Component({
  selector: 'app-selection-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabViewModule,
    CardModule,
    ButtonModule,
    RippleModule,
    CountrySelectorComponent,
    LeagueSelectorComponent,
    CustomLeagueCreatorComponent,
    TeamCardComponent,
    LeagueRulesComponent,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <p-card class="w-full flex flex-col sticky top-0 z-10">
      <ng-template #header>
        <button
          pButton
          routerLink="/"
          icon="pi pi-arrow-left"
          class="p-button-secondary top-0 -left-4 absolute"
        >
          <span pButtonLabel class="sr-only">Back to Home</span>
        </button>
      </ng-template>
      <ng-template #content>
        <div class="flex justify-between items-center">
          <div class=" items-center">
            <h3>Choosing Your League</h3>
            <p class="text-sm font-extralight">
              The simulation starts with league selection, where you can choose
              from several popular leagues:
            </p>
          </div>

          <div class="flex flex-col justify-end items-end gap-1">
            <p-button
              label="Start Simulation"
              icon="pi pi-play"
              styleClass="p-button-lg w-full"
              class="w-full"
              [disabled]="!canStartSimulation()"
              (click)="startSimulation()"
            />
            <p-button
              *ngIf="simulationExists"
              label="Continue Existing Simulation"
              icon="pi pi-arrow-right"
              styleClass="p-button-lg p-button-outlined"
              (click)="continueExistingSimulation()"
            />
          </div>
        </div>
      </ng-template>
    </p-card>
    <div class="flex flex-col pt-4">
      <!-- Step 1: Country Selection -->
      <div class="card bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
        <div class="card-header p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <h2 class="text-xl font-bold">
            Step 1: Select Country/League System
          </h2>
        </div>
        <div class="card-body p-4">
          <div class="grid grid-cols-1 gap-4">
            <!-- Country Selection -->
            <app-country-selector
              [countries]="countries"
              [selectedCountryId]="selectedCountryId"
              (countrySelected)="onCountrySelected($event)"
            />
            <!-- League Selection - only shown when country is not 'custom' -->
            <app-league-selector
              *ngIf="selectedCountryId && selectedCountryId !== 'custom'"
              [leagues]="leagues"
              [selectedLeagueId]="selectedLeagueId"
              [disabled]="!selectedCountryId"
              (leagueSelected)="onLeagueSelected($event)"
            />
            <!-- Custom League Settings -->
            <div class="col-span-2" *ngIf="selectedCountryId === 'custom'">
              <app-custom-league-creator
                [(leagueName)]="customLeagueName"
                [(teamCount)]="customTeamCount"
                (generateTeams)="generateRandomTeams()"
              />
            </div>
          </div>
          <!-- League Rules Display -->
          <app-league-rules
            *ngIf="selectedLeague && selectedCountryId !== 'custom'"
            [league]="selectedLeague"
          />
        </div>
      </div>

      <!-- Step 2: Team Selection -->
      <div class="card bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6">
        <div class="card-header p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
          <h2 class="text-xl font-bold">Step 2: Select/Configure Teams</h2>
        </div>
        <div class="card-body p-4">
          @if (selectedCountryId === 'custom') {
          <!-- Custom League Teams -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (team of customTeams; track team.id) {
            <app-team-card
              [team]="team"
              [editable]="true"
              (teamChange)="onTeamChange($event)"
            ></app-team-card>
            }
          </div>
          } @else if (selectedCountryId && hasTeamsLoaded) {
          <!-- Standard League Teams -->
          <p-tabView>
            @for (league of leagues; track league.id) {
            <p-tabPanel [header]="league.name">
              @if (leagueTeamsMap[league.id].length > 0) {
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (team of leagueTeamsMap[league.id]; track team.id) {
                <app-team-card
                  [team]="team"
                  [editable]="false"
                  [strength]="teamStrengths[team.id]"
                  (strengthChange)="onTeamStrengthChange(team.id, $event)"
                ></app-team-card>
                }
              </div>
              } @else {
              <div class="text-center p-6 text-gray-500">
                No teams found for this league
              </div>
              }
            </p-tabPanel>
            }
          </p-tabView>
          } @else {
          <div class="text-center p-6 text-gray-500">
            Please select a country or create a custom league first
          </div>
          }
        </div>
      </div>
    </div>
    <p-toast />
    <p-confirmDialog />
  `,
})
export class SelectionScreenComponent implements OnInit {
  private dataService = inject(DataService);
  private simulationService = inject(SimulationService);
  private teamGenerator = inject(TeamGeneratorService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);

  simulationExists = false;

  countries: Country[] = [];
  leagues: League[] = [];
  leagueTeamsMap: Record<string, Team[]> = {};

  selectedCountryId: string | null = null;
  selectedLeagueId: string | null = null;
  selectedLeague: League | null = null;

  customLeagueName = 'Custom League';
  customTeamCount = 4;
  customTeams: Team[] = [];

  hasTeamsLoaded = false;

  // Store team strengths separately to avoid modifying original data
  teamStrengths: Record<string, number> = {};

  ngOnInit(): void {
    // Load countries
    this.dataService.countries$.subscribe((countries) => {
      this.countries = countries;
    });

    // Initialize default custom teams
    this.generateRandomTeams();

    // Check if a simulation already exists
    this.simulationService.simulationState$.pipe(take(1)).subscribe((state) => {
      this.simulationExists =
        state !== null &&
        state.simulatedLeagues &&
        state.simulatedLeagues.length > 0;
    });
  }

  onCountrySelected(countryId: string | null): void {
    this.selectedCountryId = countryId;
    this.leagueTeamsMap = {};
    this.teamStrengths = {};
    this.hasTeamsLoaded = false;

    if (!countryId) {
      this.leagues = [];
      this.selectedLeagueId = null;
      return;
    }

    // If custom country selected
    if (countryId === 'custom') {
      this.generateRandomTeams();
      return;
    }

    // For regular countries, load their leagues
    this.dataService.getLeaguesByCountry(countryId).subscribe((leagues) => {
      this.leagues = leagues;

      if (leagues.length > 0) {
        this.selectedLeagueId = leagues[0].id;
        this.onLeagueSelected(this.selectedLeagueId);

        // Load teams for all leagues
        this.loadTeamsForAllLeagues();
      }
    });
  }

  onLeagueSelected(leagueId: string | null): void {
    this.selectedLeagueId = leagueId;

    if (!leagueId) {
      this.selectedLeague = null;
      return;
    }

    this.dataService.getLeague(leagueId).subscribe((league) => {
      this.selectedLeague = league || null;
    });
  }

  loadTeamsForAllLeagues(): void {
    if (!this.selectedCountryId || this.selectedCountryId === 'custom') {
      return;
    }

    // Clear existing data
    this.leagueTeamsMap = {};
    this.teamStrengths = {};
    this.hasTeamsLoaded = false;

    // Load all teams first
    this.dataService.teams$.subscribe((allTeams) => {
      // For each league, find its teams
      this.leagues.forEach((league) => {
        // Filter teams that belong to this league
        const leagueTeams = allTeams.filter((team) =>
          league.teamIds.includes(team.id)
        );

        // Store in our map
        this.leagueTeamsMap[league.id] = leagueTeams;

        // Initialize team strengths
        leagueTeams.forEach((team) => {
          this.teamStrengths[team.id] = team.strength;
        });
      });

      // Mark as loaded
      this.hasTeamsLoaded = true;
    });
  }

  generateRandomTeams(): void {
    this.customTeams = this.teamGenerator.generateMultipleTeams(
      'custom',
      this.customTeamCount
    );
  }

  onTeamChange(team: Team): void {
    // No special handling needed since we're modifying the object directly
  }

  onTeamStrengthChange(teamId: string, strength: number): void {
    this.teamStrengths[teamId] = strength;
  }

  continueExistingSimulation(): void {
    this.router.navigate(['/simulation']);
  }

  canStartSimulation(): boolean {
    if (this.selectedCountryId === 'custom') {
      return (
        this.customTeams.length >= 2 &&
        this.customTeams.every((t) => t.name?.trim())
      );
    }
    return !!this.selectedCountryId && !!this.selectedLeagueId;
  }

  async startSimulation(): Promise<void> {
    // If simulation exists, confirm before starting a new one
    if (this.simulationExists) {
      this.confirmationService.confirm({
        message:
          'A simulation is already running. Do you want to start a new simulation and lose the current one?',
        header: 'Confirm New Simulation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.createNewSimulation();
        },
        reject: () => {
          // User chose to continue existing simulation
          this.continueExistingSimulation();
        },
      });
    } else {
      // No existing simulation, start a new one

      this.createNewSimulation();
    }
  }

  async createNewSimulation(): Promise<void> {
    if (this.selectedCountryId === 'custom') {
      // Create custom league
      const customLeagueId = `custom-${uuidv4()}`;
      const customLeague: League = {
        id: customLeagueId,
        name: this.customLeagueName,
        countryId: 'custom',
        teamIds: this.customTeams.map((t) => t.id),
        rules: {
          tiebreakerOrder: [
            Tiebreaker.Points,
            Tiebreaker.GoalDifference,
            Tiebreaker.GoalsFor,
            Tiebreaker.Alphabetical,
          ],
        },
      };

      // Add the custom league to data service
      this.dataService.addLeague(customLeague);

      // Add the custom teams
      this.dataService.addTeams(this.customTeams);

      // Start simulation with custom data
      await this.simulationService.startNewSeason('custom', [customLeagueId]);
      this.router.navigate(['/simulation']);
    } else if (this.selectedCountryId && this.selectedLeagueId) {
      // Apply team strength updates
      const updatedTeams = Object.entries(this.teamStrengths).map(
        ([id, strength]) => ({ id, strength })
      );

      this.dataService.updateTeamStrengths(updatedTeams);

      // Get all league IDs to simulate (including connected leagues)
      const allLeagueIds = this.leagues.map((l) => l.id);

      // Start simulation with all leagues
      await this.simulationService.startNewSeason(
        this.selectedCountryId,
        allLeagueIds
      );
      this.router.navigate(['/simulation']);
    }
  }
} //
