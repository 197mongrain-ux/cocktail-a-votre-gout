import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  GROUP_LABELS,
  PANTRY_ALCOOLS,
  PANTRY_AUTRES,
  PANTRY_EPICES,
  PANTRY_FRUITS,
  type PantryGroup,
  type PantryItem,
} from "../data/pantryCatalog";
import {
  addCustomItem,
  EMPTY_PANTRY,
  loadPantry,
  removeCustomItem,
  savePantry,
  selectedLabels,
  togglePantryItem,
  type PantryState,
} from "../lib/pantry";
import {
  canGenerateSpecialties,
  generateSpecialties,
} from "../lib/specialties";
import { loadPreferences } from "../lib/prefs";
import { RecipeCard } from "../components/RecipeCard";

const GROUPS: { key: PantryGroup; items: PantryItem[] }[] = [
  { key: "alcools", items: PANTRY_ALCOOLS },
  { key: "fruits", items: PANTRY_FRUITS },
  { key: "epices", items: PANTRY_EPICES },
  { key: "autres", items: PANTRY_AUTRES },
];

export function Pantry() {
  const [state, setState] = useState<PantryState>(() => loadPantry());
  const [customText, setCustomText] = useState("");
  const prefs = loadPreferences();

  function persist(next: PantryState) {
    setState(next);
    savePantry(next);
  }

  const labels = useMemo(() => selectedLabels(state), [state]);
  const guard = canGenerateSpecialties(state);
  const specialties = useMemo(() => {
    if (!guard.ok) return [];
    return generateSpecialties(state, prefs, 6);
  }, [state, prefs, guard.ok]);

  return (
    <section>
      <h1>Mon bar</h1>
      <p style={{ color: "var(--muted)" }}>
        Ce que j&apos;ai sous la main — alcools, fruits, épices et mixeurs.
        On s&apos;en sert pour classer le catalogue et inventer des{" "}
        <strong>spécialités maison</strong>. Les puces dorées ★ marquent des{" "}
        <strong>produits vedettes</strong> québécois (Gin Ungava, Vermouth
        Kayak, camerise…). Sauvegardé dans <code>localStorage</code> (
        <code>pantry-v1</code>).
      </p>

      {GROUPS.map(({ key, items }) => (
        <div className="card form" key={key} style={{ marginBottom: "1rem" }}>
          <h2 style={{ marginTop: 0 }}>{GROUP_LABELS[key]}</h2>
          <div className="choices">
            {items.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`choice ${state[key].includes(item.id) ? "selected" : ""} ${item.featuredQc ? "featured-qc" : ""}`}
                onClick={() => persist(togglePantryItem(state, key, item.id))}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="card form" style={{ marginBottom: "1rem" }}>
        <h2 style={{ marginTop: 0 }}>Ajout libre</h2>
        <p className="hint">
          Un ingrédient qui n&apos;est pas dans la liste ? Ajoute-le ici.
        </p>
        <div className="btn-row">
          <input
            className="text-input"
            style={{ flex: 1, minWidth: "12rem" }}
            type="text"
            placeholder="Ex. sirop d'érable, yuzu…"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!customText.trim()) return;
                persist(addCustomItem(state, customText));
                setCustomText("");
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!customText.trim()) return;
              persist(addCustomItem(state, customText));
              setCustomText("");
            }}
          >
            Ajouter
          </button>
        </div>
        {state.custom.length > 0 && (
          <div className="choices" style={{ marginTop: "0.75rem" }}>
            {state.custom.map((c) => (
              <button
                type="button"
                key={c}
                className="choice selected"
                onClick={() => persist(removeCustomItem(state, c))}
                title="Retirer"
              >
                {c} ×
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="btn-row" style={{ marginBottom: "1.5rem" }}>
        <button
          type="button"
          className="btn"
          onClick={() => persist({ ...EMPTY_PANTRY })}
        >
          Vider mon bar
        </button>
        <Link className="btn btn-primary" to="/results">
          Voir les suggestions
        </Link>
        <Link className="btn" to="/quiz">
          Quiz
        </Link>
      </div>

      <p className="hint">
        Sélection actuelle ({labels.length}) :{" "}
        {labels.length === 0 ? "rien pour l'instant" : labels.join(", ")}
      </p>

      <h2>Spécialités maison</h2>
      {!guard.ok ? (
        <p className="alert">{guard.message}</p>
      ) : (
        <>
          <p style={{ color: "var(--muted)" }}>
            Créations originales à partir de ton inventaire (pas seulement le
            catalogue). Marquées comme spécialités « créées pour ton bar ».
          </p>
          <div className="card-grid">
            {specialties.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
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
    </section>
  );
}
