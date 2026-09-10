import { Link, useParams } from "react-router-dom";
import { getRecipeById } from "../data/recipes";
import { isFavorite, toggleFavorite } from "../lib/favorites";
import { getSpecialtyById } from "../lib/specialties";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  classic: "classique",
  specialty: "spécialité",
};

export function RecipeDetail() {
  const { id } = useParams();
  const recipe = id
    ? (getRecipeById(id) ?? getSpecialtyById(id))
    : undefined;
  const [, setTick] = useState(0);

  if (!recipe) {
    return (
      <section>
        <h1>Recette introuvable</h1>
        <Link to="/results">Retour aux résultats</Link>
      </section>
    );
  }

  const fav = isFavorite(recipe.id);
  const isHouse =
    recipe.id.startsWith("specialty-") ||
    recipe.description.toLowerCase().includes("créé pour ton bar");

  return (
    <section className="recipe-detail">
      <p>
        <Link to="/results">← Résultats</Link>
        {" · "}
        <Link to="/pantry">Mon bar</Link>
      </p>
      <h1>{recipe.name}</h1>
      <p style={{ color: "var(--muted)" }}>{recipe.description}</p>
      <div className="meta">
        <span className="chip accent">
          {CATEGORY_LABELS[recipe.category] ?? recipe.category}
        </span>
        {isHouse && <span className="chip chip-house">maison</span>}
        <span className="chip">{recipe.abvBand} ABV</span>
        {recipe.tags.map((t) => (
          <span className="chip" key={t}>
            {t}
          </span>
        ))}
        {recipe.allergens.map((a) => (
          <span className="chip" key={a}>
            allergène : {a}
          </span>
        ))}
      </div>
      <div className="btn-row" style={{ margin: "1rem 0" }}>
        {!isHouse && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              toggleFavorite(recipe.id);
              setTick((t) => t + 1);
            }}
          >
            {fav ? "★ Retirer des favoris" : "☆ Ajouter aux favoris"}
          </button>
        )}
        <Link className="btn btn-primary" to="/tip">
          Laisser un pourboire
        </Link>
      </div>
      <div className="card">
        <h2>Ingrédients</h2>
        <ul>
          {recipe.ingredients.map((i) => (
            <li key={i}>{i}</li>
          ))}
        </ul>
        <h2>Étapes</h2>
        <ol>
          {recipe.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p>
          <strong>Garniture :</strong> {recipe.garnish}
        </p>
        <p>
          <strong>Base :</strong> {recipe.base}
        </p>
        <p>
          <strong>Spiritueux :</strong>{" "}
          {recipe.spirits.length ? recipe.spirits.join(", ") : "—"}
        </p>
      </div>
    </section>
  );
}
