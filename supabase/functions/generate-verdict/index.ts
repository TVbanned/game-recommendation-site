const json = (body: unknown, status = 200, origin = "*") =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  if (req.method === "OPTIONS") return new Response("ok", { headers: {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }});

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405, origin);
  }

  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    return json({ success: false, error: "DeepSeek 服务尚未配置" }, 503, origin);
  }

  try {
    const { title, type, description } = await req.json();
    if (!String(title || "").trim() || !String(type || "").trim()) {
      return json({ success: false, error: "请先填写游戏名称和类型" }, 400, origin);
    }

    const prompt = `请为这款游戏写一句判词：精准突出核心玩点，诙谐、有网感，严格不超过15个汉字或等价字符。只输出判词本身，不带引号、解释或前缀。游戏名：《${String(title).trim()}》；类型：${String(type).trim()}；简介：${String(description || "").trim()}`;
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是中文游戏推荐文案达人，严格遵守用户规定的输出长度和格式。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.9,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("DeepSeek request failed:", detail);
      return json({ success: false, error: "DeepSeek 生成失败，请稍后重试" }, 502, origin);
    }

    const result = await response.json();
    let verdict = result?.choices?.[0]?.message?.content?.trim() || "";
    verdict = verdict.replace(/^["'“‘「]|["'”’」]$/g, "").trim().slice(0, 15);
    if (!verdict) {
      return json({ success: false, error: "Gemini 未返回有效判词" }, 502, origin);
    }

    return json({ success: true, verdict }, 200, origin);
  } catch (error) {
    console.error("Generate verdict failed:", error);
    return json({ success: false, error: "判词生成服务异常" }, 500, origin);
  }
});
