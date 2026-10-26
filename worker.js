// Cloudflare Worker — holds Gemini key privately
// Deploy: wrangler deploy or paste into Cloudflare dashboard
// Set secret: wrangler secret put GEMINI_KEY

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    if (request.method !== "POST") return new Response("POST only", { status: 405 });

    const key = env.GEMINI_KEY;
    if (!key) return json({ error: "no key configured" }, 500);

    let body;
    try { body = await request.json(); } catch { return json({ error: "bad json" }, 400); }
    const dataUrl = body.image || "";
    const b64 = (dataUrl.split(",")[1] || "").slice(0, 500000);
    if (!b64) return json({ error: "no image" }, 400);

    const prompt = `You are a precise resale and product identification assistant. Identify the exact item in the photo.
Return ONLY valid JSON with this shape:
{"name":"specific name including brand and model if visible","brand":"exact brand or unknown","model":"model if visible or unknown","condition":"Used / Good / Fair","low":15,"high":35,"floor":10,"purpose":"what this specific item is for in 1-2 sentences","history":"brief background or era if relevant, especially for antiques or known products","howto":"how to use, test, or care for this item","notes":["value driver 1","value driver 2"],"search":"exact search for sold listings","listingTitle":"ready title","listingBody":"short description"}
Be specific. If you can read a brand or model, include it. For antiques note style or period if visible. Do not invent details. Keep price ranges realistic and relatively tight for US resale.`;

    const models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [
                { inline_data: { mime_type: "image/jpeg", data: b64 } },
                { text: prompt }
              ]}],
              generationConfig: { temperature: 0.2 }
            })
          }
        );
        if (!res.ok) continue;
        const data = await res.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        text = text.replace(/```json|```/gi, "").trim();
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start < 0 || end < 0) continue;
        const parsed = JSON.parse(text.slice(start, end + 1));
        if (parsed && parsed.name) return json(parsed);
      } catch (e) { /* next model */ }
    }
    return json({ error: "no result" }, 502);
  }
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
