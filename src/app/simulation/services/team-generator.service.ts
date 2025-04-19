import { Injectable } from '@angular/core';
import { Team } from '@/simulation/models/league.models';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class TeamGeneratorService {
  private teamNameParts = {
    prefixes: [
      'FC',
      'United',
      'City',
      'Athletic',
      'Sporting',
      'Real',
      'Inter',
      'Dynamo',
      'Lokomotiv',
    ],
    cities: [
      'London',
      'Madrid',
      'Paris',
      'Berlin',
      'Rome',
      'Milan',
      'Amsterdam',
      'Lisbon',
      'Vienna',
      'Prague',
      'Athens',
    ],
  };

  generateRandomTeam(countryId: string): Team {
    const name = this.generateTeamName();
    const code = this.generateTeamCode(name);

    return {
      id: uuidv4(),
      name,
      teamCode: code,
      countryId,
      strength: Math.floor(Math.random() * 80) + 20, // 20-100 range
    };
  }

  generateMultipleTeams(countryId: string, count: number): Team[] {
    const teams: Team[] = [];

    for (let i = 0; i < count; i++) {
      teams.push(this.generateRandomTeam(countryId));
    }

    return teams;
  }

  private generateTeamName(): string {
    const usePrefix = Math.random() > 0.5;
    const city =
      this.teamNameParts.cities[
        Math.floor(Math.random() * this.teamNameParts.cities.length)
      ];

    if (usePrefix) {
      const prefix =
        this.teamNameParts.prefixes[
          Math.floor(Math.random() * this.teamNameParts.prefixes.length)
        ];
      return `${prefix} ${city}`;
    }

    return `${city} ${
      this.teamNameParts.prefixes[
        Math.floor(Math.random() * this.teamNameParts.prefixes.length)
      ]
    }`;
  }

  private generateTeamCode(name: string): string {
    // Extract first letters
    const words = name.split(' ');
    if (words.length >= 3) {
      return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    } else if (words.length === 2) {
      return (words[0][0] + words[1][0] + words[1][1]).toUpperCase();
    } else {
      return name.substring(0, 3).toUpperCase();
    }
  }
}
