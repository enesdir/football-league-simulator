import { Team } from '../models/team.model';

export const DEFAULT_TEAM_NAMES: string[] = [
  'Team A',
  'Team B',
  'Team C',
  'Team D',

  'Team E',
  'Team F',
  'Team G',
  'Team H',

  'Team I',
  'Team J',
  'Team K',
  'Team L',

  'Team M',
  'Team N',
  'Team O',
  'Team P',

  'Team Q',
  'Team R',
  'Team S',
  'Team T',
];

export const DEFAULT_TEAMS: Team[] = [
  {
    id: 1,
    name: 'Team 1',
    strength: 80,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    hasChance: true,
  },

  {
    id: 2,
    name: 'Team 2',
    strength: 80,
    points: 0,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    hasChance: true,
  },
];
