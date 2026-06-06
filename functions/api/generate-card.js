export async function onRequestPost() {
  return new Response(
    JSON.stringify({
      success: false,
      error: "Direct image generation is disabled. Use /api/cards/create or /api/cards/:cardId/regenerate.",
    }),
    { status: 410, headers: { "Content-Type": "application/json" } },
  );
}
