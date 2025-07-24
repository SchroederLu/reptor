// In pages/index.js
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  FaCarrot,
  FaCheese,
  FaDrumstickBite,
  FaEgg,
  FaFish,
  FaAppleAlt,
  FaBreadSlice,
} from "react-icons/fa";

const ingredientCategories = [
  {
    label: "Gemüse",
    icon: <FaCarrot />,
    items: ["Tomaten", "Paprika", "Zwiebeln", "Karotten", "Spinat"],
  },
  {
    label: "Milchprodukte",
    icon: <FaCheese />,
    items: ["Käse", "Milch", "Joghurt", "Butter"],
  },
  {
    label: "Fleisch & Fisch",
    icon: <FaDrumstickBite />,
    items: ["Hähnchen", "Hackfleisch", "Lachs"],
  },
  {
    label: "Eier & Obst",
    icon: <FaEgg />,
    items: ["Eier", "Äpfel", "Bananen", "Beeren"],
  },
  {
    label: "Brot & Getreide",
    icon: <FaBreadSlice />,
    items: ["Brot", "Reis", "Nudeln"],
  },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [matchAll, setMatchAll] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) return;
    setLoading(true);
    setRecipes([]);
    setImages([]);

    const response = await fetch("/api/generate-recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ingredients: selectedIngredients,
        matchAll,
      }),
    });

    const data = await response.json();
    setRecipes(data.recipes || []);
    setImages(data.images || []);
    setLoading(false);
  };

  const addIngredient = () => {
    const trimmed = input.trim();
    if (trimmed && !selectedIngredients.includes(trimmed)) {
      setSelectedIngredients([...selectedIngredients, trimmed]);
    }
    setInput("");
  };

  const removeIngredient = (item) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== item));
  };

  const handleSuggestedClick = (item) => {
    if (!selectedIngredients.includes(item)) {
      setSelectedIngredients([...selectedIngredients, item]);
    }
  };

  return (
    <div className="min-h-screen bg-[#e0f7dc] p-4 text-gray-800">
      <header className="flex justify-between items-center mb-6">
        <img src="/logo.png" alt="Logo" className="w-24 h-auto object-contain" />
        <h1 className="text-3xl font-bold text-center flex-1">
          KI-Rezeptvorschläge
        </h1>
      </header>

      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <input
            type="text"
            className="w-full border p-2 rounded"
            placeholder="Zutat eingeben..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addIngredient()}
          />
        </div>

        <div className="mb-4">
          <div className="grid grid-cols-2 gap-3">
            {ingredientCategories.map((category) => (
              <div key={category.label}>
                <div className="font-bold flex items-center gap-2 mb-1">
                  {category.icon} {category.label}
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSuggestedClick(item)}
                      className="bg-green-100 hover:bg-green-200 px-3 py-1 rounded-full text-sm"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {selectedIngredients.map((item) => (
            <span
              key={item}
              className="bg-green-200 px-3 py-1 rounded-full text-sm cursor-pointer"
              onClick={() => removeIngredient(item)}
            >
              {item} ✕
            </span>
          ))}
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={matchAll}
              onChange={() => setMatchAll(!matchAll)}
            />
            Versuche alle Zutaten zu verwenden
          </label>
        </div>

        {loading ? (
          <div className="text-center">
            <img
              src="/dino-cooking.gif"
              alt="Lädt..."
              className="w-32 mx-auto mb-2"
            />
            <p className="animate-pulse font-semibold">Dino kocht dein Rezept...</p>
          </div>
        ) : (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            onClick={handleGenerate}
          >
            Rezepte vorschlagen
          </button>
        )}
      </div>

      <div className="mt-10 max-w-3xl mx-auto space-y-10">
        {recipes.map((recipe, index) => (
          <div
            key={index}
            className="bg-white/90 p-6 rounded-lg shadow-md"
          >
            {images[index] && (
              <div className="flex justify-center mb-4">
                <img
                  src={images[index]}
                  alt={`Bild zu Rezept ${index + 1}`}
                  className="rounded-lg max-w-full sm:max-w-md shadow"
                />
              </div>
            )}
            <ReactMarkdown
              components={{
                h3: ({ children }) => (
                  <h3 className="text-2xl font-bold text-center mb-4">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="font-bold text-lg mt-4 mb-2">{children}</h4>
                ),
              }}
            >
              {`### Rezept ${index + 1}:
${recipe}`}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );
}
