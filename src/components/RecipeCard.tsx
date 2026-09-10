import { Link } from "react-router-dom";
import type { RankedRecipe, Recipe } from "../types";
import { isSaqFeatured } from "../types";

const CATEGORY_LABELS: Record<string, string> = {
  classic: "classique",
  specialty: "spécialité",
};

interface Props {
  recipe: Recipe;
  ranked?: RankedRecipe;
  actions?: import("react").ReactNode;
  /** Extra badge e.g. house specialty */
  houseBadge?: boolean;
}

export function RecipeCard({ recipe, ranked, actions, houseBadge }: Props) {
  const isHouse =
    houseBadge ||
    recipe.id.startsWith("specialty-") ||
    (recipe.category === "specialty" &&
      recipe.description.toLowerCase().includes("créé pour ton bar"));
  const saq = isSaqFeatured(recipe);

  return (
    <article className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
        <h3>
          <Link to={`/recipe/${recipe.id}`}>{recipe.name}</Link>
        </h3>
        {ranked && <span className="score">{Math.round(ranked.score)}</span>}
      </div>
      <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.92rem" }}>
        {recipe.description}
      </p>
      <div className="meta">
        <span className="chip accent">
          {CATEGORY_LABELS[recipe.category] ?? recipe.category}
        </span>
        {saq && (
          <span
            className="chip chip-vedette"
            title="Inspiré SAQ — suggestion non affiliée"
          >
            Vedette SAQ
          </span>
        )}
        {saq && recipe.tags.includes("saq") && (
          <span className="chip chip-saq">Inspiré SAQ</span>
        )}
        {isHouse && <span className="chip chip-house">maison</span>}
        <span className="chip">{recipe.abvBand} ABV</span>
        {ranked?.pantryCoverage && ranked.pantryCoverage.total > 0 && (
          <span
            className={`chip ${ranked.pantryCoverage.ratio >= 0.8 ? "chip-ok" : ""}`}
            title={
              ranked.pantryCoverage.missing.length
                ? `Manque : ${ranked.pantryCoverage.missing.join(", ")}`
                : "Tout est dans ton bar (+ staples)"
            }
          >
            {ranked.pantryCoverage.label}
          </span>
        )}
        {recipe.tags
          .filter((t) => t !== "saq" && t !== "vedette")
          .slice(0, 3)
          .map((t) => (
            <span className="chip" key={t}>
              {t}
            </span>
          ))}
      </div>
      {ranked && ranked.reasons.length > 0 && (
        <ul className="reasons">
          {ranked.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {actions && <div className="btn-row" style={{ marginTop: "0.85rem" }}>{actions}</div>}
    </article>
  );
}
