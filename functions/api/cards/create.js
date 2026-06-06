import {
  buildIdentityCardPrompt,
  cleanText,
  fetchRows,
  generateCardId,
  generateWithSenseNova,
  getSupabaseEnv,
  hashText,
  insertRow,
  jsonResponse,
  normalizeInput,
  toCardRecord,
  validateCreateInput,
} from "./_shared.js";

export async function onRequestPost(context) {
  try {
    const env = getSupabaseEnv(context);
    if (!env) return jsonResponse({ success: false, error: "server env not configured" }, 500);
    const input = normalizeInput(await context.request.json());
    const validationError = validateCreateInput(input);
    if (validationError) return jsonResponse({ success: false, error: validationError }, 400);

    const origin = new URL(context.request.url).origin;
    const visitorHash = hashText(input.visitorId);
    const existing = await fetchRows(
      env,
      `select=*&visitor_hash=eq.${encodeURIComponent(visitorHash)}&status=eq.valid&order=created_at.desc&limit=1`,
    );
    if (existing.ok && existing.rows.length > 0) {
      return jsonResponse({ success: true, card: toCardRecord(existing.rows[0], origin), reused: true }, 200);
    }

    const apiKey = context.env.SENSENOVA_API_KEY;
    if (!apiKey) return jsonResponse({ success: false, error: "SENSENOVA_API_KEY not configured" }, 500);

    const cardId = generateCardId();
    const prompt = buildIdentityCardPrompt(input, cardId);
    const imageUrl = await generateWithSenseNova(apiKey, prompt);
    const payload = {
      nickname: input.nickname,
      province: input.province,
      city: input.city || null,
      user_type: "agent",
      tools: input.tools,
      primary_tool: input.tools[0] || null,
      usage_purpose: input.scenarios,
      usage_frequency: input.signature,
      occupation: cleanText(input.scenarios[0], 40) || "AI 探索者",
      ai_level: Math.min(5, Math.max(1, input.tools.length)),
      ai_level_name: "AI Agent 身份卡",
      avatar_seed: imageUrl,
      card_slug: cardId,
      visitor_hash: visitorHash,
      status: "valid",
    };
    const inserted = await insertRow(env, payload);
    if (!inserted.ok) return jsonResponse({ success: false, error: inserted.error }, 500);

    return jsonResponse({ success: true, card: toCardRecord(inserted.row, origin), reused: false }, 201);
  } catch {
    return jsonResponse({ success: false, error: "身份卡创建失败，请稍后重试" }, 500);
  }
}
