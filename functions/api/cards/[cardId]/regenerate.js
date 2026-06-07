import {
  buildIdentityCardPrompt,
  fetchRows,
  generateWithSenseNova,
  getSupabaseEnv,
  hashText,
  jsonResponse,
  normalizeInput,
  persistGeneratedImage,
  toCardRecord,
  updateRow,
} from "../_shared.js";

export async function onRequestPost(context) {
  try {
    const env = getSupabaseEnv(context);
    if (!env) return jsonResponse({ success: false, error: "server env not configured" }, 500);
    const cardId = context.params.cardId;
    const body = await context.request.json();
    const visitorId = body?.visitorId || "";
    if (!visitorId) return jsonResponse({ success: false, error: "visitorId is required" }, 400);
    const visitorHash = hashText(visitorId);
    const origin = new URL(context.request.url).origin;

    const result = await fetchRows(env, `select=*&card_slug=eq.${encodeURIComponent(cardId)}&status=eq.valid&limit=1`);
    if (!result.ok) return jsonResponse({ success: false, error: result.error }, 500);
    if (!result.rows.length) return jsonResponse({ success: false, error: "card not found" }, 404);
    const existing = result.rows[0];
    if (existing.visitor_hash !== visitorHash) return jsonResponse({ success: false, error: "visitor mismatch" }, 403);

    const todayPrefix = new Date().toISOString().slice(0, 10);
    if (typeof existing.updated_at === "string" && existing.updated_at.startsWith(todayPrefix)) {
      return jsonResponse({ success: false, error: "今天已重新生成过，请明天再试" }, 429);
    }

    const apiKey = context.env.SENSENOVA_API_KEY;
    if (!apiKey) return jsonResponse({ success: false, error: "SENSENOVA_API_KEY not configured" }, 500);
    const input = normalizeInput({
      visitorId,
      nickname: existing.nickname,
      province: existing.province,
      city: existing.city,
      tools: existing.tools,
      scenarios: existing.usage_purpose,
      signature: existing.usage_frequency,
    });
    const generatedImage = await generateWithSenseNova(apiKey, buildIdentityCardPrompt(input, cardId));
    const imageUrl = await persistGeneratedImage(context, generatedImage, cardId, origin);
    const updated = await updateRow(env, cardId, { avatar_seed: imageUrl, updated_at: new Date().toISOString() });
    if (!updated.ok) return jsonResponse({ success: false, error: updated.error }, 500);
    return jsonResponse({ success: true, card: toCardRecord(updated.row, origin) }, 200);
  } catch {
    return jsonResponse({ success: false, error: "重新生成失败，请稍后再试" }, 500);
  }
}
