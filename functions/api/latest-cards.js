export async function onRequestGet(context) {
  try {
    const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return jsonResponse({ error: "server env not configured" }, 500);

    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/json" };
    const select = "nickname,province,city,occupation,usage_purpose,primary_tool,tools,ai_level,ai_level_name,avatar_seed,card_slug,created_at";

    let res = await fetch(`${supabaseUrl}/rest/v1/users?select=${select}&status=eq.valid&order=created_at.desc&limit=12`, { headers });
    if (!res.ok) {
      res = await fetch(`${supabaseUrl}/rest/v1/users?select=${select}&order=created_at.desc&limit=12`, { headers });
    }
    if (!res.ok) return jsonResponse({ error: await res.text() }, 500);

    const rows = await res.json();
    const cards = Array.isArray(rows)
      ? rows.map((row, index) => ({
          nickname: row.nickname || `Agent_${String(index + 1).padStart(2, "0")}`,
          province: row.province || "未知地区",
          city: row.city || "",
          role: row.occupation || deriveRoleFromPurpose(row.usage_purpose || []),
          primary_tool: row.primary_tool || row.tools?.[0] || "Codex",
          tools: Array.isArray(row.tools) ? row.tools : [],
          ai_level: row.ai_level || 1,
          ai_level_name: row.ai_level_name || `L${row.ai_level || 1}`,
          avatar_seed: row.avatar_seed || row.card_slug || `${Date.now()}-${index}`,
          card_slug: row.card_slug || "",
          created_at: row.created_at || null,
        }))
      : [];

    return jsonResponse({ cards }, 200, { "Cache-Control": "s-maxage=20, stale-while-revalidate=40" });
  } catch {
    return jsonResponse({ error: "Unexpected server error" }, 500);
  }
}

function deriveRoleFromPurpose(purpose) {
  const set = new Set(Array.isArray(purpose) ? purpose : []);
  if (set.has("code") || set.has("web-dev")) return "代码指挥官";
  if (set.has("automation") || set.has("nas-docker")) return "自动化玩家";
  if (set.has("knowledge-base")) return "知识库构建者";
  if (set.has("local-llm")) return "本地模型驯养师";
  if (set.has("data-analysis") || set.has("invest")) return "数据分析师";
  if (set.has("article") || set.has("learning")) return "内容生产者";
  return "AI 探索者";
}

function jsonResponse(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}
