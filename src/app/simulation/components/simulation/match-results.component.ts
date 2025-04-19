import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { Match } from '@/simulation/models/league.models';
import { MatchService } from '@/simulation/services/match.service';
import { TeamService } from '@/simulation/services/team.service';
import { MatchCardComponent } from '../common/match-card.component';
import { StatisticsService } from '@/simulation/services/statistics.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-match-results',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    CardModule,
    DialogModule,
    MatchCardComponent,
  ],
  template: `
    <div class="p-4">
      <p-card header="Match Results" styleClass="shadow-lg mb-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (match of matches; track match.id) {
          <app-match-card
            [match]="match"
            [homeTeamName]="teamService.getTeamName(match.homeTeamId)"
            [awayTeamName]="teamService.getTeamName(match.awayTeamId)"
            [expandable]="true"
            [editable]="false"
            (viewDetails)="onViewMatchDetails($event)"
          >
          </app-match-card>
          }
        </div>

        <div *ngIf="matches.length === 0" class="text-center p-4">
          <p>No match results available.</p>
        </div>
      </p-card>

      <!-- Match Detail Dialog -->
      <p-dialog
        [(visible)]="displayMatchDetails"
        [modal]="true"
        [style]="{ width: '90%', maxWidth: '800px' }"
        [draggable]="false"
        [resizable]="false"
        header="Match Details"
      >
        @if (selectedMatch) {
        <div class="match-details p-4">
          <h2 class="text-xl font-bold text-center mb-4">
            {{ teamService.getTeamName(selectedMatch.homeTeamId) }}
            {{ selectedMatch.homeGoals }} - {{ selectedMatch.awayGoals }}
            {{ teamService.getTeamName(selectedMatch.awayTeamId) }}
          </h2>
          <div class="match-stats mt-4">
            <h3 class="font-semibold mb-2">Match Statistics</h3>
            <div class="grid grid-cols-3 gap-2 text-center">
              <!-- Mock statistics since your Match model doesn't have stats property -->
              <div>50%</div>
              <div class="font-medium">Possession</div>
              <div>50%</div>
              <div>
                {{
                  selectedMatch.homeGoals ? selectedMatch.homeGoals * 2 + 3 : 0
                }}
              </div>
              <div class="font-medium">Shots</div>
              <div>
                {{
                  selectedMatch.awayGoals ? selectedMatch.awayGoals * 2 + 3 : 0
                }}
              </div>
              <div>
                {{ selectedMatch.homeGoals ? selectedMatch.homeGoals + 2 : 0 }}
              </div>
              <div class="font-medium">Shots on Target</div>
              <div>
                {{ selectedMatch.awayGoals ? selectedMatch.awayGoals + 2 : 0 }}
              </div>
              <div>{{ mockCorners[0] }}</div>
              <div class="font-medium">Corners</div>
              <div>{{ mockCorners[1] }}</div>
              <div>{{ mockFouls[0] }}</div>
              <div class="font-medium">Fouls</div>
              <div>{{ mockFouls[1] }}</div>
            </div>
          </div>
          <div class="match-events mt-6">
            <h3 class="font-semibold mb-2">Match Events</h3>
            <div class="grid grid-cols-1 gap-2">
              @for (event of matchEvents; track $index) {
              <div class="event-item flex items-center p-2 border-b">
                <span class="minute w-12 text-sm font-semibold"
                  >{{ event.minute }}'</span
                >
                <span class="type w-24 text-sm">{{ event.type }}</span>
                <span class="player">{{ event.playerName }}</span>
                <span class="team ml-auto text-sm text-gray-600">
                  {{ teamService.getTeamName(event.teamId) }}
                </span>
              </div>
              }
            </div>
          </div>
        </div>
        }
      </p-dialog>
    </div>
  `,
})
export class MatchResultsComponent implements OnInit, OnDestroy {
  @Input() leagueId: string | null = null;
  @Input() matchday: number | null = null;

  matches: Match[] = [];
  displayMatchDetails: boolean = false;
  selectedMatch: Match | null = null;
  matchEvents: any[] = [];

  // For static mock stats
  mockCorners: [number, number] = [0, 0];
  mockFouls: [number, number] = [0, 0];

  private subscription: Subscription = new Subscription();

  constructor(
    public matchService: MatchService,
    public teamService: TeamService,
    private statisticsService: StatisticsService
  ) {}

  ngOnInit(): void {
    this.loadMatches();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadMatches(): void {
    if (this.leagueId && this.matchday) {
      // Get matches for specific league and matchday
      this.matches = this.matchService.getMatchesByLeagueAndMatchday(
        this.leagueId,
        this.matchday
      );
    } else if (this.leagueId) {
      // Get all matches for specific league
      this.matches = this.matchService.getMatchesByLeague(this.leagueId);
    } else {
      // Get all played matches across all leagues
      this.matches = this.matchService.getAllPlayedMatches();
    }
  }

  onViewMatchDetails(match: Match): void {
    this.selectedMatch = match;

    // Generate random mock stats for display
    this.mockCorners = [
      Math.floor(Math.random() * 10),
      Math.floor(Math.random() * 10),
    ];

    this.mockFouls = [
      Math.floor(Math.random() * 15),
      Math.floor(Math.random() * 15),
    ];

    // Generate mock events for this match
    this.matchEvents = this.generateMockEvents(match);

    this.displayMatchDetails = true;
  }

  // Helper method to generate mock events for a match
  private generateMockEvents(match: Match): any[] {
    const events: any[] = [];

    // Generate goal events
    if (match.homeGoals) {
      for (let i = 0; i < match.homeGoals; i++) {
        events.push({
          minute: Math.floor(Math.random() * 90) + 1,
          type: 'Goal',
          playerName: `Player ${Math.floor(Math.random() * 11) + 1}`,
          teamId: match.homeTeamId,
        });
      }
    }

    if (match.awayGoals) {
      for (let i = 0; i < match.awayGoals; i++) {
        events.push({
          minute: Math.floor(Math.random() * 90) + 1,
          type: 'Goal',
          playerName: `Player ${Math.floor(Math.random() * 11) + 1}`,
          teamId: match.awayTeamId,
        });
      }
    }

    // Add some yellow cards
    for (let i = 0; i < Math.floor(Math.random() * 5); i++) {
      const teamId = Math.random() > 0.5 ? match.homeTeamId : match.awayTeamId;
      events.push({
        minute: Math.floor(Math.random() * 90) + 1,
        type: 'Yellow Card',
        playerName: `Player ${Math.floor(Math.random() * 11) + 1}`,
        teamId,
      });
    }

    // Sort by minute
    events.sort((a, b) => a.minute - b.minute);
    return events;
  }
}
