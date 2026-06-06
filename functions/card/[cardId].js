function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;",
  }[char]));
}

async function fetchCard(context, cardId) {
  const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/json" };
  const res = await fetch(`${supabaseUrl}/rest/v1/users?select=*&card_slug=eq.${encodeURIComponent(cardId)}&status=eq.valid&limit=1`, { headers });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : null;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const cardId = context.params.cardId || url.pathname.split("/").filter(Boolean).pop() || "";
  const row = await fetchCard(context, cardId);
  const tools = Array.isArray(row?.tools) ? row.tools.join(" / ") : row?.primary_tool || "AI 工具";
  const nickname = row?.nickname || "匿名 Agent";
  const imageUrl = row?.avatar_seed || `${url.origin}/og-image.png`;
  const shareUrl = `${url.origin}/card/${encodeURIComponent(cardId)}`;
  const appUrl = `${url.origin}/share?cardId=${encodeURIComponent(cardId)}`;
  const title = `${nickname} 的 AI Agent 身份卡`;
  const description = `我已点亮 AI Agent Map，正在使用 ${tools}。你也来生成一张全国 AI 信号身份卡。`;

  return new Response(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:url" content="${escapeHtml(shareUrl)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(appUrl)}" />
  <style>
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#020617;color:white;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    a{color:#67e8f9}
    .card{max-width:680px;padding:32px;border:1px solid rgba(34,211,238,.25);border-radius:28px;background:rgba(15,23,42,.72);text-align:center}
    img{max-width:320px;width:100%;border-radius:20px;border:1px solid rgba(255,255,255,.12)}
  </style>
</head>
<body>
  <main class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(description)}</p>
    ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" />` : ""}
    <p><a href="${escapeHtml(appUrl)}">查看身份卡详情</a></p>
    <p>AI 生成内容 · 仅供娱乐分享</p>
  </main>
</body>
</html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "s-maxage=60, stale-while-revalidate=120" },
  });
}
