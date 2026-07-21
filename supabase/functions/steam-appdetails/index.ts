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

const corsPreflight = (origin = "*") =>
  new Response("ok", {
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") || "*";

  if (req.method === "OPTIONS") {
    return corsPreflight(origin);
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405, origin);
  }

  try {
    const { appId } = await req.json();
    if (!/^\d+$/.test(String(appId || ""))) {
      return json({ success: false, error: "Invalid Steam App ID" }, 400, origin);
    }

    const steamUrl =
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=schinese&cc=cn`;
    const response = await fetch(steamUrl, {
      headers: {
        "User-Agent": "game-recommendation-site/1.0",
      },
    });

    if (!response.ok) {
      return json(
        { success: false, error: `Steam request failed: ${response.status}` },
        502,
        origin,
      );
    }

    const payload = await response.json();
    const game = payload?.[appId]?.data;

    if (!payload?.[appId]?.success || !game) {
      return json({ success: false, error: "Steam game not found" }, 404, origin);
    }

    const normalized = {
      appId: String(appId),
      title: game.name || "",
      team: game.developers?.join("、") || game.publishers?.join("、") || "",
      type: game.genres?.map((item: { description: string }) => item.description).join(" / ") || "",
      price: game.is_free ? "0" : (((game.price_overview?.final ?? 0) as number) / 100).toFixed(2),
      desc: game.short_description || "",
      targetUrl: `https://store.steampowered.com/app/${appId}/`,
      cover: game.header_image || "",
      released: game.release_date?.coming_soon !== true,
      releaseDate: game.release_date?.date || "",
      screenshots: (game.screenshots || []).slice(0, 4).map((s: { path_full: string }) => s.path_full),
    };

    return json({ success: true, game: normalized }, 200, origin);
  } catch (error) {
    return json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500,
      origin,
    );
  }
});
