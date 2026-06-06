export async function onRequestPost(context) {
  const token = context.request.headers.get("x-admin-clear-token") || "";
  if (!context.env.CLEAR_USERS_TOKEN || token !== context.env.CLEAR_USERS_TOKEN) {
    return jsonResponse({ success: false, error: "unauthorized" }, 401);
  }

  const supabaseUrl = context.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = context.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return jsonResponse({ success: false, error: "server env not configured" }, 500);

  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const before = await countUsers(supabaseUrl, headers);
  const deleted = await fetch(`${supabaseUrl}/rest/v1/users?id=not.is.null`, {
    method: "DELETE",
    headers: { ...headers, Prefer: "return=minimal" },
  });
  if (!deleted.ok) return jsonResponse({ success: false, error: await deleted.text(), before }, 500);
  const after = await countUsers(supabaseUrl, headers);
  return jsonResponse({ success: true, before, after }, 200);
}

async function countUsers(url, headers) {
  const res = await fetch(`${url}/rest/v1/users?select=id`, {
    headers: { ...headers, Prefer: "count=exact" },
  });
  if (!res.ok) return null;
  const range = res.headers.get("content-range") || "";
  const total = range.split("/")[1];
  return total && total !== "*" ? Number(total) : null;
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
