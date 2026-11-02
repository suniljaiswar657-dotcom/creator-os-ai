const MODEL = "gemini-2.5-flash";
module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: "Gemini API key abhi configure nahi hai." });
  const { topic, format, tone } = req.body || {};
  if (typeof topic !== "string" || !topic.trim() || topic.length > 500) {
    return res.status(400).json({ error: "Topic 1–500 characters ka hona chahiye." });
  }
  const prompt = `You are the script writer for RomeoRex Gaming, an Indian BGMI gaming YouTube channel. Write in natural spoken Hindi + Hinglish. Be energetic but not cringe. Do not invent patch notes, tournament results, player stats, dates, or game mechanics. If a claim needs verification, explicitly mark it [VERIFY]. Do not promise wins or guaranteed rank gains. Make the script original and practical for a solo mobile gaming creator.
Create a complete video package for this idea: "${topic.trim()}"
Format: ${String(format || "YouTube Short").slice(0,80)}
Tone: ${String(tone || "Natural Hindi + Hinglish").slice(0,120)}
Return ONLY valid JSON with exactly these keys:
{"title":"one clickable but honest Hindi/Hinglish title","hook":"spoken opening hook","scenes":[{"time":"time range","visual":"what to show on screen","voiceover":"spoken line","action":"recording/editing cue"}],"voiceover":"full continuous voice-over script","description":"YouTube description with a short CTA and any needed [VERIFY] note","tags":["tag1","tag2"]}
Keep Shorts tight (30–60 sec) and long videos paced for 5–8 min. Scenes should match the selected format. Ensure voiceover is coherent and usable as-is.`;
  try {
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.75, responseMimeType: "application/json", maxOutputTokens: 5000 }
      })
    });
    const payload = await upstream.json();
    if (!upstream.ok) {
      const message = payload?.error?.message || "Gemini API request failed.";
      return res.status(upstream.status === 429 ? 429 : 502).json({ error: message.slice(0, 240) });
    }
    const text = payload?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim();
    if (!text) return res.status(502).json({ error: "AI ne empty response diya. Dobara try karo." });
    let script;
    try { script = JSON.parse(text); } catch { return res.status(502).json({ error: "AI response format valid nahi tha. Dobara try karo." }); }
    if (!script.title || !script.hook || !Array.isArray(script.scenes) || !script.voiceover || !script.description || !Array.isArray(script.tags)) {
      return res.status(502).json({ error: "AI response incomplete tha. Dobara try karo." });
    }
    return res.status(200).json({ script, model: MODEL });
  } catch {
    return res.status(500).json({ error: "AI service temporarily unavailable." });
  }
};
