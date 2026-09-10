import { Link } from "react-router-dom";
import { RecipeCard } from "../components/RecipeCard";
import { getSaqFeaturedRecipes, RECIPES } from "../data/recipes";
import { toggleFavorite, isFavorite, loadFavorites } from "../lib/favorites";
import {
  loadPantry,
  pantryIsEmpty,
  type PantryFilterMode,
} from "../lib/pantry";
import { loadPreferences } from "../lib/prefs";
import { topMatches } from "../lib/scoring";
import {
  canGenerateSpecialties,
  generateSpecialties,
} from "../lib/specialties";
import { DEFAULT_PREFERENCES } from "../types";
import { useMemo, useState } from "react";

const MODE_KEY = "pantry-filter-mode-v1";

function loadMode(): PantryFilterMode {
  try {
    const v = localStorage.getItem(MODE_KEY);
    if (v === "hard" || v === "soft" || v === "off") return v;
  } catch {
    /* ignore */
  }
  return "soft";
}

export function Results() {
  const prefs = loadPreferences() ?? DEFAULT_PREFERENCES;
  const pantry = loadPantry();
  const [mode, setMode] = useState<PantryFilterMode>(() => loadMode());
  const [, setTick] = useState(0);
  const favs = loadFavorites();
  const emptyPantry = pantryIsEmpty(pantry);

  const ranked = useMemo(
    () =>
      topMatches(RECIPES, prefs, 12, {
        pantry,
        pantryMode: emptyPantry ? "off" : mode,
      }),
    [prefs, pantry, mode, emptyPantry],
  );

  const guard = canGenerateSpecialties(pantry);
  const specialties = useMemo(() => {
    if (!guard.ok) return [];
    return generateSpecialties(pantry, prefs, 6);
  }, [pantry, prefs, guard.ok]);

  function setFilterMode(next: PantryFilterMode) {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  }

  return (
    <section>
      <h1>Vos suggestions</h1>
      {!loadPreferences() && (
        <p className="alert">
          Aucune réponse au quiz pour l&apos;instant — affichage des valeurs par
          défaut. <Link to="/quiz">Faire le quiz</Link> pour un meilleur
          classement.
        </p>
      )}
      <p style={{ color: "var(--muted)" }}>
        Classées selon la proximité avec ton cocktail préféré (profil + base),
        tes curseurs de saveurs, bases choisies, force et filtres alimentaires.
        {emptyPantry ? (
          <>
            {" "}
            Remplis <Link to="/pantry">Mon bar</Link> pour prioriser ce que tu
            as sous la main.
          </>
        ) : (
          <> Le classement tient compte de ton bar (couverture affichée).</>
        )}
      </p>

      {!emptyPantry && (
        <div className="card" style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
            <input
              type="checkbox"
              checked={mode === "hard"}
              onChange={(e) =>
                setFilterMode(e.target.checked ? "hard" : "soft")
              }
            />
            <span>
              <strong>Seulement avec mon bar</strong> — exclut les recettes
              dont il manque un ingrédient (glace, eau, sucre, sel, soda water
              restent gratuits).
            </span>
          </label>
          <p className="hint" style={{ margin: "0.5rem 0 0" }}>
            Mode actuel :{" "}
            {mode === "hard"
              ? "filtre strict"
              : "souple (boost de score + % de couverture)"}
            . <Link to="/pantry">Modifier Mon bar</Link>
          </p>
        </div>
      )}

      {guard.ok && specialties.length > 0 && (
        <>
          <h2>Spécialités maison</h2>
          <p style={{ color: "var(--muted)" }}>
            Créations originales à partir de ton inventaire — pas seulement le
            catalogue.
          </p>
          <div className="card-grid" style={{ marginBottom: "1.75rem" }}>
            {specialties.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                houseBadge
                actions={
                  <Link className="btn" to={`/recipe/${recipe.id}`}>
                    Voir
                  </Link>
                }
              />
            ))}
          </div>
        </>
      )}

      {!emptyPantry && !guard.ok && (
        <p className="alert" style={{ marginBottom: "1.25rem" }}>
          {guard.message}{" "}
          <Link to="/pantry">Compléter Mon bar</Link>
        </p>
      )}


      <div className="section-saq">
        <h2>Suggestions SAQ &amp; Produits Vedettes</h2>
        <p style={{ color: "var(--muted)", marginTop: 0 }}>
          Classiques SAQ-style et torsions québécoises (Gin Ungava, vermouth
          d&apos;ici, camerise, sirop d&apos;épinette…).
        </p>
        <div className="card-grid" style={{ marginBottom: "0.5rem" }}>
          {getSaqFeaturedRecipes().map((recipe) => (
            <RecipeCard
              key={`saq-${recipe.id}`}
              recipe={recipe}
              actions={
                <>
                  <Link className="btn" to={`/recipe/${recipe.id}`}>
                    Voir
                  </Link>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      toggleFavorite(recipe.id);
                      setTick((t) => t + 1);
                    }}
                  >
                    {favs.includes(recipe.id) || isFavorite(recipe.id)
                      ? "★ Enregistré"
                      : "☆ Enregistrer"}
                  </button>
                </>
              }
            />
          ))}
        </div>
        <p className="disclaimer">
          Non affilié à la SAQ; suggestions inspirées de classiques et de
          produits disponibles au Québec.
        </p>
      </div>

      <h2>Catalogue</h2>
      <div className="card-grid">
        {ranked.map((r) => (
          <RecipeCard
            key={r.recipe.id}
            recipe={r.recipe}
            ranked={r}
            actions={
              <>
                <Link className="btn" to={`/recipe/${r.recipe.id}`}>
                  Voir
                </Link>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    toggleFavorite(r.recipe.id);
                    setTick((t) => t + 1);
                  }}
                >
                  {favs.includes(r.recipe.id) || isFavorite(r.recipe.id)
                    ? "★ Enregistré"
                    : "☆ Enregistrer"}
                </button>
              </>
            }
          />
        ))}
      </div>
      {ranked.length === 0 && (
        <p className="alert err">
          Aucune recette ne correspond (filtres allergènes / sans alcool / bar
          strict). Assouplissez les contraintes dans le quiz ou décochez
          « Seulement avec mon bar ».
        </p>
      )}
    </section>
  );
}
