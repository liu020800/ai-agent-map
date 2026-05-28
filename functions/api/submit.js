export async function onRequestPost(context) {
  try {
    const body = await context.request.json();

    // Honeypot check
    if (body.honeypot) return jsonResponse({ error: "提交失败" }, 400);
    // Timing check
    if (body.submit_duration_ms && body.submit_duration_ms < 3000) return jsonResponse({ error: "提交过快，请稍后重试" }, 400);
    if (!body?.province || !Array.isArray(body.tools) || body.tools.length === 0) {
      return jsonResponse({ error: "province and at least one tool are required" }, 400);
    }

    const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return jsonResponse({ error: "server env not configured" }, 500);

    const ip = context.request.headers.get("cf-connecting-ip") || context.request.headers.get("x-forwarded-for") || "unknown";
    const normalizedUserType = body.user_type === "agent" ? "agent" : "app";
    const aiLevel = computeLevel(normalizedUserType, body.tools);
    const aiLevelName = levelName(aiLevel);
    const avatarSeed = generateSeed();
    const cardSlug = generateSlug();
    const ipHash = simpleHash(ip);

    // Rate limit with fallback
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    try {
      const throttleRes = await fetch(`${supabaseUrl}/rest/v1/users?select=id&created_at=gte.${oneHourAgo}&ip_hash=eq.${ipHash}`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/json" },
      });
      if (throttleRes.ok) {
        const recent = await throttleRes.json();
        if (Array.isArray(recent) && recent.length >= 5) return jsonResponse({ error: "提交过于频繁，请稍后再试" }, 429);
      }
    } catch {}

    // Try full payload first
    const fullPayload = {
      province: body.province,
      city: body.city || null,
      user_type: normalizedUserType,
      tools: body.tools,
      ai_level: aiLevel,
      nickname: body.nickname || null,
      occupation: body.occupation || null,
      primary_tool: body.primary_tool || body.tools[0] || null,
      usage_frequency: body.usage_frequency || null,
      usage_purpose: body.usage_purpose || null,
      ai_level_name: aiLevelName,
      avatar_seed: avatarSeed,
      card_slug: cardSlug,
      ip_hash: ipHash,
      visitor_hash: simpleHash(ip + (context.request.headers.get("user-agent") || "")),
      status: "valid",
    };

    let result = await tryInsert(supabaseUrl, serviceKey, fullPayload);

    // Fallback: minimal payload for existing schema
    if (!result.ok && isSchemaError(result.errorText)) {
      const minimalPayload = { province: body.province, city: body.city || null, user_type: normalizedUserType, tools: body.tools, ai_level: aiLevel };
      result = await tryInsert(supabaseUrl, serviceKey, minimalPayload);
    }

    if (!result.ok) return jsonResponse({ error: result.errorText }, 500);

    const row = result.row;
    return jsonResponse({
      id: row.id,
      ai_level: row.ai_level ?? aiLevel,
      ai_level_name: row.ai_level_name ?? aiLevelName,
      card_slug: row.card_slug ?? cardSlug,
      avatar_seed: row.avatar_seed ?? avatarSeed,
    }, 201);
  } catch (e) {
    return jsonResponse({ error: "Unexpected server error" }, 500);
  }
}

function computeLevel(userType, tools) {
  const agentTools = new Set(["OpenClaw","Hermes","Codex","Claude Code","OpenCode","Cursor","Dify","n8n","Trae","CodeBuddy"]);
  const appTools = new Set(["豆包","DeepSeek","Kimi","ChatGPT","Claude","Gemini","通义千问","腾讯元宝"]);
  const unique = new Set(tools);
  const ac = [...unique].filter((t) => agentTools.has(t)).length;
  const ap = [...unique].filter((t) => appTools.has(t)).length;
  if (userType === "agent" && ac >= 3) return 5;
  if (userType === "agent" && ac >= 1) return 4;
  if (ap >= 3) return 3;
  if (ap >= 1) return 2;
  return 1;
}

function levelName(l) {
  return { 5: "L5 本地 AI 系统玩家", 4: "L4 Agent 工作流用户", 3: "L3 AI 工具组合用户", 2: "L2 Prompt 用户" }[l] || "L1 AI 聊天用户";
}

function simpleHash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; } return Math.abs(h).toString(16).padStart(8, "0"); }
function generateSeed() { return Math.random().toString(36).substring(2, 10) + Date.now().toString(36); }
function generateSlug() { const c = "abcdefghijklmnopqrstuvwxyz0123456789"; let s = ""; for (let i = 0; i < 8; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }

async function tryInsert(url, key, payload) {
  const res = await fetch(`${url}/rest/v1/users`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, errorText: await res.text(), row: null };
  const d = await res.json();
  return { ok: true, errorText: null, row: Array.isArray(d) ? d[0] : d };
}

function isSchemaError(t) { try { return JSON.parse(t)?.code === "PGRST204"; } catch { return false; } }
function jsonResponse(d, s) { return new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } }); }
