// In pages/index.js

import React, { useState } from "react";
import { FaCarrot, FaCheese, FaDrumstickBite, FaEgg } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [matchAll, setMatchAll] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const allIngredients = [
    "Tomaten", "Paprika", "Zwiebeln", "Knoblauch", "Spinat", "Brokkoli",
    "Käse", "Milch", "Butter", "Sahne",
    "Hähnchen", "Thunfisch",
    "Eier", "Reis", "Nudeln", "Linsen", "Basilikum",
    "Mais", "Petersilie", "Tofu"
  ];

  const ingredientGroups = [
    {
      title: "Gemüse",
      icon: <FaCarrot className="inline mr-1" />,
      items: ["Tomaten", "Paprika", "Zwiebeln", "Knoblauch", "Spinat", "Brokkoli"]
    },
    {
      title: "Milchprodukte",
      icon: <FaCheese className="inline mr-1" />,
      items: ["Käse", "Milch", "Butter", "Sahne"]
    },
    {
      title: "Fleisch & Fisch",
      icon: <FaDrumstickBite className="inline mr-1" />,
      items: ["Hähnchen", "Thunfisch"]
    },
    {
      title: "Sonstiges",
      icon: <FaEgg className="inline mr-1" />,
      items: ["Eier", "Reis", "Nudeln", "Linsen", "Basilikum"]
    },
  ];

  const onInputChange = (e) => {
    const userInput = e.target.value;
    setCustomInput(userInput);
    if (userInput.length > 0) {
      const filtered = allIngredients.filter((item) =>
        item.toLowerCase().includes(userInput.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
      setActiveSuggestion(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      if (showSuggestions && suggestions.length > 0) {
        const selected = suggestions[activeSuggestion];
        if (!ingredients.includes(selected)) {
          setIngredients([...ingredients, selected]);
        }
      } else if (customInput.trim() && !ingredients.includes(customInput)) {
        setIngredients([...ingredients, customInput.trim()]);
      }
      setCustomInput("");
      setSuggestions([]);
      setShowSuggestions(false);
    } else if (e.key === "ArrowUp") {
      setActiveSuggestion((prev) => (prev === 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "ArrowDown") {
      setActiveSuggestion((prev) => (prev === suggestions.length - 1 ? 0 : prev + 1));
    }
  };

  const handleGenerateRecipes = async () => {
    setLoading(true);
    setRecipes("");
    try {
      const response = await fetch("/api/generate-recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, matchAll })
      });
      const data = await response.json();
      setRecipes(data.result);
    } catch (error) {
      setRecipes("Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  };

  const removeIngredient = (itemToRemove) => {
    setIngredients(ingredients.filter((item) => item !== itemToRemove));
  };

  const prompt = "Paprika-Hähnchenpfanne, realistisch, food photography";

  const handleGenerateRecipes = async () => {
  setLoading(true);
  setRecipes("");
  setRecipeImage(null); // Bild zurücksetzen

  try {
    const response = await fetch("/api/generate-recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredients, matchAll })
    });
    const data = await response.json();
    setRecipes(data.result);

    // Bild generieren auf Basis der ersten drei Zutaten
    const imagePrompt = `${ingredients.slice(0, 3).join(", ")} Gericht, food photography, realistisch`;
    const imageResponse = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: imagePrompt })
    });
    const imageData = await imageResponse.json();
    setRecipeImage(imageData.image);
  } catch (error) {
    setRecipes("Ein Fehler ist aufgetreten.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#99f797] p-4 sm:p-6">
    <div className="flex justify-center">
  <img
    src="/dino.png"
    alt="Dino mit Kühlschrank"
    className="w-32 sm:w-52 md:w-72 lg:w-[18rem] h-auto rounded-xl shadow-lg ring-1 ring-black/10 mb-4"
/>
</div>

      <button
        onClick={() => setShowPopup(true)}
        className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded z-50 hover:bg-blue-700 shadow"
      >
        Abonnieren
      </button>

      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-sm text-center">
            <p className="text-lg font-semibold mb-4">
              Das Limit wurde überschritten.<br />
              Für nur 2,49€ pro Monat kannst du uneingeschränkt passende Rezepte generieren.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-xl sm:max-w-2xl">
        <h1 className="text-3xl font-bold mb-4 text-center">Was hast du im Kühlschrank?</h1>

        <input
          type="text"
          value={customInput}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="z. B. Mais, Petersilie, Tofu..."
          className="w-full p-2 border rounded mb-2 bg-white"
        />

        {showSuggestions && (
          <ul className="border bg-white rounded shadow mb-2">
            {suggestions.map((s, index) => (
              <li
                key={s}
                className={`p-2 cursor-pointer ${index === activeSuggestion ? "bg-blue-100" : ""}`}
                onClick={() => {
                  if (!ingredients.includes(s)) setIngredients([...ingredients, s]);
                  setCustomInput("");
                  setShowSuggestions(false);
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}

        {ingredients.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {ingredients.map((item) => (
              <span
                key={item}
                onClick={() => removeIngredient(item)}
                className="bg-blue-200 px-2 py-1 rounded-full text-sm cursor-pointer hover:bg-blue-300"
              >
                {item} &times;
              </span>
            ))}
          </div>
        )}

        {ingredientGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <h2 className="font-semibold mb-1">{group.icon} {group.title}</h2>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              {group.items.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (!ingredients.includes(item)) {
                      setIngredients([...ingredients, item]);
                    }
                  }}
                  className="px-2 py-1 rounded bg-white shadow"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mb-4">
          <p className="font-semibold">Sollen alle angegebenen Zutaten enthalten sein?</p>
          <div className="flex flex-col text-sm">
            <label>
              <input
                type="radio"
                checked={!matchAll}
                onChange={() => setMatchAll(false)}
                className="mr-1"
              />
              <span className="text-blue-600 italic">Nein (mindestens eine Zutat kommt vor)</span>
            </label>
            <label>
              <input
                type="radio"
                checked={matchAll}
                onChange={() => setMatchAll(true)}
                className="mr-1"
              />
              <span className="text-blue-600 italic">Ja (alle Zutaten kommen vor)</span>
            </label>
          </div>
        </div>

        {loading ? (
  <div className="flex flex-col items-center">
    <img src="/dino-cooking.gif" alt="Dino kocht..." className="w-40 h-auto mb-2" />
    <p className="text-lg font-semibold animate-pulse">Dino kocht dein Rezept...</p>
  </div>
) : (
  <button
    onClick={handleGenerateRecipes}
    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
  >
    Rezepte vorschlagen
  </button>
)}

{recipeImage && (
<div className="mt-6 flex justify-center">
<img
src={recipeImage}
alt="Generiertes Rezeptbild"
className="rounded-xl shadow-lg max-w-full sm:max-w-md"
/>
</div>
)}

        {recipes && (
          <div className="mt-8 space-y-8 px-2 sm:px-4">
            <ReactMarkdown
              components={{
                h3: ({ node, ...props }) => (
                  <h3 className="text-3xl font-bold text-center mt-8" {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong className="font-bold" {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside ml-4" {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li className="mb-1" {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p className="mb-2" {...props} />
                ),
                hr: () => (
                  <hr className="border-t border-green-300 my-6" />
                )
              }}
            >
              {recipes}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
