import { Team } from './team.model';

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  homeGoals?: number;
  awayGoals?: number;
  played: boolean;
  week: number;
  editable?: boolean;
}
