export type BannerType =
  | "SINGLE_MATCH"
  | "MATCH_DAY"
  | "FIXTURE_ROUND"
  | "RESULT"
  | "GROUP_TABLE"
  | "CHAMPION";

export type BannerSize =
  | "SQUARE_1080x1080"
  | "STORY_1080x1920"
  | "LANDSCAPE_1920x1080"
  | "LINK_PREVIEW_1200x630";

export interface BannerDimensions {
  width: number;
  height: number;
}

export const BANNER_SIZES: Record<BannerSize, BannerDimensions> = {
  SQUARE_1080x1080: { width: 1080, height: 1080 },
  STORY_1080x1920: { width: 1080, height: 1920 },
  LANDSCAPE_1920x1080: { width: 1920, height: 1080 },
  LINK_PREVIEW_1200x630: { width: 1200, height: 630 },
};

export interface BannerThemeStyles {
  bgGradient: string;
  bgImageUrl?: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  mutedTextColor: string;
  cardBg: string;
  fontFamily: string;
  showBadges?: boolean;
  showSponsors?: boolean;
}

export interface MatchBannerData {
  tournamentName: string;
  tournamentLogo?: string | null;
  stageName: string;
  groupName?: string | null;
  roundNumber?: number;
  matchday?: number | null;
  dateStr: string;
  timeStr: string;
  venueName?: string | null;
  tagline?: string;
  sponsorName?: string;
  homeTeam: {
    name: string;
    shortName: string;
    logoUrl?: string | null;
    primaryColor?: string;
  };
  awayTeam: {
    name: string;
    shortName: string;
    logoUrl?: string | null;
    primaryColor?: string;
  };
  result?: {
    homeScore: number;
    awayScore: number;
    notes?: string;
  };
}

export interface DayMatchesBannerData {
  tournamentName: string;
  tournamentLogo?: string | null;
  dateStr: string;
  matches: Array<{
    homeTeamName: string;
    homeTeamShort: string;
    awayTeamName: string;
    awayTeamShort: string;
    timeStr: string;
    venueName?: string;
    homeScore?: number;
    awayScore?: number;
  }>;
}
