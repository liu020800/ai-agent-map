import { fetchRows, getSupabaseEnv, jsonResponse, toCardRecord } from "./_shared.js";

export async function onRequestGet(context) {
  const env = getSupabaseEnv(context);
  if (!env) return jsonResponse({ success: false, error: "server env not configured" }, 500);
  const cardId = context.params.cardId;
  const origin = new URL(context.request.url).origin;
  const result = await fetchRows(env, `select=*&card_slug=eq.${encodeURIComponent(cardId)}&status=eq.valid&limit=1`);
  if (!result.ok) return jsonResponse({ success: false, error: result.error }, 500);
  if (!result.rows.length) return jsonResponse({ success: false, error: "card not found" }, 404);
  return jsonResponse({ success: true, card: toCardRecord(result.rows[0], origin) }, 200, {
    "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
  });
}
