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
    const { title, type, description, tags } = await req.json();
    const availableTags = Array.isArray(tags) ? tags.map(String).map(tag => tag.trim()).filter(Boolean) : [];
    if (!String(title || "").trim() || !String(type || "").trim()) {
      return json({ success: false, error: "请先填写游戏名称和类型" }, 400, origin);
    }
    if (!availableTags.length) {
      return json({ success: false, error: "请先在玩法标签管理中添加可选标签" }, 400, origin);
    }

    const prompt = `根据游戏信息，从候选玩法标签中选择最贴切的1至3个。只输出 JSON 数组，数组元素必须完全来自候选标签，不能输出解释或其他内容。游戏名：《${String(title).trim()}》；类型：${String(type).trim()}；简介：${String(description || "").trim()}；候选标签：${JSON.stringify(availableTags)}`;
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "你是游戏分类专家，严格按用户指定的 JSON 格式输出。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("DeepSeek request failed:", detail);
      return json({ success: false, error: "DeepSeek 生成失败，请稍后重试" }, 502, origin);
    }

    const result = await response.json();
    const content = result?.choices?.[0]?.message?.content?.trim() || "";
    const match = content.match(/\[[\s\S]*\]/);
    let selectedTags: string[] = [];
    if (match) {
      try {
        selectedTags = JSON.parse(match[0]);
      } catch {
        selectedTags = [];
      }
    }
    selectedTags = [...new Set(selectedTags.filter(tag => availableTags.includes(tag)))].slice(0, 3);
    if (!selectedTags.length) {
      return json({ success: false, error: "DeepSeek 未返回有效玩法标签" }, 502, origin);
    }

    return json({ success: true, tags: selectedTags }, 200, origin);
  } catch (error) {
    console.error("Generate game tags failed:", error);
    return json({ success: false, error: "玩法标签生成服务异常" }, 500, origin);
  }
});
