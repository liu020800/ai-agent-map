export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

export function cleanText(value, maxLength = 80) {
  if (typeof value !== "string") return "";
  return value.replace(/[<>{}[\]\\]/g, "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function hashText(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export function getSupabaseEnv(context) {
  const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return {
    supabaseUrl,
    serviceKey,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
}

export function generateCardId() {
  const n = Math.floor(Math.random() * 900000 + 100000);
  return `AGT-CN-${n}`;
}

export function normalizeInput(body) {
  const tools = Array.isArray(body?.tools) ? body.tools.map((tool) => cleanText(tool, 24)).filter(Boolean).slice(0, 8) : [];
  const scenarios = Array.isArray(body?.scenarios) ? body.scenarios.map((item) => cleanText(item, 32)).filter(Boolean).slice(0, 8) : [];
  return {
    visitorId: cleanText(body?.visitorId, 120),
    nickname: cleanText(body?.nickname, 20) || "匿名 Agent",
    province: cleanText(body?.province, 20),
    city: cleanText(body?.city, 20),
    tools,
    scenarios,
    signature: cleanText(body?.signature, 30) || "用 AI 扩展自己的能力边界",
  };
}

export function validateCreateInput(input) {
  if (!input.visitorId) return "visitorId is required";
  if (!input.nickname) return "昵称不能为空";
  if (!input.province) return "请选择省份";
  if (!input.tools.length) return "请至少选择一个 AI 工具";
  return "";
}

export function shareTextFor(card) {
  const region = `${card.province || ""}${card.city || ""}`;
  return `我已点亮 AI Agent Map，生成了我的全国 AI 信号身份卡。\n\n昵称：${card.nickname}\nID：${card.cardId}\n节点：${region}\n工具：${(card.tools || []).join(" / ")}\n\n你也来生成一张：\n${card.shareUrl}`;
}

export function toCardRecord(row, origin = "https://liusq.icu") {
  if (!row) return null;
  const cardId = row.card_slug || row.id || "";
  const tools = Array.isArray(row.tools) ? row.tools : row.primary_tool ? [row.primary_tool] : [];
  const nickname = row.nickname || "匿名 Agent";
  const province = row.province || "";
  const city = row.city || "";
  const imageUrl = row.avatar_seed || "";
  const shareUrl = `${origin}/card/${encodeURIComponent(cardId)}`;
  const shareTitle = `${nickname} 的 AI Agent 身份卡`;
  const shareDescription = `我已点亮 AI Agent Map，正在使用 ${tools.join(" / ") || "AI 工具"}。`;
  return {
    cardId,
    visitorId: row.visitor_hash || "",
    nickname,
    province,
    city,
    tools,
    scenarios: Array.isArray(row.usage_purpose) ? row.usage_purpose : [],
    signature: row.usage_frequency || "用 AI 扩展自己的能力边界",
    imageUrl,
    imagePath: "",
    modelImageUrl: imageUrl,
    shareTitle,
    shareDescription,
    shareImageUrl: imageUrl,
    shareUrl,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

export async function fetchRows(env, query) {
  const res = await fetch(`${env.supabaseUrl}/rest/v1/users?${query}`, { headers: env.headers });
  if (!res.ok) return { ok: false, error: await res.text(), rows: [] };
  return { ok: true, error: "", rows: await res.json() };
}

export async function insertRow(env, payload) {
  const res = await fetch(`${env.supabaseUrl}/rest/v1/users`, {
    method: "POST",
    headers: { ...env.headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, error: await res.text(), row: null };
  const data = await res.json();
  return { ok: true, error: "", row: Array.isArray(data) ? data[0] : data };
}

export async function updateRow(env, cardId, payload) {
  const res = await fetch(`${env.supabaseUrl}/rest/v1/users?card_slug=eq.${encodeURIComponent(cardId)}`, {
    method: "PATCH",
    headers: { ...env.headers, Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) return { ok: false, error: await res.text(), row: null };
  const data = await res.json();
  return { ok: true, error: "", row: Array.isArray(data) ? data[0] : data };
}

export function buildIdentityCardPrompt(input, cardId) {
  const region = input.city ? `${input.province}${input.city}` : input.province;
  const tools = input.tools.join(" / ");
  return `
生成一张竖版 4:5 的中文 AI Agent 身份卡，尺寸适配 1824x2272。

这是一张完整的社交分享身份卡，不是头像图，不要生成真人头像，不要生成卡通人物中心位。

主题：
AI Agent Map
全国 AI 信号身份卡

用户信息：
昵称：${input.nickname}
ID：${cardId}
地区：${region}
正在使用的 AI 工具：${tools}
签名：${input.signature}

请把以上用户信息自然排版到卡片中。

视觉风格：
轻赛博、现代信息图、数字通行证、中国地图信号卡、科技数据面板。

画面元素：
中国地图轮廓或抽象地图信号纹理、城市信号点、数据流线、科技边框、发光坐标、工具标签、身份编号感装饰。

卡片文字必须包含：
AI Agent Map
全国 AI 信号身份卡
昵称：${input.nickname}
ID：${cardId}
地区：${region}
工具：${tools}
签名：${input.signature}
我已点亮 AI Agent Map
liusq.icu

设计要求：
画面高级、干净、明亮、有科技感，适合朋友圈、微博、小红书分享。
不要大面积纯黑，不要黑白单调，不要真实人脸，不要大头像，不要二维码，不要复杂小字，不要乱码，不要低幼卡通风。

请生成一张完整、好看、可下载、可分享的 AI Agent 身份卡。
  `.trim();
}

export async function generateWithSenseNova(apiKey, prompt) {
  const endpoint = "https://token.sensenova.cn/v1/images/generations";
  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  let response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: "sensenova-u1-fast", prompt, size: "1824x2272", n: 1 }),
  });
  if (!response.ok) {
    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: "sensenova-u1-fast",
        prompt,
        image_size: "2k",
        aspect_ratio: "4:5",
        seed: Math.floor(Math.random() * 999999),
      }),
    });
  }
  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  const imageUrl = data?.data?.[0]?.url || data?.data?.[0]?.b64_json || data?.url;
  if (!imageUrl) throw new Error("No image URL returned");
  return imageUrl;
}
