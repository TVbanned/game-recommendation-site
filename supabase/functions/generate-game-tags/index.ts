import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.12";
const allowedOrigins = new Set((Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:3000").split(",").map((v) => v.trim()).filter(Boolean));
const cors = (origin: string) => ({ "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin" });
const json = (body: unknown, status: number, origin?: string) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...(origin ? cors(origin) : {}) } });
async function authorize(req: Request) { const authorization = req.headers.get("authorization") || ""; const url = Deno.env.get("SUPABASE_URL") || ""; const key = Deno.env.get("SUPABASE_ANON_KEY") || ""; if (!authorization.startsWith("Bearer ") || !url || !key) return false; const client = createClient(url, key, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } }); const { data: { user }, error } = await client.auth.getUser(authorization.slice(7)); if (error || !user) return false; const { data } = await client.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle(); return Boolean(data); }
const field = (value: unknown, max: number) => { const text = String(value || "").trim(); return text.length <= max ? text : ""; };
Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "";
  if (!allowedOrigins.has(origin)) return json({ success: false, error: "Origin not allowed" }, 403);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405, origin);
  if (Number(req.headers.get("content-length") || 0) > 32 * 1024) return json({ success: false, error: "Request too large" }, 413, origin);
  if (!(await authorize(req))) return json({ success: false, error: "Forbidden" }, 403, origin);
  const apiKey = Deno.env.get("DEEPSEEK_API_KEY"); if (!apiKey) return json({ success: false, error: "DeepSeek 服务尚未配置" }, 503, origin);
  try {
    const body = await req.json(); const title = field(body.title, 120); const type = field(body.type, 120); const description = field(body.description, 4000);
    const tags = Array.isArray(body.tags) && body.tags.length <= 50 ? body.tags.map((v: unknown) => field(v, 40)).filter(Boolean) : [];
    if (!title || !type || !tags.length) return json({ success: false, error: "字段缺失或超长" }, 400, origin);
    const prompt = `根据游戏信息，从候选玩法标签中选择最贴切的1至3个。只输出 JSON 数组。游戏名：《${title}》；类型：${type}；简介：${description}；候选标签：${JSON.stringify(tags)}`;
    const response = await fetch("https://api.deepseek.com/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` }, body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: "你是游戏分类专家，只输出 JSON。" }, { role: "user", content: prompt }], temperature: 0.3, max_tokens: 100 }) });
    if (!response.ok) return json({ success: false, error: "DeepSeek 生成失败，请稍后重试" }, 502, origin);
    const result = await response.json(); const match = String(result?.choices?.[0]?.message?.content || "").match(/\[[\s\S]*\]/); let selected: string[] = []; try { selected = match ? JSON.parse(match[0]) : []; } catch { selected = []; }
    selected = [...new Set(selected.filter((tag) => tags.includes(tag)))].slice(0, 3);
    return selected.length ? json({ success: true, tags: selected }, 200, origin) : json({ success: false, error: "未返回有效标签" }, 502, origin);
  } catch { return json({ success: false, error: "无效请求" }, 400, origin); }
});
