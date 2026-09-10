import { Link } from "react-router-dom";
import { useState } from "react";
import { RecipeCard } from "../components/RecipeCard";
import { getRecipeById } from "../data/recipes";
import { loadFavorites, toggleFavorite } from "../lib/favorites";

export function Favorites() {
  const [ids, setIds] = useState(() => loadFavorites());
  const recipes = ids
    .map((id) => getRecipeById(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <section>
      <h1>Favoris</h1>
      <p style={{ color: "var(--muted)" }}>
        Enregistrés dans le localStorage de cet appareil (pas de comptes).
      </p>
      {recipes.length === 0 ? (
        <p className="alert">
          Aucun favori pour l&apos;instant.{" "}
          <Link to="/quiz">Faire le quiz</Link> ou parcourir les{" "}
          <Link to="/results">résultats</Link>.
        </p>
      ) : (
        <div className="card-grid">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              actions={
                <>
                  <Link className="btn" to={`/recipe/${recipe.id}`}>
                    Voir
                  </Link>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setIds(toggleFavorite(recipe.id))}
                  >
                    Retirer
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
