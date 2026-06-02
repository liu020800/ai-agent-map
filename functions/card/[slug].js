export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const slug = url.pathname.split("/").filter(Boolean).pop() || "";
  const target = new URL(`/share?slug=${encodeURIComponent(slug)}`, url.origin);
  return Response.redirect(target.toString(), 302);
}