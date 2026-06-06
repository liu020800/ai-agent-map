export async function onRequestGet(context) {
  const cardId = context.params.cardId || "";
  const row = await fetchCard(context, cardId);
  const nickname = escapeXml(row?.nickname || "匿名 Agent");
  const province = escapeXml(row?.province || "中国");
  const city = escapeXml(row?.city || "");
  const tools = escapeXml(Array.isArray(row?.tools) && row.tools.length ? row.tools.join(" / ") : "AI 工具");
  const signature = escapeXml(row?.usage_frequency || "用 AI 扩展自己的能力边界");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1824" height="2272" viewBox="0 0 1824 2272">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="#0b1224"/>
      <stop offset=".55" stop-color="#102a3c"/>
      <stop offset="1" stop-color="#281446"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop stop-color="#67e8f9"/>
      <stop offset=".5" stop-color="#a3e635"/>
      <stop offset="1" stop-color="#c084fc"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M64 0H0V64" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="1824" height="2272" rx="120" fill="url(#bg)"/>
  <rect width="1824" height="2272" fill="url(#grid)" opacity=".55"/>
  <circle cx="280" cy="300" r="260" fill="#22d3ee" opacity=".18" filter="url(#glow)"/>
  <circle cx="1540" cy="460" r="300" fill="#a855f7" opacity=".18" filter="url(#glow)"/>
  <rect x="112" y="112" width="1600" height="2048" rx="84" fill="rgba(2,6,23,.48)" stroke="url(#line)" stroke-width="6"/>
  <text x="180" y="260" fill="#67e8f9" font-family="Arial, sans-serif" font-size="42" letter-spacing="14" font-weight="700">AI AGENT MAP</text>
  <text x="180" y="380" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="92" font-weight="900">全国 AI 信号身份卡</text>
  <path d="M500 800 L620 690 L820 720 L980 620 L1180 700 L1330 650 L1460 780 L1420 940 L1530 1030 L1400 1160 L1440 1320 L1260 1380 L1100 1540 L900 1460 L720 1560 L560 1400 L380 1320 L460 1120 L330 990 L470 900 Z" fill="rgba(34,211,238,.08)" stroke="#67e8f9" stroke-width="6" opacity=".9"/>
  <circle cx="1120" cy="900" r="18" fill="#a3e635" filter="url(#glow)"/>
  <circle cx="1280" cy="1050" r="14" fill="#67e8f9" filter="url(#glow)"/>
  <circle cx="960" cy="1200" r="16" fill="#c084fc" filter="url(#glow)"/>
  <text x="180" y="1760" fill="#94a3b8" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="36" letter-spacing="8">NICKNAME</text>
  <text x="180" y="1840" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="72" font-weight="900">${nickname}</text>
  <text x="180" y="1960" fill="#94a3b8" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="36" letter-spacing="8">NODE</text>
  <text x="180" y="2030" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="52" font-weight="700">${province}${city}</text>
  <text x="900" y="1760" fill="#94a3b8" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="36" letter-spacing="8">TOOLS</text>
  <text x="900" y="1840" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="48" font-weight="700">${tools}</text>
  <text x="900" y="1960" fill="#94a3b8" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="36" letter-spacing="8">SIGNATURE</text>
  <text x="900" y="2030" fill="#ffffff" font-family="Arial, 'Microsoft YaHei', sans-serif" font-size="44" font-weight="700">${signature}</text>
  <text x="180" y="2140" fill="#67e8f9" font-family="Arial, sans-serif" font-size="36" font-weight="700">${escapeXml(cardId)}</text>
  <text x="1220" y="2140" fill="#a3e635" font-family="Arial, sans-serif" font-size="36" font-weight="700">liusq.icu</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}

async function fetchCard(context, cardId) {
  const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: "application/json" };
  const res = await fetch(`${supabaseUrl}/rest/v1/users?select=*&card_slug=eq.${encodeURIComponent(cardId)}&limit=1`, { headers });
  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] : null;
}

function escapeXml(value) {
  return String(value || "").replace(/[<>&"']/g, (char) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    "\"": "&quot;",
    "'": "&apos;",
  }[char]));
}
