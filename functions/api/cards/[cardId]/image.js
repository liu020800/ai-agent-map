import {
  cardImageObjectKey,
  fetchRows,
  generatedImageToBytes,
  getImageStore,
  getSupabaseEnv,
  isFallbackImageUrl,
  isPersistentImageUrl,
  persistentCardImageUrl,
  updateRow,
} from "../_shared.js";

export async function onRequestGet(context) {
  const cardId = context.params.cardId || "";
  const bucket = getImageStore(context);
  const key = cardImageObjectKey(cardId);

  if (bucket) {
    const object = await bucket.get(key);
    if (object) return objectResponse(object);
  }

  const migrated = await tryMigrateLegacyImage(context, cardId, bucket);
  if (migrated) return migrated;

  return fallbackSvg(cardId, bucket ? "Image not found" : "Image storage is not configured");
}

function objectResponse(object) {
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("Content-Type", headers.get("Content-Type") || "image/png");
  return new Response(object.body, { headers });
}

async function tryMigrateLegacyImage(context, cardId, bucket) {
  const env = getSupabaseEnv(context);
  if (!env) return null;
  const result = await fetchRows(env, `select=avatar_seed&card_slug=eq.${encodeURIComponent(cardId)}&status=eq.valid&limit=1`);
  if (!result.ok || !result.rows.length) return null;

  const storedImage = result.rows[0]?.avatar_seed || "";
  if (!storedImage || isPersistentImageUrl(storedImage) || isFallbackImageUrl(storedImage)) return null;

  try {
    const { bytes, contentType } = await generatedImageToBytes(storedImage);
    if (bucket) {
      await bucket.put(cardImageObjectKey(cardId), bytes, {
        httpMetadata: {
          contentType,
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: {
          cardId,
          source: "legacy-avatar-seed",
          migratedAt: new Date().toISOString(),
        },
      });
      await updateRow(env, cardId, { avatar_seed: persistentCardImageUrl(new URL(context.request.url).origin, cardId), updated_at: new Date().toISOString() });
    }
    return new Response(bytes, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": bucket ? "public, max-age=31536000, immutable" : "s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return null;
  }
}

function fallbackSvg(cardId, reason) {
  const safeCardId = escapeXml(cardId || "AI Agent Map");
  const safeReason = escapeXml(reason);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  <rect width="1200" height="1500" rx="48" fill="#fafafa"/>
  <rect x="48" y="48" width="1104" height="1404" rx="36" fill="#fff" stroke="#e5e5e5" stroke-width="2"/>
  <text x="96" y="150" fill="#111" font-family="Arial, sans-serif" font-size="48" font-weight="700">AI 身份卡</text>
  <text x="96" y="230" fill="#777" font-family="Arial, sans-serif" font-size="28">${safeCardId}</text>
  <rect x="96" y="320" width="1008" height="760" rx="24" fill="#f5f5f5" stroke="#e5e5e5"/>
  <text x="600" y="680" text-anchor="middle" fill="#111" font-family="Arial, sans-serif" font-size="36" font-weight="700">身份卡图片暂不可用</text>
  <text x="600" y="740" text-anchor="middle" fill="#777" font-family="Arial, sans-serif" font-size="24">${safeReason}</text>
  <text x="96" y="1330" fill="#999" font-family="Arial, sans-serif" font-size="26">请稍后刷新，或重新生成身份卡。</text>
  <text x="96" y="1385" fill="#111" font-family="Arial, sans-serif" font-size="26" font-weight="700">liusq.icu</text>
</svg>`;
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
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
