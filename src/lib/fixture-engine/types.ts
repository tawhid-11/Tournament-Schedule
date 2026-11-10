export interface EngineTeam {
  id: string;
  name: string;
  shortName?: string;
  seed?: number | null;
  pot?: number | null;
  logoUrl?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  isWithdrawn?: boolean;
}

export type SourceRule = "WINNER" | "LOSER";

export interface EngineMatch {
  id: string;
  stageId: string;
  groupId?: string | null;
  round: number;
  matchday?: number;
  matchNumber: number;
  leg: number;
  homeTeamId?: string | null;
  awayTeamId?: string | null;
  homePlaceholder?: string | null;
  awayPlaceholder?: string | null;
  homeSourceMatchId?: string | null;
  awaySourceMatchId?: string | null;
  homeSourceRule?: SourceRule | null;
  awaySourceRule?: SourceRule | null;
  isBye?: boolean;
  branch?: "WINNERS" | "LOSERS" | "FINAL" | "THIRD_PLACE";
  scheduledAt?: Date | null;
  venueId?: string | null;
  status?: "SCHEDULED" | "LIVE" | "COMPLETED" | "POSTPONED" | "CANCELLED" | "WALKOVER";
  winnerTeamId?: string | null;
}

export interface RoundRobinOptions {
  stageId: string;
  groupId?: string | null;
  legs?: 1 | 2;
  startRound?: number;
  startMatchNumber?: number;
}

export interface SingleEliminationOptions {
  stageId: string;
  hasThirdPlace?: boolean;
  startRound?: number;
  startMatchNumber?: number;
}

export interface DoubleEliminationOptions {
  stageId: string;
  grandFinalReset?: boolean;
  startRound?: number;
  startMatchNumber?: number;
}

export interface SwissOptions {
  stageId: string;
  rounds?: number;
  currentRound?: number;
  previousMatches?: Array<{
    homeTeamId: string;
    awayTeamId: string;
  }>;
}

export type TieBreakerRule =
  | "POINTS"
  | "GOAL_DIFFERENCE"
  | "GOALS_FOR"
  | "HEAD_TO_HEAD"
  | "WINS";

export interface StandingEntry {
  teamId: string;
  teamName: string;
  teamShortName?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: Array<"W" | "D" | "L">;
  rank: number;
}

export interface MatchScoreInput {
  homeScore: number;
  awayScore: number;
  isWalkover?: boolean;
  walkoverWinnerId?: string;
  isExtraTime?: boolean;
  isPenalties?: boolean;
  homePenaltyScore?: number;
  awayPenaltyScore?: number;
}
