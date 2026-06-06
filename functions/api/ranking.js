export async function onRequestGet(context) {
  try {
    const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return jsonResponse({ error: "server env not configured" }, 500);

    const requestUrl = new URL(context.request.url);
    const userFilter = requestUrl.searchParams.get("userType") || "all";
    const selectedTool = requestUrl.searchParams.get("tool") || "";

    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/json" };

    let rows = [];
    try {
      let res = await fetch(`${supabaseUrl}/rest/v1/users?select=tools,province,city,occupation,usage_purpose,ai_level,created_at,user_type&status=eq.valid&limit=50000`, { headers });
      if (res.ok) rows = await res.json();
      else {
        res = await fetch(`${supabaseUrl}/rest/v1/users?select=tools,province,city,occupation,usage_purpose,ai_level,created_at,user_type&limit=50000`, { headers });
        if (res.ok) rows = await res.json();
        else return jsonResponse({ error: await res.text() }, 500);
      }
    } catch {
      const res = await fetch(`${supabaseUrl}/rest/v1/users?select=tools,province,city,occupation,usage_purpose,ai_level,created_at,user_type&limit=50000`, { headers });
      if (res.ok) rows = await res.json();
      else return jsonResponse({ error: "failed to fetch" }, 500);
    }

    const normalizedRows = rows.filter((row) => {
      const matchesUserType = userFilter === "all" ? true : row.user_type === userFilter;
      const matchesTool = selectedTool ? Array.isArray(row.tools) && row.tools.includes(selectedTool) : true;
      return matchesUserType && matchesTool;
    });

    const toolMap = new Map();
    const provinceMap = new Map();
    const cityMap = new Map();
    const roleMap = new Map();
    const levelMap = new Map();
    const today = new Date().toISOString().split("T")[0];
    let todayNew = 0;

    for (const row of normalizedRows) {
      const tools = row.tools ?? [];
      for (const tool of tools) toolMap.set(tool, (toolMap.get(tool) ?? 0) + 1);
      if (row.province) provinceMap.set(row.province, (provinceMap.get(row.province) ?? 0) + 1);
      const role = row.occupation || deriveRoleFromPurpose(row.usage_purpose || []);
      if (role) {
        const stat = roleMap.get(role) || { count: 0, toolCounts: new Map() };
        stat.count += 1;
        for (const tool of tools) stat.toolCounts.set(tool, (stat.toolCounts.get(tool) || 0) + 1);
        roleMap.set(role, stat);
      }
      if (row.city || row.province) {
        const city = row.city || row.province || "未知城市";
        const province = row.province || "未知地区";
        const key = `${province}-${city}`;
        const stat = cityMap.get(key) || { city, province, count: 0, toolCounts: new Map(), roleCounts: new Map() };
        stat.count += 1;
        for (const tool of tools) stat.toolCounts.set(tool, (stat.toolCounts.get(tool) || 0) + 1);
        if (role) stat.roleCounts.set(role, (stat.roleCounts.get(role) || 0) + 1);
        cityMap.set(key, stat);
      }
      const level = row.ai_level ?? 1;
      levelMap.set(level, (levelMap.get(level) ?? 0) + 1);
      if (row.created_at && row.created_at.startsWith(today)) todayNew++;
    }

    const tools = Array.from(toolMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20);
    const provinces = Array.from(provinceMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const cities = Array.from(cityMap.values())
      .map((entry) => ({
        city: entry.city,
        province: entry.province,
        count: entry.count,
        topTool: topMapKey(entry.toolCounts) || "未记录",
        topRole: topMapKey(entry.roleCounts) || "AI 探索者",
      }))
      .sort((a, b) => b.count - a.count);
    const roles = Array.from(roleMap.entries())
      .map(([role, entry]) => ({ role, count: entry.count, topTool: topMapKey(entry.toolCounts) || "未记录" }))
      .sort((a, b) => b.count - a.count);
    const levels = Array.from({ length: 5 }, (_, i) => i + 1).map((level) => ({ level, count: levelMap.get(level) ?? 0 }));
    const timeline = buildTimeline(normalizedRows);
    const total = normalizedRows.length;
    const agentUsers = normalizedRows.filter((row) => row.user_type === "agent").length;
    const appUsers = normalizedRows.filter((row) => row.user_type === "app").length;

    return jsonResponse(
      {
        tools,
        provinces,
        cities,
        roles,
        levels,
        timeline,
        overview: { total, agentUsers, appUsers, todayNew },
        filters: { userType: userFilter, tool: selectedTool },
      },
      200,
      { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" },
    );
  } catch {
    return jsonResponse({ error: "Unexpected server error" }, 500);
  }
}

function buildTimeline(rows) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    const key = day.toISOString().split("T")[0];
    const signals = rows.filter((row) => typeof row.created_at === "string" && row.created_at.startsWith(key)).length;
    const active = rows.filter((row) => typeof row.created_at === "string" && row.created_at.slice(0, 10) <= key).length;
    return {
      day: day.toLocaleDateString("zh-CN", { weekday: "short" }).replace("星期", "周"),
      signals,
      active,
    };
  });
}

function topMapKey(map) {
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
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

function jsonResponse(d, s, h = {}) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...h } });
}
