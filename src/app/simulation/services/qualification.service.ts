import { Injectable } from '@angular/core';
import {
  Standing,
  UEFACompetition,
  UEFAQualificationRule,
  LocalQualificationRule,
  PromotionRelegationRule,
} from '@/simulation/models/league.models';

@Injectable({
  providedIn: 'root',
})
export class QualificationService {
  calculateUEFAQualifiers(
    standings: Standing[],
    rules: UEFAQualificationRule[]
  ): Map<UEFACompetition, string[]> {
    const qualifiers = new Map<UEFACompetition, string[]>();

    // Initialize map for each competition
    Object.values(UEFACompetition).forEach((comp) => {
      qualifiers.set(comp, []);
    });

    // Process rules in priority order (lower number = higher priority)
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (rule.source !== 'league' || !rule.positions) continue;

      const [start, end] = rule.positions;
      const qualifyingTeams = standings
        .filter((s) => s.position >= start && s.position <= end)
        .map((s) => s.teamId);

      // Add teams to their respective competition
      const existingTeams = qualifiers.get(rule.competition) || [];
      qualifiers.set(rule.competition, [...existingTeams, ...qualifyingTeams]);
    }

    return qualifiers;
  }

  calculatePromotions(
    standings: Standing[],
    rules: PromotionRelegationRule[]
  ): string[] {
    const promotedTeams: string[] = [];

    for (const rule of rules) {
      // For automatic promotions
      if (rule.type === 'automatic') {
        const qualifyingTeams = standings
          .filter((s) => rule.positions.includes(s.position))
          .map((s) => s.teamId);

        promotedTeams.push(...qualifyingTeams);
      }

      // For playoff promotions, we would need to simulate playoffs
      // This is a simplified implementation
      if (rule.type === 'playoff') {
        // In a real implementation, you'd simulate playoff matches
        // For simplicity, we'll just take the highest positioned team
        const playoffTeams = standings
          .filter((s) => rule.positions.includes(s.position))
          .sort((a, b) => a.position - b.position);

        if (playoffTeams.length > 0) {
          promotedTeams.push(playoffTeams[0].teamId);
        }
      }
    }

    return promotedTeams;
  }

  calculateRelegations(
    standings: Standing[],
    rules: PromotionRelegationRule[]
  ): string[] {
    const relegatedTeams: string[] = [];

    for (const rule of rules) {
      // For automatic relegations
      if (rule.type === 'automatic') {
        const qualifyingTeams = standings
          .filter((s) => rule.positions.includes(s.position))
          .map((s) => s.teamId);

        relegatedTeams.push(...qualifyingTeams);
      }

      // For playoff relegations (simplified)
      if (rule.type === 'playoff') {
        const playoffTeams = standings
          .filter((s) => rule.positions.includes(s.position))
          .sort((a, b) => b.position - a.position); // Highest position has better chance

        if (playoffTeams.length > 0) {
          relegatedTeams.push(playoffTeams[0].teamId);
        }
      }
    }

    return relegatedTeams;
  }

  processLeagueCupQualification(
    cupWinnerId: string,
    rules: LocalQualificationRule[]
  ): Map<UEFACompetition, string[]> {
    const qualifiers = new Map<UEFACompetition, string[]>();

    for (const rule of rules) {
      if (rule.qualificationPath !== 'winner' || !rule.grantsAccessTo) continue;

      const competition = rule.grantsAccessTo.competition;
      qualifiers.set(competition, [cupWinnerId]);
    }

    return qualifiers;
  }

  resolveSlotConflicts(
    uefaQualifiers: Map<UEFACompetition, string[]>,
    cupQualifiers: Map<UEFACompetition, string[]>,
    standings: Standing[]
  ): Map<UEFACompetition, string[]> {
    const finalQualifiers = new Map<UEFACompetition, string[]>();

    // Initialize with league qualifiers
    for (const [competition, teams] of uefaQualifiers.entries()) {
      finalQualifiers.set(competition, [...teams]);
    }

    // Add cup winners if they haven't qualified through the league
    for (const [competition, teams] of cupQualifiers.entries()) {
      const alreadyQualified = Array.from(finalQualifiers.values()).flat();
      const newQualifiers = teams.filter(
        (team) => !alreadyQualified.includes(team)
      );

      if (newQualifiers.length > 0) {
        const existing = finalQualifiers.get(competition) || [];
        finalQualifiers.set(competition, [...existing, ...newQualifiers]);
      } else {
        // Cup winner already qualified, give spot to next league position
        const leagueQualifiers = uefaQualifiers.get(competition) || [];
        const nextTeam = this.getNextQualifier(standings, leagueQualifiers);

        if (nextTeam) {
          const existing = finalQualifiers.get(competition) || [];
          finalQualifiers.set(competition, [...existing, nextTeam]);
        }
      }
    }

    return finalQualifiers;
  }

  private getNextQualifier(
    standings: Standing[],
    alreadyQualified: string[]
  ): string | undefined {
    for (const standing of standings) {
      if (!alreadyQualified.includes(standing.teamId)) {
        return standing.teamId;
      }
    }
    return undefined;
  }
}
