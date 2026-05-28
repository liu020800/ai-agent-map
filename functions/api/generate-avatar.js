export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const seed = body.seed || "default";
    const level = body.level || 1;
    const tools = body.tools || [];

    const apiKey = context.env.SENSENOVA_API_KEY;
    if (!apiKey) return jsonResponse({ error: "API key not configured" }, 500);

    // Build a creative prompt based on user's AI level and tools
    const levelStyles = {
      1: "casual office worker, simple clothes, friendly smile",
      2: "tech enthusiast, wearing headphones, focused expression",
      3: "creative professional, modern style, confident pose",
      4: "AI engineer, futuristic jacket, glowing accessories, determined look",
      5: "cyberpunk hacker, neon goggles, holographic displays, powerful aura",
    };
    const style = levelStyles[level] || levelStyles[1];
    const toolHint = tools.length > 0 ? `, using ${tools[0]}` : "";

    const prompt = `A high quality anime-style avatar character portrait, ${style}${toolHint}, digital art, detailed face, vibrant colors, clean background, profile picture style, square composition, professional quality`;

    const negativePrompt = "ugly, blurry, low quality, deformed, extra limbs, text, watermark, nsfw, realistic photo";

    const apiBody = {
      model: "sensenova-u1-fast",
      prompt,
      negative_prompt: negativePrompt,
      image_size: "2k",
      aspect_ratio: "1:1",
      seed: hashCode(seed),
    };

    const res = await fetch("https://token.sensenova.cn/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      return jsonResponse({ error: errText }, 500);
    }

    const data = await res.json();
    const imageUrl = data?.data?.[0]?.url;
    if (!imageUrl) return jsonResponse({ error: "No image generated" }, 500);

    return jsonResponse({ url: imageUrl }, 200);
  } catch (e) {
    return jsonResponse({ error: "Unexpected error" }, 500);
  }
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) % 999999;
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}
