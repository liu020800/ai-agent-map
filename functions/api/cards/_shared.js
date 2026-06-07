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
  const storedImageUrl = row.avatar_seed || "";
  const imageUrl = cardId ? `${origin}/api/cards/${encodeURIComponent(cardId)}/image` : storedImageUrl;
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

export function isFallbackImageUrl(imageUrl) {
  return typeof imageUrl === "string" && imageUrl.includes("/api/cards/") && imageUrl.endsWith("/image.svg");
}

export function isPersistentImageUrl(imageUrl) {
  return typeof imageUrl === "string" && imageUrl.includes("/api/cards/") && imageUrl.endsWith("/image");
}

export function getImageStore(context) {
  const bucket = context.env.AGENT_CARD_IMAGES;
  if (!bucket || typeof bucket.put !== "function" || typeof bucket.get !== "function") return null;
  return bucket;
}

export function persistentCardImageUrl(origin, cardId) {
  return `/api/cards/${encodeURIComponent(cardId)}/image`;
}

export function cardImageObjectKey(cardId) {
  return `cards/${encodeURIComponent(cardId)}.png`;
}

export async function persistGeneratedImage(context, imageValue, cardId, origin) {
  const bucket = getImageStore(context);
  if (!bucket) throw new Error("AGENT_CARD_IMAGES R2 binding not configured");

  const { bytes, contentType } = await generatedImageToBytes(imageValue);
  await bucket.put(cardImageObjectKey(cardId), bytes, {
    httpMetadata: {
      contentType,
      cacheControl: "public, max-age=31536000, immutable",
    },
    customMetadata: {
      cardId,
      source: "sensenova-u1-fast",
      createdAt: new Date().toISOString(),
    },
  });
  return persistentCardImageUrl(origin, cardId);
}

export async function generatedImageToBytes(imageValue) {
  if (typeof imageValue !== "string" || !imageValue.trim()) {
    throw new Error("Empty generated image");
  }

  if (/^https?:\/\//i.test(imageValue)) {
    const res = await fetch(imageValue);
    if (!res.ok) throw new Error(`Generated image download failed: ${res.status}`);
    const contentType = res.headers.get("content-type") || "image/png";
    return { bytes: await res.arrayBuffer(), contentType };
  }

  const dataUrlMatch = imageValue.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
  if (dataUrlMatch) {
    const contentType = dataUrlMatch[1] || "image/png";
    const body = dataUrlMatch[3] || "";
    if (dataUrlMatch[2]) return { bytes: base64ToArrayBuffer(body), contentType };
    return { bytes: new TextEncoder().encode(decodeURIComponent(body)).buffer, contentType };
  }

  return { bytes: base64ToArrayBuffer(imageValue), contentType: "image/png" };
}

function base64ToArrayBuffer(value) {
  const normalized = value.replace(/\s+/g, "");
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
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
  const tools = input.tools.slice(0, 4).join(" / ");
  const signature = input.signature || "探索 AI，连接未来";
  return `生成一张竖版4:5的高质量AI Agent身份卡，尺寸适配1824x2272。整体底色必须是深黑、深蓝黑或暗紫渐变，配合霓虹青蓝紫光效、扫描线、玻璃拟态科技面板，符合深色赛博网站主题，禁止纯白背景、浅灰背景、淡色证件照背景。画面核心必须是年轻、干练、有吸引力的未来科技角色头像或半身像，二次元插画风、赛博霓虹、科技护目镜、发光外套、HUD数据界面、芯片纹路，整体像高质量游戏角色身份卡。下方或侧边加入深色科技UI信息面板，信息简洁清晰但不要压过角色主视觉。必须包含文字：AI Agent Map，AI身份卡，昵称：${input.nickname}，ID：${cardId}，地区：${region}，工具：${tools}，签名：${signature}，liusq.icu。不要做成普通白底证件卡，不要纯文本表格，不要淡背景边框卡，不要办公海报，不要真实照片风，不要低幼卡通。`;
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
