/**
 * Client-side data layer.
 *
 * Why this exists:
 *   `next.config.ts` is set to `output: "export"`, so the project ships as a
 *   fully static SPA. There are no Next.js API routes available in `next dev`
 *   or in the production build. The Cloudflare Functions under
 *   `functions/api/*` are only reachable on the deployed Cloudflare Pages
 *   environment.
 *
 *   To make the UI show **real data** in local dev (and to remove the
 *   dependence on a server runtime at all), this module talks to Supabase
 *   directly from the browser using the public anon key. Supabase Row Level
 *   Security is the gatekeeper; the anon key is intentionally publishable.
 *
 *   For ops that need a server-side secret (rate limiting, IP hashing, AI
 *   avatar generation) the corresponding routes still fall back to the
 *   Cloudflare Functions. Those calls are best-effort.
 */

import { supabase } from "./supabase";
import { computeLevel, levelName } from "./level";

export type ToolEntry = { name: string; count: number };
export type ProvinceEntry = { name: string; value: number };
export type LevelEntry = { level: number; count: number };
export type Overview = { total: number; agentUsers: number; appUsers: number; todayNew: number };

export type RankingData = {
  tools: ToolEntry[];
  provinces: ProvinceEntry[];
  levels: LevelEntry[];
  overview: Overview;
  filters: { userType: string; tool: string };
};

export type LatestCard = {
  nickname: string;
  province: string;
  primary_tool: string;
  tools: string[];
  ai_level: number;
  ai_level_name: string;
  avatar_seed: string;
  card_slug: string;
  created_at: string | null;
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

export type SubmitPayload = {
  nickname?: string;
  province: string;
  city?: string;
  occupation?: string;
  user_type: "agent" | "app";
  tools: string[];
  primary_tool: string;
  usage_frequency: string;
  usage_purpose?: string[];
  honeypot?: string;
  submit_duration_ms?: number;
};

export type SubmitResult = {
  ai_level: number;
  ai_level_name: string;
  card_slug: string;
  avatar_seed: string;
};

type ApiError = { error: string };

function isApiError(value: unknown): value is ApiError {
  return !!value && typeof value === "object" && "error" in (value as object) && typeof (value as { error: unknown }).error === "string";
}

function fail(message: string): never {
  throw new Error(message);
}

function cleanString(value: string | null | undefined, fallback = ""): string {
  if (value == null) return fallback;
  return String(value).trim();
}

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(16).padStart(8, "0");
}

function generateSeed(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function generateSlug(): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "";
  for (let i = 0; i < 8; i++) slug += alphabet[Math.floor(Math.random() * alphabet.length)];
  return slug;
}

/* ------------------------------------------------------------------ */
/*  Reads                                                              */
/* ------------------------------------------------------------------ */

type UserRow = {
  tools: string[] | null;
  province: string | null;
  ai_level: number | null;
  created_at: string | null;
  user_type: string | null;
  status?: string | null;
};

export type RankingFilters = {
  userType?: "all" | "agent" | "app";
  tool?: string;
};

