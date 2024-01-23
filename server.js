import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import MistralClient from "@mistralai/mistralai";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

if (!globalThis.fetch) {
  globalThis.fetch = fetch;
}

const app = express();
app.use(bodyParser.json());
app.use(cors());

const apiKey = process.env.MISTRAL_API_KEY; // Assurez-vous que votre clé API est définie dans les variables d'environnement
const client = new MistralClient(apiKey);

app.post("/askMistral", async (req, res) => {
  const { question, systemMessage } = req.body;
  try {
    let messages = [systemMessage];
    messages.push({ role: "user", content: question });
    console.log(messages);
    const chatResponse = await client.chat({
      model: "mistral-small",
      messages: messages,
    });

    res.json({ answer: chatResponse.choices[0].message.content });
  } catch (error) {
    console.error("Erreur lors de la communication avec l'API Mistral:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la communication avec l'API Mistral" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur http://localhost:${PORT}`);
});
