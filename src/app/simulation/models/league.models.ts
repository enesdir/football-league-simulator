export enum UEFACompetition {
  UCL = 'UCL',
  UEL = 'UEL',
  UECL = 'UECL',
}

export enum Tiebreaker {
  Points = 'points',
  GoalDifference = 'goalDifference',
  GoalsFor = 'goalsFor',
  HeadToHead = 'headToHead',
  Alphabetical = 'alphabetical',
}

export enum LocalCupName {
  CopaDelRey = 'copa-del-rey',
  FaCup = 'fa-cup',
  EflCup = 'efl-cup',
  CoppaItalia = 'coppa-italia',
  CoupeDeFrance = 'coupe-de-france',
  TurkishCup = 'turkish-cup',
  GenericDomesticCup = 'generic-domestic-cup',
  GenericLeagueCup = 'generic-league-cup',
  GenericSuperCup = 'generic-super-cup',
}

export type SlotTransferCondition = 'already-qualified' | 'league-position';
export type SlotTransferAction =
  | 'cup-runner-up'
  | 'next-league-position'
  | 'specific-competition';

export interface Team {
  readonly id: string;
  readonly teamCode: string; // 3-letter code
  readonly countryId: string;
  readonly stadiumId?: string;
  readonly name: string;
  readonly strength: number; // 0–100
  readonly logo?: string;
}

export interface Stadium {
  readonly id: string;
  readonly name: string;
  readonly teamId: string;
  readonly countryId: string;
  readonly capacity: number;
  readonly location: string;
  readonly surface: string;
  readonly yearBuilt: number;
}

export interface Country {
  readonly id: string | 'custom'; // e.g. 'england'
  readonly name: string | 'Custom'; // e.g. 'England'
  readonly leagueIds: string[];
  readonly cupIds?: string[];
  readonly association?: string;
  readonly uefaAssociation?: string;
  readonly flag?: string;
}

export interface CupCompetition {
  readonly id: string;
  readonly name: string;
  readonly type: 'knockout' | 'group+knockout';
  readonly qualificationRules: (
    | UEFAQualificationRule
    | LocalQualificationRule
  )[];
  readonly logo?: string;
}

export interface PromotionRelegationRule {
  readonly type: 'automatic' | 'playoff';
  readonly positions: number[]; // e.g. [1,2] or [18,19,20]
  readonly targetLeagueId: string;
  readonly playoffConfig?: {
    // optional playoff settings
    rounds: number;
  };
}

export interface SlotTransferRule {
  readonly when: SlotTransferCondition;
  readonly action: SlotTransferAction;
  readonly targetCompetition?: UEFACompetition;
}

export interface UEFAQualificationRule {
  readonly type: 'uefa';
  readonly competition: UEFACompetition;
  readonly qualificationType: 'automatic' | 'playoff';
  readonly source: 'league' | 'cup';
  readonly positions?: [number, number];
  readonly cupId?: string;
  readonly entryStage?: 'group' | 'q3' | 'q2' | 'q1';
  readonly priority: number; // lower = higher priority
  readonly slotTransfer?: SlotTransferRule;
}

export interface LocalQualificationRule {
  readonly type: 'local';
  readonly competition: LocalCupName;
  readonly qualificationPath: 'winner' | 'runner-up' | 'semifinalist';
  readonly grantsAccessTo?: {
    competition: UEFACompetition;
    priority: number;
    slotTransfer?: SlotTransferRule;
  };
  readonly domesticConsequence?: 'super-cup' | 'relegation-exemption';
}

export interface LeagueRules {
  readonly uefaQualifications?: UEFAQualificationRule[];
  readonly localQualifications?: LocalQualificationRule[];
  readonly promotions?: PromotionRelegationRule[];
  readonly relegations?: PromotionRelegationRule[];
  readonly tiebreakerOrder: Tiebreaker[];
}

export interface League {
  readonly id: string;
  readonly name: string;
  readonly shortName?: string;
  readonly countryId: string;
  readonly teamIds: string[];
  readonly logo?: string;
  readonly dataFile?: string; // JSON source
  readonly rules: LeagueRules;
  readonly subLeagueId?: string | null;
  readonly parentLeagueId?: string | null;
}

export interface DomainSeason {
  readonly id: string;
  readonly start: Date;
  readonly end: Date;
  readonly leagueIds: string[];
}

export interface Standing {
  teamId: string;
  position: number; // 1-based rank
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  championshipChance?: number; // 0–100%
  hasChampionshipChance?: boolean;
}

export interface LeagueStanding {
  leagueId: string;
  seasonId: string;
  standings: Standing[];
}

// Single match in a round
export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeGoals?: number;
  awayGoals?: number;
  played: boolean;
  roundNumber: number;
  isEdited?: boolean; // user override flag
  strengthDifference?: number; // computed at simulation time
}

export interface Round {
  roundNumber: number;
  matches: Match[];
}

export interface SimulatedLeague {
  leagueId: string;
  name: string;
  level: number; // division level
  teamIds: string[];
  standings: Standing[];
  fixtures: Round[];
  currentRoundIndex: number; // next round to play
  isFinished: boolean;
}

export interface SimulatedCup {
  cupId: string;
  name: string;
  rounds: Round[];
  currentRoundIndex: number;
  isFinished: boolean;
}

export interface SimulationState {
  seasonId: string;
  countryId: string | 'custom';
  simulatedLeagues: SimulatedLeague[];
  simulatedCups?: SimulatedCup[];
  isSeasonFinished: boolean;
}

export interface MatchHistory {
  matchId: string;
  editorId: string;
  timestamp: Date;
  oldHomeGoals?: number;
  oldAwayGoals?: number;
}

export interface SeasonHistory {
  id: string;
  seasonId: string;
  leagueId: string;
  championTeamId: string | null;
  promotedTeamIds: string[];
  relegatedTeamIds: string[];
  uefaQualifiers?: {
    competition: UEFACompetition;
    teamIds: string[];
  }[];
  standings: Standing[];
  rounds: Round[];
  matchHistories?: MatchHistory[];
}
