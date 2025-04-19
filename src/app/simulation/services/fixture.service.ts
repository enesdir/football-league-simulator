import { Injectable } from '@angular/core';
import { Match, Round, Team } from '@/simulation/models/league.models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class FixtureService {
  generateFixtures(teams: Team[]): Round[] {
    if (teams.length < 2) {
      throw new Error('At least 2 teams are required to generate fixtures');
    }

    // If odd number of teams, add a dummy team
    const teamIds = [...teams.map((t) => t.id)];
    if (teamIds.length % 2 !== 0) {
      teamIds.push('dummy');
    }

    const numberOfTeams = teamIds.length;
    const matchesPerRound = numberOfTeams / 2;
    const rounds: Round[] = [];

    // First half of the season (home matches)
    for (let round = 0; round < numberOfTeams - 1; round++) {
      const matches: Match[] = [];

      for (let match = 0; match < matchesPerRound; match++) {
        const home = (round + match) % (numberOfTeams - 1);
        let away = (numberOfTeams - 1 - match + round) % (numberOfTeams - 1);

        // Last team stays in the same position (plays against rotating teams)
        if (match === 0) {
          away = numberOfTeams - 1;
        }

        // Skip matches involving the dummy team
        if (teamIds[home] !== 'dummy' && teamIds[away] !== 'dummy') {
          matches.push({
            id: uuidv4(),
            homeTeamId: teamIds[home],
            awayTeamId: teamIds[away],
            played: false,
            roundNumber: round + 1,
          });
        }
      }

      // Add the round if it has matches (can be empty if dummy team is involved)
      if (matches.length > 0) {
        rounds.push({
          roundNumber: round + 1,
          matches,
        });
      }
    }

    // Second half of the season (reverse home/away)
    const firstHalfRounds = rounds.length;
    for (let i = 0; i < firstHalfRounds; i++) {
      const originalRound = rounds[i];
      const reverseMatches: Match[] = originalRound.matches.map((match) => ({
        id: uuidv4(),
        homeTeamId: match.awayTeamId,
        awayTeamId: match.homeTeamId,
        played: false,
        roundNumber: i + 1 + firstHalfRounds,
      }));

      rounds.push({
        roundNumber: i + 1 + firstHalfRounds,
        matches: reverseMatches,
      });
    }

    return rounds;
  }

  shuffleFixtures(rounds: Round[]): Round[] {
    // Create a deep copy of the rounds
    const shuffledRounds = JSON.parse(JSON.stringify(rounds)) as Round[];

    // Shuffle the order of matches within each round
    shuffledRounds.forEach((round) => {
      round.matches = this.shuffleArray([...round.matches]);
    });

    return shuffledRounds;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
