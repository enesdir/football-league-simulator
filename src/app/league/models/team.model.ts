export interface Team {
  id: number;
  name: string;
  strength: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference?: number;
  championshipProbability?: number;
  noChance?: boolean;
  hasChance?: boolean;
}
