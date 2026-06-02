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
      let res = await fetch(`${supabaseUrl}/rest/v1/users?select=tools,province,ai_level,created_at,user_type&status=eq.valid&limit=50000`, { headers });
      if (res.ok) rows = await res.json();
      else {
        res = await fetch(`${supabaseUrl}/rest/v1/users?select=tools,province,ai_level,created_at,user_type&limit=50000`, { headers });
        if (res.ok) rows = await res.json();
        else return jsonResponse({ error: await res.text() }, 500);
      }
    } catch {
      const res = await fetch(`${supabaseUrl}/rest/v1/users?select=tools,province,ai_level,created_at,user_type&limit=50000`, { headers });
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
    const levelMap = new Map();
    const today = new Date().toISOString().split("T")[0];
    let todayNew = 0;

    for (const row of normalizedRows) {
      const tools = row.tools ?? [];
      for (const tool of tools) toolMap.set(tool, (toolMap.get(tool) ?? 0) + 1);
      if (row.province) provinceMap.set(row.province, (provinceMap.get(row.province) ?? 0) + 1);
      const level = row.ai_level ?? 1;
      levelMap.set(level, (levelMap.get(level) ?? 0) + 1);
      if (row.created_at && row.created_at.startsWith(today)) todayNew++;
    }

    const tools = Array.from(toolMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20);
    const provinces = Array.from(provinceMap.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const levels = Array.from({ length: 5 }, (_, i) => i + 1).map((level) => ({ level, count: levelMap.get(level) ?? 0 }));
    const total = normalizedRows.length;
    const agentUsers = normalizedRows.filter((row) => row.user_type === "agent").length;
    const appUsers = normalizedRows.filter((row) => row.user_type === "app").length;

    return jsonResponse(
      {
        tools,
        provinces,
        levels,
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

function jsonResponse(d, s, h = {}) {
  return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...h } });
}
