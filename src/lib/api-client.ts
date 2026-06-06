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

export const STORAGE_KEYS = {
  visitorId: "ai_agent_map_visitor_id",
  cardId: "ai_agent_map_card_id",
  cardCache: "ai_agent_map_card_cache",
} as const;

export type ToolEntry = { name: string; count: number };
export type ProvinceEntry = { name: string; value: number };
export type CityEntry = { city: string; province: string; count: number; topTool: string; topRole: string };
export type RoleEntry = { role: string; count: number; topTool: string };
export type LevelEntry = { level: number; count: number };
export type Overview = { total: number; agentUsers: number; appUsers: number; todayNew: number };
export type TimelineEntry = { day: string; signals: number; active: number };

export type RankingData = {
  tools: ToolEntry[];
  provinces: ProvinceEntry[];
  cities: CityEntry[];
  roles: RoleEntry[];
  levels: LevelEntry[];
  timeline?: TimelineEntry[];
  overview: Overview;
  filters: { userType: string; tool: string };
};

export type LatestCard = {
  nickname: string;
  province: string;
  city?: string;
  role?: string;
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
  city?: string | null;
  occupation?: string | null;
  usage_purpose?: string[] | null;
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

  try {
    const params = new URLSearchParams();
    if (userType !== "all") params.set("userType", userType);
    if (selectedTool) params.set("tool", selectedTool);
    const res = await fetch(`/api/ranking${params.toString() ? `?${params.toString()}` : ""}`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const body = (await res.json()) as RankingData;
      if (body?.overview) return body;
    }
  } catch {
    // Cloudflare Functions are unavailable in local static previews.
  }

  const select = "tools,province,city,occupation,usage_purpose,ai_level,created_at,user_type,status";
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
  const cityMap = new Map<string, { city: string; province: string; count: number; toolCounts: Map<string, number>; roleCounts: Map<string, number> }>();
  const roleMap = new Map<string, { count: number; toolCounts: Map<string, number> }>();
  const levelMap = new Map<number, number>();
  const todayPrefix = new Date().toISOString().split("T")[0];
  let todayNew = 0;

  for (const row of filtered) {
    const tools = row.tools ?? [];
    for (const tool of tools) toolMap.set(tool, (toolMap.get(tool) ?? 0) + 1);
    if (row.province) provinceMap.set(row.province, (provinceMap.get(row.province) ?? 0) + 1);
    const role = cleanString(row.occupation) || deriveRoleFromPurpose(row.usage_purpose ?? []);
    if (role) {
      const stat = roleMap.get(role) ?? { count: 0, toolCounts: new Map<string, number>() };
      stat.count += 1;
      for (const tool of tools) stat.toolCounts.set(tool, (stat.toolCounts.get(tool) ?? 0) + 1);
      roleMap.set(role, stat);
    }
    if (row.city || row.province) {
      const city = cleanString(row.city, cleanString(row.province, "未知城市"));
      const province = cleanString(row.province, "未知地区");
      const key = `${province}-${city}`;
      const stat = cityMap.get(key) ?? { city, province, count: 0, toolCounts: new Map<string, number>(), roleCounts: new Map<string, number>() };
      stat.count += 1;
      for (const tool of tools) stat.toolCounts.set(tool, (stat.toolCounts.get(tool) ?? 0) + 1);
      if (role) stat.roleCounts.set(role, (stat.roleCounts.get(role) ?? 0) + 1);
      cityMap.set(key, stat);
    }
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
  const cities: CityEntry[] = [...cityMap.values()]
    .map((entry) => ({
      city: entry.city,
      province: entry.province,
      count: entry.count,
      topTool: topMapKey(entry.toolCounts) || "未记录",
      topRole: topMapKey(entry.roleCounts) || "AI 探索者",
    }))
    .sort((a, b) => b.count - a.count);
  const roles: RoleEntry[] = [...roleMap.entries()]
    .map(([role, entry]) => ({ role, count: entry.count, topTool: topMapKey(entry.toolCounts) || "未记录" }))
    .sort((a, b) => b.count - a.count);
  const timeline = buildTimeline(filtered);
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
    cities,
    roles,
    levels,
    timeline,
    overview: { total, agentUsers, appUsers, todayNew },
    filters: { userType, tool: selectedTool },
  };
}

function buildTimeline(rows: UserRow[]): TimelineEntry[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    const key = day.toISOString().split("T")[0];
    const signals = rows.filter((row) => row.created_at?.startsWith(key)).length;
    const active = rows.filter((row) => row.created_at && row.created_at.slice(0, 10) <= key).length;
    return {
      day: day.toLocaleDateString("zh-CN", { weekday: "short" }).replace("星期", "周"),
      signals,
      active,
    };
  });
}

