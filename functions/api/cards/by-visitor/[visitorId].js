import { fetchRows, getSupabaseEnv, hashText, jsonResponse, toCardRecord } from "../_shared.js";

export async function onRequestGet(context) {
  const env = getSupabaseEnv(context);
  if (!env) return jsonResponse({ success: false, error: "server env not configured" }, 500);
  const visitorId = context.params.visitorId;
  const origin = new URL(context.request.url).origin;
  const visitorHash = hashText(visitorId || "");
  const result = await fetchRows(
    env,
    `select=*&visitor_hash=eq.${encodeURIComponent(visitorHash)}&status=eq.valid&order=created_at.desc&limit=1`,
  );
  if (!result.ok) return jsonResponse({ success: false, error: result.error }, 500);
  if (!result.rows.length) return jsonResponse({ success: true, card: null }, 200);
  return jsonResponse({ success: true, card: toCardRecord(result.rows[0], origin) }, 200);
}
