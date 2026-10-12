const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(express.static(__dirname));

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (!message || message.length > 4000) {
      return res.status(400).json({ error: "Message invalide (4 000 caractères maximum)." });
    }
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ error: "Le service IA n’est pas encore configuré." });
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es NOVA AI, un assistant utile, clair et bienveillant. Réponds en français sauf demande contraire." },
        { role: "user", content: message }
      ],
      max_tokens: 700
    });
    res.json({ reply: response.choices[0]?.message?.content || "Je n’ai pas pu générer de réponse." });
  } catch (error) {
    console.error("Erreur API IA :", error.status || error.message);
    res.status(500).json({ error: "Impossible de répondre pour le moment. Réessaie plus tard." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`NOVA AI démarré sur le port ${port}`));
