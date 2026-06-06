import { cleanText, fetchRows, getSupabaseEnv, jsonResponse, toCardRecord } from "./_shared.js";

export async function onRequestGet(context) {
  const env = getSupabaseEnv(context);
  if (!env) return jsonResponse({ success: false, error: "server env not configured" }, 500);
  const url = new URL(context.request.url);
  const nickname = cleanText(url.searchParams.get("nickname"), 30);
  if (!nickname) return jsonResponse({ success: false, error: "nickname is required" }, 400);
  const result = await fetchRows(
    env,
    `select=*&nickname=ilike.*${encodeURIComponent(nickname)}*&status=eq.valid&order=created_at.desc&limit=20`,
  );
  if (!result.ok) return jsonResponse({ success: false, error: result.error }, 500);
  const origin = url.origin;
  return jsonResponse({ success: true, cards: result.rows.map((row) => toCardRecord(row, origin)) }, 200);
}
