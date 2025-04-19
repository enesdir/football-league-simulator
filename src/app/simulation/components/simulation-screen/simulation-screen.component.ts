import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { Router, ActivatedRoute } from '@angular/router';
import { SimulationService } from '@/simulation/services/simulation.service';
import { DataService } from '@/simulation/services/data.service';
import { StatisticsService } from '@/simulation/services/statistics.service';
import {
  Match,
  SeasonHistory,
  SimulatedLeague,
  SimulationState,
  Team,
} from '@/simulation/models/league.models';

import { StandingsTableComponent } from '@/simulation/components/simulation/standings-table.component';
import { MatchCardComponent } from '@/simulation/components/common/match-card.component';
import { SimulationControlsComponent } from '@/simulation/components/simulation/simulation-controls.component';
import { LeagueInfoComponent } from '@/simulation/components/simulation/league-info.component';
import { SeasonHistoryComponent } from '@/simulation/components/season-history/season-history.component';
import { MatchDetailComponent } from '@/simulation/components/simulation/match-detail.component';
import { TopScorersComponent } from '@/simulation/components/statistics/top-scorers.component';
import { FormGuideComponent } from '@/simulation/components/statistics/form-guide.component';
import { PointsChartComponent } from '@/simulation/components/statistics/points-chart.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MatchCardSimpleComponent } from '../common/match-card-simple.component';

