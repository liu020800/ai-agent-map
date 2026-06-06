import {
  buildIdentityCardPrompt,
  cleanText,
  fetchRows,
  generateCardId,
  generateWithSenseNova,
  getSupabaseEnv,
  hashText,
  insertRow,
  isFallbackImageUrl,
  jsonResponse,
  normalizeInput,
  toCardRecord,
  updateRow,
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
      const existingRow = existing.rows[0];
      if (!isFallbackImageUrl(existingRow.avatar_seed)) {
        return jsonResponse({ success: true, card: toCardRecord(existingRow, origin), reused: true }, 200);
      }

      const apiKey = context.env.SENSENOVA_API_KEY;
      if (!apiKey) return jsonResponse({ success: false, error: "SENSENOVA_API_KEY not configured" }, 500);

      try {
        const replacementUrl = await generateWithSenseNova(apiKey, buildIdentityCardPrompt(input, existingRow.card_slug));
        const updated = await updateRow(env, existingRow.card_slug, {
          avatar_seed: replacementUrl,
          updated_at: new Date().toISOString(),
        });
        if (!updated.ok) return jsonResponse({ success: false, error: updated.error }, 500);
        return jsonResponse({ success: true, card: toCardRecord(updated.row, origin), reused: false, regeneratedFallback: true }, 200);
      } catch {
        return jsonResponse({ success: false, error: "AI 身份卡图片生成失败，请稍后重试" }, 502);
      }
    }

    const apiKey = context.env.SENSENOVA_API_KEY;
    if (!apiKey) return jsonResponse({ success: false, error: "SENSENOVA_API_KEY not configured" }, 500);

    const cardId = generateCardId();
    const prompt = buildIdentityCardPrompt(input, cardId);
    let imageUrl = "";
    try {
      imageUrl = await generateWithSenseNova(apiKey, prompt);
    } catch {
      return jsonResponse({ success: false, error: "AI 身份卡图片生成失败，请稍后重试" }, 502);
    }
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
