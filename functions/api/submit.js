export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    if (!body?.province || !Array.isArray(body.tools) || body.tools.length === 0) {
      return jsonResponse({ error: 'province and at least one tool are required' }, 400);
    }

    const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return jsonResponse({ error: 'server env not configured' }, 500);
    }

    const ip = context.request.headers.get('cf-connecting-ip') || context.request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = context.request.headers.get('user-agent') || '';

    const normalizedUserType = body.user_type === 'agent' ? 'agent' : 'app';
    const aiLevel = computeLevel(normalizedUserType, body.tools);

    const insertResult = await tryInsert(supabaseUrl, serviceKey, {
      province: body.province,
      city: body.city || null,
      user_type: normalizedUserType,
      tools: body.tools,
      ai_level: aiLevel,
      ip,
      user_agent: userAgent,
    });

    if (!insertResult.ok && isMissingColumnError(insertResult.errorText, 'ip')) {
      const fallback = await tryInsert(supabaseUrl, serviceKey, {
        province: body.province,
        city: body.city || null,
        user_type: normalizedUserType,
        tools: body.tools,
        ai_level: aiLevel,
      });
      if (!fallback.ok) return jsonResponse({ error: fallback.errorText }, 500);
      const row = fallback.row;
      return jsonResponse({ id: row.id, ai_level: row.ai_level ?? aiLevel }, 201);
    }

    if (!insertResult.ok) return jsonResponse({ error: insertResult.errorText }, 500);

    const row = insertResult.row;
    return jsonResponse({ id: row.id, ai_level: row.ai_level ?? aiLevel }, 201);
  } catch (e) {
    return jsonResponse({ error: 'Unexpected server error' }, 500);
  }
}

function computeLevel(userType, tools) {
  const agentTools = new Set(['OpenClaw','Hermes','Codex','Claude Code','OpenCode','Cursor','Dify','n8n Agent']);
  const appTools = new Set(['豆包','DeepSeek','Kimi','ChatGPT','Gemini','通义','元宝']);
  const unique = new Set(tools);
  const agentCount = [...unique].filter((t) => agentTools.has(t)).length;
  const appCount = [...unique].filter((t) => appTools.has(t)).length;
  if (userType === 'agent' && agentCount >= 3) return 5;
  if (userType === 'agent' && agentCount >= 1) return 4;
  if (appCount >= 3) return 3;
  if (appCount >= 1) return 2;
  return 1;
}

async function tryInsert(supabaseUrl, serviceKey, payload) {
  const res = await fetch(`${supabaseUrl}/rest/v1/users`, {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    return { ok: false, errorText: text, row: null };
  }
  const inserted = await res.json();
  const row = Array.isArray(inserted) ? inserted[0] : inserted;
  return { ok: true, errorText: null, row };
}

function isMissingColumnError(text, column) {
  try {
    const obj = JSON.parse(text);
    return obj?.code === 'PGRST204' && (obj?.message || '').includes(column);
  } catch (e) {
    return false;
  }
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
