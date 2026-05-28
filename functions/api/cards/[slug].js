export async function onRequestGet(context) {
  try {
    const slug = context.params.slug;
    const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return jsonResponse({ error: "server env not configured" }, 500);

    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/json" };

    // Try with card_slug filter
    let res = await fetch(`${supabaseUrl}/rest/v1/users?select=nickname,province,tools,primary_tool,ai_level,ai_level_name,avatar_seed,card_slug,created_at&card_slug=eq.${slug}&limit=1`, { headers });
    if (!res.ok) return jsonResponse({ error: await res.text() }, 500);

    let rows = await res.json();
    if (rows.length === 0) return jsonResponse({ error: "卡片不存在" }, 404);

    const card = rows[0];

    // Get user number (count of valid records created before this one)
    let userNumber = 1;
    try {
      const countRes = await fetch(`${supabaseUrl}/rest/v1/users?select=id&created_at=lt.${card.created_at}&status=eq.valid`, { headers, method: "GET" });
      if (countRes.ok) {
        const earlier = await countRes.json();
        userNumber = (earlier?.length ?? 0) + 1;
      }
    } catch {}

    return jsonResponse({
      nickname: card.nickname || "AI 用户",
      ai_level: card.ai_level,
      ai_level_name: card.ai_level_name || `L${card.ai_level}`,
      primary_tool: card.primary_tool || (card.tools?.[0] ?? ""),
      tools: card.tools ?? [],
      avatar_seed: card.avatar_seed || slug,
      province: card.province,
      created_at: card.created_at,
      user_number: userNumber,
    });
  } catch (e) {
    return jsonResponse({ error: "Unexpected server error" }, 500);
  }
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json" } });
}
