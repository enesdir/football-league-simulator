import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { Standing } from '@/simulation/models/league.models';

@Component({
  selector: 'app-points-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="chart-container">
      <p-chart
        type="line"
        [data]="chartData"
        [options]="chartOptions"
      ></p-chart>
    </div>
  `,
})
export class PointsChartComponent implements OnChanges {
  @Input() standings: Standing[] = [];
  @Input() teamNames: Record<string, string> = {};
  @Input() roundsPlayed = 0;
  @Input() totalRounds = 0;

  chartData: any;
  chartOptions: any = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Points',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Round',
        },
      },
    },
  };

  ngOnChanges(changes: SimpleChanges): void {
    this.updateChart();
  }

  private updateChart(): void {
    // Take top 5 teams for the chart
    const topTeams = [...this.standings]
      .sort((a, b) => a.position - b.position)
      .slice(0, 5);

    const labels = Array.from(
      { length: this.roundsPlayed },
      (_, i) => `Week ${i + 1}`
    );

    // Generate random colors for teams
    const colors = [
      'rgb(255, 99, 132)', // red
      'rgb(54, 162, 235)', // blue
      'rgb(255, 206, 86)', // yellow
      'rgb(75, 192, 192)', // green
      'rgb(153, 102, 255)', // purple
    ];

    // Create datasets for each team
    // In a real application, you would have historical data for each round
    // Here, we're just simulating the progression
    const datasets = topTeams.map((team, index) => {
      // Simulate points progression
      const pointsPerRound = this.simulatePointsProgression(
        team,
        this.roundsPlayed
      );

      return {
        label: this.teamNames[team.teamId] || 'Unknown',
        data: pointsPerRound,
        fill: false,
        borderColor: colors[index % colors.length],
        tension: 0.1,
      };
    });

    this.chartData = {
      labels,
      datasets,
    };
  }

  private simulatePointsProgression(team: Standing, rounds: number): number[] {
    // In a real app, this would come from actual historical data
    // Here we're just creating a plausible progression
    const points = [];
    const avgPointsPerRound = team.points / team.played;
    let currentPoints = 0;

    for (let i = 0; i < rounds; i++) {
      // Add some randomness around the average
      const pointsGained =
        Math.random() < 0.5 ? 0 : Math.random() < 0.3 ? 1 : 3;

      currentPoints += pointsGained;
      points.push(currentPoints);
    }

    // Ensure the final points match the actual points
    const adjustment = team.points - currentPoints;
    points[points.length - 1] += adjustment;

    return points;
  }
}
