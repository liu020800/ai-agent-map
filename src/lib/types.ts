export type UserType = "app" | "agent";

export type SurveyPayload = {
  nickname?: string;
  province: string;
  city?: string;
  occupation?: string;
  user_type: UserType;
  tools: string[];
  primary_tool?: string;
  usage_frequency?: string;
  usage_purpose?: string[];
  honeypot?: string;
  submit_duration_ms?: number;
};

export type UserRow = {
  id: string;
  nickname: string | null;
  province: string;
  city: string | null;
  occupation: string | null;
  user_type: UserType;
  tools: string[];
  primary_tool: string | null;
  usage_frequency: string | null;
  usage_purpose: string[] | null;
  ai_level: number;
  ai_level_name: string;
  avatar_seed: string;
  card_slug: string;
  visitor_hash: string | null;
  ip_hash: string | null;
  turnstile_passed: boolean;
  honeypot: string | null;
  submit_duration_ms: number | null;
  status: string;
  created_at: string;
};

export type StatsOverview = {
  total: number;
  agentUsers: number;
  appUsers: number;
  todayNew: number;
};

export type ToolStat = { name: string; count: number };
export type ProvinceStat = { name: string; value: number };
export type LevelStat = { level: number; count: number };

export type RankingData = {
  tools: ToolStat[];
  provinces: ProvinceStat[];
  levels: LevelStat[];
  overview: StatsOverview;
};

export type CardData = {
  nickname: string;
  ai_level: number;
  ai_level_name: string;
  primary_tool: string;
  tools: string[];
  avatar_seed: string;
  province: string;
  created_at: string;
  user_number: number;
};

/* ------------------------------------------------------------------ */
/*  Trends                                                              */
/* ------------------------------------------------------------------ */

export type TrendDirection = "up" | "down" | "stable";

export type ToolTrend = {
  id: string;
  name: string;
  category: "agent" | "app" | "automation" | "local";
  users: number;
  growthRate: number;
  heat: number;
  direction: TrendDirection;
};

export type TrendsMatrix = {
  id: string;
  title: string;
  description: string;
  heat: number;
  direction: TrendDirection;
  label: "Rising" | "Stable" | "Exploding" | "Cooling";
  tools: string[];
};

export type TrendsSnapshot = {
  generatedAt: string;
  todayNewSignals: number;
  fastestGrowing: string;
  fastestGrowthRate: number;
  mostActiveScene: string;
  totalTools: number;
  agentShare: number;
  tools: ToolTrend[];
  matrix: TrendsMatrix[];
  timeline: { day: string; signals: number; active: number }[];
  roleDistribution: { role: string; share: number; tone: string }[];
};

export type SurveyFormPayload = {
  tools: string[];
  scenarios: string[];
  province: string;
  city: string;
  nickname?: string;
  signature?: string;
  userType: "agent" | "app";
  roleTitle: string;
  agentLevel: number;
  signalStrength: number;
  identityId: string;
  createdAt: string;
};