export async function fetchRanking(filters: RankingFilters = {}): Promise<RankingData> {
  const userType = filters.userType ?? "all";
  const selectedTool = filters.tool ?? "";

  const select = "tools,province,ai_level,created_at,user_type,status";
  let query = supabase.from("users").select(select).limit(50000);
  // Prefer "valid" filter if column exists; if it errors we fall through.
  query = query.eq("status", "valid");
  const first = await query;
  let data = first.data;
  if (first.error) {
    const fallback = await supabase.from("users").select(select).limit(50000);
    if (fallback.error) fail(fallback.error.message);
    data = fallback.data;
  }

  const rows = (data ?? []) as UserRow[];
  const filtered = rows.filter((row) => {
    const matchesUserType = userType === "all" ? true : row.user_type === userType;
    const matchesTool = selectedTool ? Array.isArray(row.tools) && row.tools.includes(selectedTool) : true;
    return matchesUserType && matchesTool;
  });

  const toolMap = new Map<string, number>();
  const provinceMap = new Map<string, number>();
  const levelMap = new Map<number, number>();
  const todayPrefix = new Date().toISOString().split("T")[0];
  let todayNew = 0;

  for (const row of filtered) {
    const tools = row.tools ?? [];
    for (const tool of tools) toolMap.set(tool, (toolMap.get(tool) ?? 0) + 1);
    if (row.province) provinceMap.set(row.province, (provinceMap.get(row.province) ?? 0) + 1);
    const level = row.ai_level ?? 1;
    levelMap.set(level, (levelMap.get(level) ?? 0) + 1);
    if (row.created_at && row.created_at.startsWith(todayPrefix)) todayNew++;
  }

  const tools: ToolEntry[] = [...toolMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  const provinces: ProvinceEntry[] = [...provinceMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const levels: LevelEntry[] = Array.from({ length: 5 }, (_, i) => i + 1).map((level) => ({
    level,
    count: levelMap.get(level) ?? 0,
  }));
  const total = filtered.length;
  const agentUsers = filtered.filter((row) => row.user_type === "agent").length;
  const appUsers = filtered.filter((row) => row.user_type === "app").length;

  return {
    tools,
    provinces,
    levels,
    overview: { total, agentUsers, appUsers, todayNew },
    filters: { userType, tool: selectedTool },
  };
}

export async function fetchLatestCards(limit = 12): Promise<LatestCard[]> {
  const select = "nickname,province,primary_tool,tools,ai_level,ai_level_name,avatar_seed,card_slug,created_at,status";
  let query = supabase
    .from("users")
    .select(select)
    .order("created_at", { ascending: false })
    .limit(limit);
  query = query.eq("status", "valid");
  const first = await query;
  let data = first.data;
  if (first.error) {
    const fallback = await supabase
      .from("users")
      .select(select)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (fallback.error) fail(fallback.error.message);
    data = fallback.data;
  }
  if (!data) return [];
  return data.map((row, index) => {
    const r = row as Record<string, unknown>;
    return {
      nickname: cleanString(r.nickname as string) || `Agent_${String(index + 1).padStart(2, "0")}`,
      province: cleanString(r.province as string) || "未知地区",
      primary_tool: cleanString(r.primary_tool as string) || cleanString((r.tools as string[] | null)?.[0]) || "Codex",
      tools: Array.isArray(r.tools) ? (r.tools as string[]) : [],
      ai_level: typeof r.ai_level === "number" ? (r.ai_level as number) : 1,
      ai_level_name: cleanString(r.ai_level_name as string) || "L1",
      avatar_seed: cleanString(r.avatar_seed as string) || cleanString(r.card_slug as string) || `${Date.now()}-${index}`,
      card_slug: cleanString(r.card_slug as string),
      created_at: (r.created_at as string) ?? null,
    };
  });
}

export async function fetchCard(slug: string): Promise<CardData> {
  const select = "nickname,province,tools,primary_tool,ai_level,ai_level_name,avatar_seed,card_slug,created_at,status";
  let query = supabase.from("users").select(select).eq("card_slug", slug).limit(1);
  query = query.eq("status", "valid");
  const first = await query;
  let data = first.data;
  if (first.error) {
    const fallback = await supabase.from("users").select(select).eq("card_slug", slug).limit(1);
    if (fallback.error) fail(fallback.error.message);
    data = fallback.data;
  }
  if (!data || data.length === 0) fail("卡片不存在");
  const card = data[0] as Record<string, unknown>;

  // user_number: count of valid records with created_at < this one
  let userNumber = 1;
  const createdAt = card.created_at as string | undefined;
  if (createdAt) {
    const countSelect = "id,status";
    let countQuery = supabase.from("users").select(countSelect).lt("created_at", createdAt);
    countQuery = countQuery.eq("status", "valid");
    let count = await countQuery;
    if (count.error) {
      count = await supabase.from("users").select(countSelect).lt("created_at", createdAt);
    }
    if (!count.error && count.data) {
      userNumber = (count.data?.length ?? 0) + 1;
    }
  }

  return {
    nickname: cleanString(card.nickname as string) || "AI 用户",
    ai_level: typeof card.ai_level === "number" ? (card.ai_level as number) : 1,
    ai_level_name: cleanString(card.ai_level_name as string) || "L1",
    primary_tool: cleanString(card.primary_tool as string) || cleanString((card.tools as string[] | null)?.[0] ?? ""),
    tools: Array.isArray(card.tools) ? (card.tools as string[]) : [],
    avatar_seed: cleanString(card.avatar_seed as string) || slug,
    province: cleanString(card.province as string),
    created_at: createdAt ?? new Date().toISOString(),
    user_number: userNumber,
  };
}

/* ------------------------------------------------------------------ */
/*  Writes                                                             */
/* ------------------------------------------------------------------ */

/**
 * Submit a new card.
 *
 * Prefers the Cloudflare Function `/api/submit` because it enforces
 * honeypot + timing + rate-limit and can store IP-hash with the service
 * role. Falls back to a direct Supabase insert (with a locally-computed
 * IP hash from `navigator.userAgent`) so the form still works in static
 * dev environments.
 */
export async function submitCard(payload: SubmitPayload): Promise<SubmitResult> {
  // Try the Cloudflare Function first (production).
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const body = (await res.json()) as SubmitResult | ApiError;
      if (!isApiError(body)) return body;
    }
  } catch {
    // ignore — fall through to direct insert
  }

  // Direct Supabase fallback for static dev environments.
  if (payload.honeypot) fail("提交失败");
  if (payload.submit_duration_ms != null && payload.submit_duration_ms < 3000) {
    fail("提交过快，请稍后重试");
  }
  if (!payload.province || !Array.isArray(payload.tools) || payload.tools.length === 0) {
    fail("province and at least one tool are required");
  }
  const normalizedUserType: "agent" | "app" = payload.user_type === "agent" ? "agent" : "app";
  const aiLevel = computeLevel(normalizedUserType, payload.tools);
  const aiLevelName = levelName(aiLevel);
  const avatarSeed = generateSeed();
  const cardSlug = generateSlug();
  const ipHash = simpleHash(typeof navigator !== "undefined" ? navigator.userAgent : "anon");

  const fullPayload = {
    province: payload.province,
    city: payload.city || null,
    user_type: normalizedUserType,
    tools: payload.tools,
    ai_level: aiLevel,
    nickname: payload.nickname || null,
    occupation: payload.occupation || null,
    primary_tool: payload.primary_tool || payload.tools[0] || null,
    usage_frequency: payload.usage_frequency || null,
    usage_purpose: payload.usage_purpose || null,
    ai_level_name: aiLevelName,
    avatar_seed: avatarSeed,
    card_slug: cardSlug,
    ip_hash: ipHash,
    visitor_hash: simpleHash(ipHash + (typeof navigator !== "undefined" ? navigator.userAgent : "")),
    status: "valid",
  };

  const { data, error } = await supabase.from("users").insert(fullPayload).select().single();
  if (error) {
    // Schema fallback (try minimal)
    const minimal = {
      province: payload.province,
      city: payload.city || null,
      user_type: normalizedUserType,
      tools: payload.tools,
      ai_level: aiLevel,
    };
    const retry = await supabase.from("users").insert(minimal).select().single();
    if (retry.error) fail(retry.error.message);
    const row = (retry.data ?? {}) as Record<string, unknown>;
    return {
      ai_level: typeof row.ai_level === "number" ? (row.ai_level as number) : aiLevel,
      ai_level_name: cleanString(row.ai_level_name as string) || aiLevelName,
      card_slug: cleanString(row.card_slug as string) || cardSlug,
      avatar_seed: cleanString(row.avatar_seed as string) || avatarSeed,
    };
  }
  const row = (data ?? {}) as Record<string, unknown>;
  return {
    ai_level: typeof row.ai_level === "number" ? (row.ai_level as number) : aiLevel,
    ai_level_name: cleanString(row.ai_level_name as string) || aiLevelName,
    card_slug: cleanString(row.card_slug as string) || cardSlug,
    avatar_seed: cleanString(row.avatar_seed as string) || avatarSeed,
  };
}

/* ------------------------------------------------------------------ */
/*  AI avatar (optional)                                               */
/* ------------------------------------------------------------------ */

/**
 * Best-effort AI avatar generation. Returns null if the Cloudflare
 * Function is unavailable. Callers should keep the deterministic SVG
 * generated by `lib/avatar.ts` as a graceful default.
 */
export async function generateAiAvatar(seed: string, level: number, tools: string[]): Promise<string | null> {
  try {
    const res = await fetch("/api/generate-avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seed, level, tools }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { url?: string };
    return body.url ?? null;
  } catch {
    return null;
  }
}