@Component({
  selector: 'app-simulation-screen',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TabViewModule,
    DialogModule,
    InputNumberModule,
    CardModule,
    ToastModule,
    AccordionModule,
    StandingsTableComponent,
    MatchCardComponent,
    SimulationControlsComponent,
    LeagueInfoComponent,
    SeasonHistoryComponent,
    MatchDetailComponent,
    TopScorersComponent,
    FormGuideComponent,
    PointsChartComponent,
    MatchCardSimpleComponent,
  ],
  providers: [MessageService],
  template: `
    <div class="simulation-container">
      @if (simulationState && simulationState.simulatedLeagues &&
      simulationState.simulatedLeagues.length > 0) {
      <p-tabView
        [(activeIndex)]="activeTabIndex"
        (onChange)="onTabChange($event)"
      >
        @for (league of simulationState.simulatedLeagues; track league.leagueId)
        {
        <p-tabPanel [header]="league.name">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Left Column: Standings -->
            <div class="lg:col-span-2">
              <div
                class="card bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6"
              >
                <div
                  class="card-header flex justify-between items-center p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg"
                >
                  <h2 class="text-xl font-bold">Standings</h2>
                  <div class="text-sm">
                    @if (!league.isFinished) { Week
                    {{ league.currentRoundIndex }}/{{ league.fixtures.length }}
                    } @else { Season Complete }
                  </div>
                </div>
                <div class="card-body p-0">
                  <app-standings-table
                    [standings]="league.standings"
                    [showChampionshipChance]="league.currentRoundIndex > 3"
                    [teamNames]="teamNames"
                  />
                </div>
              </div>

              <!-- Current Round Matches -->
              @if (league.currentRoundIndex > 0 && league.currentRoundIndex <=
              league.fixtures.length) {
              <div
                class="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6 w-full"
              >
                <div class="p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg">
                  <h2 class="text-xl font-bold">
                    Week {{ league.currentRoundIndex }} Results
                  </h2>
                </div>
                @for (match of getCurrentRoundMatches(league); track match.id) {
                <app-match-card
                  [match]="match"
                  [homeTeamName]="getTeamName(match.homeTeamId)"
                  [awayTeamName]="getTeamName(match.awayTeamId)"
                  [editable]="true"
                  [expandable]="true"
                  (editMatch)="openEditDialog(match, league.leagueId)"
                  (viewDetails)="openMatchDetail(match)"
                />
                }
              </div>
              }

              <!-- Statistics Tab -->
              <div
                class="card bg-white dark:bg-gray-800 shadow-md rounded-lg mb-6"
              >
                <div
                  class="card-header p-4 bg-blue-50 dark:bg-gray-700 rounded-t-lg"
                >
                  <h2 class="text-xl font-bold">Statistics</h2>
                </div>
                <div class="card-body p-4">
                  <p-tabView>
                    <p-tabPanel header="Form Guide">
                      <app-form-guide
                        [formRecords]="getFormGuide(league)"
                        [teamNames]="teamNames"
                      ></app-form-guide>
                    </p-tabPanel>
                    <p-tabPanel header="Top Scorers">
                      <app-top-scorers
                        [scorers]="getTopScorers(league)"
                        [teamNames]="teamNames"
                      ></app-top-scorers>
                    </p-tabPanel>
                    <p-tabPanel header="Points Chart">
                      <app-points-chart
                        [standings]="league.standings"
                        [teamNames]="teamNames"
                        [roundsPlayed]="league.currentRoundIndex"
                        [totalRounds]="league.fixtures.length"
                      ></app-points-chart>
                    </p-tabPanel>
                  </p-tabView>
                </div>
              </div>
            </div>

            <!-- Right Column: Controls & Info -->
            <div class="lg:col-span-1">
              <!-- Game Controls -->
              <app-simulation-controls
                [isFinished]="league.isFinished"
                [canStartNextSeason]="simulationState.isSeasonFinished"
                [hasSavedSimulation]="hasSavedSimulation"
                (playNextWeek)="playNextRound()"
                (playFullSeason)="playEntireSeason()"
                (startNextSeason)="startNextSeason()"
                (saveSimulation)="saveSimulation()"
                (loadSimulation)="loadSimulation()"
              />

              <!-- Season Info -->
              <app-league-info
                [league]="league"
                [teamNames]="teamNames"
                [totalMatches]="getTotalMatches(league)"
                [playedMatches]="getPlayedMatches(league)"
                [progressPercentage]="getProgressPercentage(league)"
              />

              <!-- Season History -->
              @if (seasonHistories.length > 0) {
              <app-season-history
                [histories]="getLeagueHistories(league.leagueId)"
                [teamNames]="teamNames"
                (viewMatchHistory)="showMatchHistory($event)"
              />
              }
            </div>
          </div>
        </p-tabPanel>
        }
      </p-tabView>
      } @else {
      <div class="flex justify-center items-center h-64">
        <div class="text-center text-gray-500">
          <p class="text-xl mb-4">No leagues to display</p>
          <p class="mb-2">
            Please make sure you've selected at least one valid league.
          </p>
          <div
            class="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-sm font-mono text-left"
          >
            Country ID: {{ simulationState?.countryId || 'None' }}<br />
            League count: {{ simulationState?.simulatedLeagues?.length || 0 }}
          </div>
        </div>
      </div>
      }
    </div>

    <!-- Edit Match Dialog -->
    <p-dialog
      [(visible)]="showEditMatchDialog"
      [style]="{ width: '25rem' }"
      header="Edit Match Result"
      [modal]="true"
    >
      @if (editingMatch) {
      <div class="flex flex-col gap-2">
        <div
          class="grid grid-cols-3 gap-4 border-2 border-gray-200 p-4 rounded-t-xl select-none items-center"
        >
          <div
            class="text-right"
            [class.font-bold]="editHomeGoals! > editAwayGoals!"
          >
            {{ getTeamName(editingMatch.homeTeamId) }}
          </div>
          <div class="flex justify-center items-center">
            <span> {{ editHomeGoals }} </span>
            <span class="text-lg"> - </span>
            <span>{{ editAwayGoals }}</span>
          </div>
          <div [class.font-bold]="editHomeGoals! < editAwayGoals!">
            {{ getTeamName(editingMatch.awayTeamId) }}
          </div>
        </div>
        <div class="flex items-center gap-4 mb-4">
          <label for="home" class="font-semibold flex-1">
            {{ getTeamName(editingMatch.homeTeamId) }}</label
          >
          <p-inputNumber
            id="home"
            [(ngModel)]="editHomeGoals"
            [min]="0"
            [max]="20"
            [inputStyle]="{ width: '3rem' }"
            size="small"
            class="flex-none"
            autocomplete="off"
            [showButtons]="true"
            buttonLayout="horizontal"
          />
        </div>
        <div class="flex items-center gap-4 mb-8">
          <label for="away" class="font-semibold flex-1">{{
            getTeamName(editingMatch.awayTeamId)
          }}</label>
          <p-inputNumber
            [(ngModel)]="editAwayGoals"
            [min]="0"
            [max]="20"
            [inputStyle]="{ width: '3rem' }"
            id="away"
            size="small"
            class="flex-none"
            autocomplete="off"
            [showButtons]="true"
            buttonLayout="horizontal"
          />
        </div>
        <div class="flex justify-between">
          <p-button
            label="Cancel"
            styleClass="p-button-text"
            severity="secondary"
            (onClick)="cancelEdit()"
          />
          <p-button label="Save" (onClick)="saveMatchEdit()" />
        </div>
      </div>
      }
    </p-dialog>

    <!-- Match History Dialog -->
    <p-dialog
      [(visible)]="showMatchHistoryDialog"
      [style]="{ width: '650px' }"
      [header]="
        'Match Results - Season ' +
        (selectedHistory ? getSeasonNumber(selectedHistory.seasonId) : '')
      "
      [modal]="true"
    >
      @if (selectedHistory) {
      <div class="p-4">
        @for (round of selectedHistory.rounds; track round.roundNumber) {
        <div class="mb-4">
          <h3 class="text-lg font-bold mb-2">Week {{ round.roundNumber }}</h3>
          <div class="w-full flex-col flex gap-2">
            @for (match of round.matches; track match.id) {
            <app-match-card-simple
              [match]="match"
              [homeTeamName]="getTeamName(match.homeTeamId)"
              [awayTeamName]="getTeamName(match.awayTeamId)"
            />
            }
          </div>
        </div>
        }
      </div>
      }
    </p-dialog>

    <!-- Match Detail Dialog -->
    <app-match-detail
      [visible]="showMatchDetailDialog"
      [match]="selectedMatch"
      [homeTeamName]="
        selectedMatch ? getTeamName(selectedMatch.homeTeamId) : ''
      "
      [awayTeamName]="
        selectedMatch ? getTeamName(selectedMatch.awayTeamId) : ''
      "
      [events]="matchEvents"
      (onClose)="showMatchDetailDialog = false"
    />
    <p-toast position="bottom-right" key="br" />
  `,
})
export class SimulationScreenComponent implements OnInit {
  private dataService = inject(DataService);
  private simulationService = inject(SimulationService);
  private statisticsService = inject(StatisticsService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  simulationState: SimulationState | null = null;
  seasonHistories: SeasonHistory[] = [];

  // Team data cache
  teams: Team[] = [];
  teamNames: Record<string, string> = {};

  // Active tab
  activeTabIndex = 0;

  // Edit match dialog
  showEditMatchDialog = false;
  editingMatch: Match | null = null;
  editingLeagueId: string | null = null;
  editHomeGoals = 0;
  editAwayGoals = 0;

  // Match history dialog
  showMatchHistoryDialog = false;
  selectedHistory: SeasonHistory | null = null;

  // Match detail dialog
  showMatchDetailDialog = false;
  selectedMatch: Match | null = null;
  matchEvents: any[] = [];

  // Save/load state
  hasSavedSimulation = false;

  ngOnInit(): void {
    // Load teams for name lookup
    this.dataService.teams$.subscribe((teams) => {
      this.teams = teams;

      // Create a lookup map for team names
      this.teamNames = {};
      teams.forEach((team) => {
        this.teamNames[team.id] = team.name;
      });

      this.changeDetectorRef.markForCheck();
    });

    // Load simulation state
    this.simulationService.simulationState$.subscribe((state) => {
      this.simulationState = state;
      this.changeDetectorRef.markForCheck();
    });

    // Load season history
    this.simulationService.seasonHistory$.subscribe((history) => {
      this.seasonHistories = history;
      this.changeDetectorRef.markForCheck();
    });

    // Check if there's a saved simulation
    this.checkForSavedSimulation();
    // handle fragment in URL for tab selection
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        // Find the league index by name or ID
        const leagueIndex = this.simulationState?.simulatedLeagues.findIndex(
          (league) => league.leagueId === fragment
        );
        if (leagueIndex !== undefined && leagueIndex >= 0) {
          this.activeTabIndex = leagueIndex;
        }
      }
    });
  }

  getTeamName(teamId: string): string {
    return this.teamNames[teamId] || 'Unknown Team';
  }

  getCurrentRoundMatches(league: SimulatedLeague): Match[] {
    if (
      league.currentRoundIndex <= 0 ||
      league.currentRoundIndex > league.fixtures.length
    ) {
      return [];
    }

    const currentRound = league.fixtures[league.currentRoundIndex - 1];
    return currentRound ? currentRound.matches : [];
  }

  playNextRound(): void {
    this.simulationService.playNextRound();
  }

  playEntireSeason(): void {
    this.simulationService.playEntireSeason();
  }

  startNextSeason(): void {
    this.simulationService.startNextSeason();
  }
  getTotalMatches(league: SimulatedLeague): number {
    return league.fixtures.reduce(
      (total, round) => total + round.matches.length,
      0
    );
  }

  getPlayedMatches(league: SimulatedLeague): number {
    return league.fixtures.reduce((total, round) => {
      return total + round.matches.filter((m) => m.played).length;
    }, 0);
  }

  getProgressPercentage(league: SimulatedLeague): number {
    const total = this.getTotalMatches(league);
    if (total === 0) return 0;

    const played = this.getPlayedMatches(league);
    return Math.round((played / total) * 100);
  }

  openEditDialog(match: Match, leagueId: string): void {
    this.editingMatch = match;
    this.editingLeagueId = leagueId;
    this.editHomeGoals = match.homeGoals || 0;
    this.editAwayGoals = match.awayGoals || 0;
    this.showEditMatchDialog = true;
  }

  cancelEdit(): void {
    this.showEditMatchDialog = false;
    this.editingMatch = null;
    this.editingLeagueId = null;
    this.messageService.add({
      severity: 'secondary',
      summary: 'Cancelled',
      detail: `You have cancelled editing the match.`,
      life: 5000,
    });
  }
  saveMatchEdit(): void {
    if (!this.editingMatch || !this.editingLeagueId) return;

    this.simulationService.updateMatchResult(
      this.editingLeagueId,
      this.editingMatch.id,
      this.editHomeGoals,
      this.editAwayGoals
    );

    this.showEditMatchDialog = false;
    this.editingMatch = null;
    this.editingLeagueId = null;
    this.messageService.add({
      severity: 'success',
      summary: 'Successful Save',
      detail: `You have successfully edited the match.`,
      life: 5000,
    });
  }

  getLeagueHistories(leagueId: string): SeasonHistory[] {
    return this.seasonHistories.filter((h) => h.leagueId === leagueId);
  }

  getSeasonNumber(seasonId: string): number {
    // Simple way to show season numbers
    const allSeasons = [
      ...new Set(this.seasonHistories.map((h) => h.seasonId)),
    ];
    const index = allSeasons.indexOf(seasonId);
    return index + 1; // 1-based season number
  }

  showMatchHistory(history: SeasonHistory): void {
    this.selectedHistory = history;
    this.showMatchHistoryDialog = true;
  }

  openMatchDetail(match: Match): void {
    this.selectedMatch = match;
    this.matchEvents = this.statisticsService.generateMatchEvents(
      match,
      this.getTeamName(match.homeTeamId),
      this.getTeamName(match.awayTeamId)
    );
    this.showMatchDetailDialog = true;
  }

  // Statistics methods
  getTopScorers(league: SimulatedLeague): any[] {
    // Get all matches from this league
    const allMatches = league.fixtures.flatMap((round) => round.matches);

    // Get all teams in this league
    const leagueTeams = this.teams.filter((team) =>
      league.teamIds.includes(team.id)
    );

    // Generate top scorers
    return this.statisticsService.generateTopScorers(allMatches, leagueTeams);
  }

  getFormGuide(league: SimulatedLeague): any[] {
    // Get all matches from this league
    const allMatches = league.fixtures.flatMap((round) => round.matches);

    // Generate form guide
    return this.statisticsService.generateFormGuide(
      allMatches,
      league.standings
    );
  }

  // Save/Load functionality
  saveSimulation(): void {
    this.simulationService.saveCurrentSimulation();
    this.hasSavedSimulation = true;
    this.messageService.add({
      severity: 'success',
      summary: 'Successful Save',
      detail: `You have successfully saved the current simulation.`,
      life: 5000,
    });
  }

  loadSimulation(): void {
    if (this.simulationService.loadSavedSimulation()) {
      // Successfully loaded
    }
  }

  checkForSavedSimulation(): void {
    const { state } = this.dataService.loadSimulation();
    this.hasSavedSimulation = !!state;
  }
  onTabChange(event: any) {
    if (this.simulationState?.simulatedLeagues) {
      const leagueId =
        this.simulationState.simulatedLeagues[event.index].leagueId;
      // Update the URL fragment without reloading
      this.router.navigate([], {
        relativeTo: this.route,
        fragment: leagueId,
        replaceUrl: true,
      });
    }
  }
}
