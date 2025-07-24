// In pages/api/generate-recipes.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { ingredients, matchAll } = req.body;

  const systemMessage = `Du bist ein hilfreicher Küchenassistent, der aus Zutaten kreative und leckere Rezepte erstellt. Gib die Antwort im Markdown-Format zurück. Formatiere jedes Rezept so:

### Rezept X: Rezeptname

#### Zutaten:

- Zutat 1
- Zutat 2

#### Zubereitung:

1. Schritt 1
2. Schritt 2

Vermeide generische Namen wie "Gericht 1". Verwende, wenn möglich, deutsche, ansprechende Namen.`;

  const userMessage = `Erstelle 3 kreative Rezepte mit den Zutaten: ${ingredients.join(", ")}.
Alle Zutaten sollen ${matchAll ? "vollständig" : "teilweise"} enthalten sein.`;

  try {
    const completion = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage }
        ]
      }),
    });

    const json = await completion.json();

    if (!json.choices || !json.choices[0]?.message?.content) {
      return res.status(500).json({ result: "Fehler bei der KI-Antwort." });
    }

    const markdown = json.choices[0].message.content;

    // Extrahiere die einzelnen Rezepte anhand von Markdown-Trennung
    const recipeBlocks = markdown
      .split(/###\s*Rezept \d+:/)
      .filter(Boolean)
      .map((r) => r.trim());

    // Für jedes Rezept ein Bild generieren
    const imagePromises = recipeBlocks.map(async (recipe) => {
      const titleMatch = recipe.match(/^(.*?)\n/);
      const title = titleMatch ? titleMatch[1] : "Gericht";
      const imagePrompt = `${title}, food photography, 4k, realistisch`;

      try {
        const imageResponse = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: imagePrompt }),
        });
        const imageData = await imageResponse.json();
        return imageData.image || null;
      } catch (err) {
        return null;
      }
    });

    const images = await Promise.all(imagePromises);

    res.status(200).json({ recipes: recipeBlocks, images });
  } catch (error) {
    console.error("Fehler bei der Rezeptgenerierung:", error);
    res.status(500).json({ result: "Ein Fehler ist aufgetreten." });
  }
}