function topMapKey(map: Map<string, number>): string {
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

function deriveRoleFromPurpose(purpose: string[]): string {
  const set = new Set(purpose);
  if (set.has("code") || set.has("web-dev")) return "代码指挥官";
  if (set.has("automation") || set.has("nas-docker")) return "自动化玩家";
  if (set.has("knowledge-base")) return "知识库构建者";
  if (set.has("local-llm")) return "本地模型驯养师";
  if (set.has("data-analysis") || set.has("invest")) return "数据分析师";
  if (set.has("article") || set.has("learning")) return "内容生产者";
  return "AI 探索者";
}

export async function fetchLatestCards(limit = 12): Promise<LatestCard[]> {
  try {
    const res = await fetch(`/api/latest-cards?limit=${limit}`, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const body = (await res.json()) as { cards?: LatestCard[] };
      if (Array.isArray(body.cards)) return body.cards.slice(0, limit);
    }
  } catch {
    // Cloudflare Functions are unavailable in local static previews.
  }

  const select = "nickname,province,city,occupation,usage_purpose,primary_tool,tools,ai_level,ai_level_name,avatar_seed,card_slug,created_at,status";
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
      city: cleanString(r.city as string),
      role: cleanString(r.occupation as string) || deriveRoleFromPurpose((r.usage_purpose as string[] | null) ?? []),
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

export type GenerateCardImagePayload = {
  nickname: string;
  province: string;
  city?: string;
  tools: string[];
  signature?: string;
};

export type GenerateCardImageResult = {
  imageUrl: string;
  shareText: string;
};

export type AgentCardRecord = {
  cardId: string;
  visitorId: string;
  nickname: string;
  province: string;
  city?: string;
  tools: string[];
  scenarios?: string[];
  signature?: string;
  imageUrl: string;
  imagePath?: string;
  modelImageUrl?: string;
  shareTitle: string;
  shareDescription: string;
  shareImageUrl: string;
  shareUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAgentCardPayload = {
  visitorId: string;
  nickname: string;
  province: string;
  city?: string;
  tools: string[];
  scenarios?: string[];
  signature?: string;
};

type AgentCardResponse = { success?: boolean; card?: AgentCardRecord | null; cards?: AgentCardRecord[]; error?: string; reused?: boolean };

export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  const stored = window.localStorage.getItem(STORAGE_KEYS.visitorId);
  if (stored) return stored;
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `visitor-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem(STORAGE_KEYS.visitorId, id);
  return id;
}

export function cacheAgentCard(card: AgentCardRecord) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.cardId, card.cardId);
  window.localStorage.setItem(STORAGE_KEYS.cardCache, JSON.stringify(card));
  window.localStorage.setItem("ai-agent-passport-current", JSON.stringify({
    id: card.cardId,
    nickname: card.nickname,
    province: card.province,
    city: card.city,
    tools: card.tools,
    scenarios: card.scenarios,
    signature: card.signature,
    generatedCardImageUrl: card.imageUrl,
    generatedCardShareText: card.shareDescription,
    created_at: card.createdAt,
  }));
}

export function readCachedAgentCard(): AgentCardRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.cardCache);
    return raw ? (JSON.parse(raw) as AgentCardRecord) : null;
  } catch {
    return null;
  }
}

async function parseAgentCardResponse(res: Response): Promise<AgentCardResponse> {
  const body = (await res.json()) as AgentCardResponse;
  if (!res.ok || body.success === false) throw new Error(body.error || "身份卡请求失败");
  return body;
}

export async function createCardAndGenerateImage(payload: CreateAgentCardPayload): Promise<AgentCardRecord> {
  const res = await fetch("/api/cards/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await parseAgentCardResponse(res);
  if (!body.card) throw new Error("身份卡创建失败");
  cacheAgentCard(body.card);
  return body.card;
}

export async function getCardById(cardId: string): Promise<AgentCardRecord | null> {
  const res = await fetch(`/api/cards/${encodeURIComponent(cardId)}`, { headers: { Accept: "application/json" } });
  if (res.status === 404) return null;
  const body = await parseAgentCardResponse(res);
  if (body.card) cacheAgentCard(body.card);
  return body.card ?? null;
}

export async function getCardByVisitorId(visitorId: string): Promise<AgentCardRecord | null> {
  const res = await fetch(`/api/cards/by-visitor/${encodeURIComponent(visitorId)}`, { headers: { Accept: "application/json" } });
  const body = await parseAgentCardResponse(res);
  if (body.card) cacheAgentCard(body.card);
  return body.card ?? null;
}

export async function searchCardsByNickname(nickname: string): Promise<AgentCardRecord[]> {
  const res = await fetch(`/api/cards/search?nickname=${encodeURIComponent(nickname)}`, { headers: { Accept: "application/json" } });
  const body = await parseAgentCardResponse(res);
  return body.cards ?? [];
}

export async function regenerateCardImage(cardId: string, visitorId: string): Promise<AgentCardRecord> {
  const res = await fetch(`/api/cards/${encodeURIComponent(cardId)}/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visitorId }),
  });
  const body = await parseAgentCardResponse(res);
  if (!body.card) throw new Error("重新生成失败");
  cacheAgentCard(body.card);
  return body.card;
}

export async function generateAiIdentityCard(payload: GenerateCardImagePayload): Promise<GenerateCardImageResult | null> {
  try {
    const res = await fetch("/api/generate-card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; imageUrl?: string; shareText?: string };
    if (!body.success || !body.imageUrl) return null;
    return {
      imageUrl: body.imageUrl,
      shareText: body.shareText || "",
    };
  } catch {
    return null;
  }
}
