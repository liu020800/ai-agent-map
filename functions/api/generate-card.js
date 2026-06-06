export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const input = normalizeInput(body);
    const validationError = validateInput(input);
    if (validationError) return jsonResponse({ success: false, error: validationError }, 400);

    const apiKey = context.env.SENSENOVA_API_KEY;
    if (!apiKey) return jsonResponse({ success: false, error: "SENSENOVA_API_KEY not configured" }, 500);

    const prompt = buildIdentityCardPrompt(input);
    const imageUrl = await generateWithSenseNova(apiKey, prompt);
    const shareText = buildShareText(input);

    return jsonResponse({ success: true, imageUrl, shareText, promptUsed: prompt }, 200);
  } catch (error) {
    return jsonResponse({ success: false, error: "身份卡生成失败，请稍后重试" }, 500);
  }
}

function normalizeInput(body) {
  return {
    nickname: cleanText(body?.nickname, 20) || "匿名 Agent",
    province: cleanText(body?.province, 20) || "浙江",
    city: cleanText(body?.city, 20),
    tools: Array.isArray(body?.tools)
      ? body.tools.map((tool) => cleanText(tool, 24)).filter(Boolean).slice(0, 8)
      : [],
    signature: cleanText(body?.signature, 30) || "用 AI 扩展自己的能力边界",
  };
}

function validateInput(input) {
  if (!input.nickname || input.nickname.length > 20) return "昵称不能为空，且不能超过 20 字";
  if (!input.province) return "请选择省份";
  if (!input.tools.length) return "请至少选择一个 AI 工具";
  if (input.signature.length > 30) return "签名不能超过 30 字";
  return "";
}

function cleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[<>{}[\]\\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function buildIdentityCardPrompt(input) {
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

async function generateWithSenseNova(apiKey, prompt) {
  const endpoint = "https://token.sensenova.cn/v1/images/generations";
  const baseHeaders = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const firstPayload = {
    model: "sensenova-u1-fast",
    prompt,
    size: "1824x2272",
    n: 1,
  };

  let response = await fetch(endpoint, {
    method: "POST",
    headers: baseHeaders,
    body: JSON.stringify(firstPayload),
  });

  if (!response.ok) {
    const fallbackPayload = {
      model: "sensenova-u1-fast",
      prompt,
      image_size: "2k",
      aspect_ratio: "4:5",
      seed: Math.floor(Math.random() * 999999),
    };
    response = await fetch(endpoint, {
      method: "POST",
      headers: baseHeaders,
      body: JSON.stringify(fallbackPayload),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "SenseNova generation failed");
  }

  const data = await response.json();
  const imageUrl = data?.data?.[0]?.url || data?.data?.[0]?.b64_json || data?.url;
  if (!imageUrl) throw new Error("No image URL returned");
  return imageUrl;
}

function buildShareText(input) {
  const region = input.city ? `${input.province}${input.city}` : input.province;
  return `我已生成我的全国 AI 信号身份卡，正在使用 ${input.tools.join(" / ")}，据点 ${region}。你也来生成一张：liusq.icu`;
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
