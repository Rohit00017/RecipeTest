import React, { useState, useEffect } from "react";
import "./App.css";

const API_ID = ""; //Due to some limitations i can't able access the api provided
const API_KEY = "";

function App() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState("");

  const fetchRecipes = async () => {
    if (!query) return;

    const cachedData = localStorage.getItem(query);
    if (cachedData) {
      try {
        setRecipes(JSON.parse(cachedData));
      } catch (error) {
        console.error("Error parsing JSON from localStorage:", error);
        localStorage.removeItem(query); 
      }
      return;
    }

    try {
      const response = await fetch(
        `https://api.edamam.com/search?q=${query}&app_id=${API_ID}&app_key=${API_KEY}&from=0&to=10`
      );

      if (!response.ok) {
        if (response.status === 429) {
          setError("Too many requests! Please wait and try again.");
        } else {
          setError(`Error: ${response.status}`);
        }
        return;
      }

      const text = await response.text();
      if (!text.trim()) {
        setError("Empty response from API");
        return;
      }

      try {
        const data = JSON.parse(text);
        if (!data.hits || data.hits.length === 0) {
          setError("No recipes found. Try another search.");
          return;
        }
        setRecipes(data.hits);
        localStorage.setItem(query, JSON.stringify(data.hits));
        setError("");
      } catch (error) {
        console.error("Error parsing API response:", error);
        setError("Failed to load recipes. Try again.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Something went wrong. Try again later.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes();
  };

  return (
    <div className="container">
      <h1>Recipe App</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for recipes..."
        />
        <button type="submit">Search</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="recipes">
        {recipes.map((recipe, index) => (
          <div key={index} className="recipe-card">
            <img src={recipe.recipe.image} alt={recipe.recipe.label} />
            <h3>{recipe.recipe.label}</h3>
            <a href={recipe.recipe.url} target="_blank" rel="noopener noreferrer">
              View Recipe
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
