const MODEL = "gemini-3.8-flash";
const FALLBACK_MODEL = "gemini-3.6-flash";
const INTERACTIONS_URL = "https://generativelanguage.googleapis.com/v1beta/interactions";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return res.status(503).json({ error: "Gemini API key abhi configure nahi hai." });
  }

  const { topic, format, tone } = req.body || {};
  if (typeof topic !== "string" || !topic.trim() || topic.length > 500) {
    return res.status(400).json({ error: "Topic 1–500 characters ka hona chahiye." });
  }

  const prompt = [
    "You are the script writer for RomeoRex Gaming, an Indian BGMI gaming YouTube channel. Write in natural spoken Hindi + Hinglish. Be energetic but not cringe. Do not invent patch notes, tournament results, player stats, dates, or game mechanics. If a claim needs verification, explicitly mark it [VERIFY]. Do not promise wins or guaranteed rank gains. Make the script original and practical for a solo mobile gaming creator.",
    "Create a complete video package for this idea: " + topic.trim(),
    "Format: " + String(format || "YouTube Short").slice(0, 80),
    "Tone: " + String(tone || "Natural Hindi + Hinglish").slice(0, 120),
    "Return ONLY valid JSON (no Markdown fences, no text before or after it) with exactly these keys:",
    '{"title":"one clickable but honest Hindi/Hinglish title","hook":"spoken opening hook","scenes":[{"time":"time range","visual":"what to show on screen","voiceover":"spoken line","action":"recording/editing cue"}],"voiceover":"full continuous voice-over script","description":"YouTube description with a short CTA and any needed [VERIFY] note","tags":["tag1","tag2"]}',
    "Keep Shorts tight (30–60 sec) and long videos paced for 5–8 min. Scenes should match the selected format. Ensure voiceover is coherent and usable as-is."
  ].join("\n\n");

  try {
    const send = async model => {
      const response = await fetch(INTERACTIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          model,
          input: prompt,
          generation_config: { thinking_level: "low" }
        })
      });
      const data = await response.json().catch(() => ({}));
      return { response, data };
    };

    let usedModel = MODEL;
    let result = await send(MODEL);
    if ([429, 500, 502, 503, 504].includes(result.response.status)) {
      await new Promise(resolve => setTimeout(resolve, 500));
      result = await send(MODEL);
    }
    if ([429, 500, 502, 503, 504].includes(result.response.status)) {
      usedModel = FALLBACK_MODEL;
      result = await send(FALLBACK_MODEL);
    }

    const upstream = result.response;
    const payload = result.data;
    if (!upstream.ok) {
      const message = payload?.error?.message || "Gemini API request failed.";
      const status = upstream.status === 429 ? 429 : 502;
      return res.status(status).json({
        error: "Primary aur fallback AI abhi available nahi hain. " + message.slice(0, 180)
      });
    }

    let outputText = payload?.output_text;
    if (!outputText && Array.isArray(payload?.outputs)) {
      outputText = payload.outputs.map(item => item?.text || "").join("").trim();
    }
    if (!outputText && Array.isArray(payload?.steps)) {
      outputText = payload.steps
        .filter(step => step?.type === "text" || step?.type === "output_text")
        .map(step => step?.text || step?.content || "")
        .join("").trim();
    }
    if (typeof outputText !== "string" || !outputText.trim()) {
      return res.status(502).json({ error: "AI ne empty response diya. Dobara try karo." });
    }

    const fence = String.fromCharCode(96).repeat(3);
    const cleaned = outputText.trim()
      .replace(/^\uFEFF/, "")
      .replace(new RegExp("^" + fence + "(?:json)?\\s*", "i"), "")
      .replace(new RegExp("\\s*" + fence + "$"), "");

    let script;
    try {
      script = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: "AI response format valid nahi tha. Dobara try karo." });
    }

    if (
      !script.title ||
      !script.hook ||
      !Array.isArray(script.scenes) ||
      !script.voiceover ||
      !script.description ||
      !Array.isArray(script.tags)
    ) {
      return res.status(502).json({ error: "AI response incomplete tha. Dobara try karo." });
    }

    return res.status(200).json({ script, model: usedModel });
  } catch {
    return res.status(500).json({ error: "AI service temporarily unavailable." });
  }
};
