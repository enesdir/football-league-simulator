import type { Team } from './team.model';

/**
 * Represents a football league.
 *
 * @interface League
 * @property {string} id - The unique identifier for the league.
 * @property {string} name - The name of the league.
 * @property {string} country - The country where the league is based.
 * @property {Team[]} teams - The list of teams participating in the league.
 * @property {string} [logo] - An optional URL or path to the league's logo.
 */
export interface League {
  id: string;
  name: string;
  shortName?: string;
  country: string;
  teams: Team[];
  logo?: string;
}
