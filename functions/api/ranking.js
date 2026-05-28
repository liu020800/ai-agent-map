export async function onRequestGet(context) {
  try {
    const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'server env not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const res = await fetch(`${supabaseUrl}/rest/v1/users?select=tools,province,ai_level&limit=50000`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: 'application/json' },
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: t }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const rows = await res.json();
    const toolMap = new Map();
    const provinceMap = new Map();
    const levelMap = new Map();

    for (const row of rows) {
      const tools = row.tools ?? [];
      for (const tool of tools) toolMap.set(tool, (toolMap.get(tool) ?? 0) + 1);
      if (row.province) provinceMap.set(row.province, (provinceMap.get(row.province) ?? 0) + 1);
      const level = row.ai_level ?? 1;
      levelMap.set(level, (levelMap.get(level) ?? 0) + 1);
    }

    const tools = Array.from(toolMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20);
    const provinces = Array.from(provinceMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 20);
    const levels = Array.from({ length: 5 }, (_, i) => i + 1).map((level) => ({ level, count: levelMap.get(level) ?? 0 }));

    return new Response(JSON.stringify({ tools, provinces, levels }), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=30, stale-while-revalidate=60' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Unexpected server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
