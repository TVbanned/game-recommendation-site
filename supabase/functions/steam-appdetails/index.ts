import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";

const allowedOrigins = new Set((Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:3000").split(",").map((v) => v.trim()).filter(Boolean));
const cors = (origin: string) => ({ "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" });
const json = (body: unknown, status: number, origin?: string) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...(origin ? cors(origin) : {}) } });

async function authorize(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  const url = Deno.env.get("SUPABASE_URL") || "";
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
  if (!authorization.startsWith("Bearer ") || !url || !anonKey) return false;
  const client = createClient(url, anonKey, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
  const { data: { user }, error } = await client.auth.getUser(authorization.slice(7));
  if (error || !user) return false;
  const { data } = await client.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return Boolean(data);
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  if (!allowedOrigins.has(origin)) return json({ success: false, error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405, origin);
  if (Number(req.headers.get("content-length") || 0) > 32 * 1024) return json({ success: false, error: "Request too large" }, 413, origin);
  if (!(await authorize(req))) return json({ success: false, error: "Forbidden" }, 403, origin);

  try {
    const { appId } = await req.json();
    const value = String(appId || "");
    if (!/^\d{1,10}$/.test(value)) return json({ success: false, error: "Invalid Steam App ID" }, 400, origin);
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${value}&l=schinese&cc=cn`, { headers: { "User-Agent": "game-recommendation-site/1.0" } });
    if (!response.ok) return json({ success: false, error: `Steam request failed: ${response.status}` }, 502, origin);
    const payload = await response.json();
    const game = payload?.[value]?.data;
    if (!payload?.[value]?.success || !game) return json({ success: false, error: "Steam game not found" }, 404, origin);
    return json({ success: true, game: { appId: value, title: game.name || "", team: game.developers?.join("、") || game.publishers?.join("、") || "", type: game.genres?.map((item: { description: string }) => item.description).join(" / ") || "", price: game.is_free ? "0" : (((game.price_overview?.final ?? 0) as number) / 100).toFixed(2), desc: game.short_description || "", targetUrl: `https://store.steampowered.com/app/${value}/`, cover: game.header_image || "", released: game.release_date?.coming_soon !== true, releaseDate: game.release_date?.date || "", screenshots: (game.screenshots || []).slice(0, 4).map((s: { path_full: string }) => `${s.path_full}?imw=1200&imh=675&ima=fit`) } }, 200, origin);
  } catch {
    return json({ success: false, error: "Invalid request" }, 400, origin);
  }
});
