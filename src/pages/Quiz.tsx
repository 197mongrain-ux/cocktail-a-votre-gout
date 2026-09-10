import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RECIPES } from "../data/recipes";
import { savePreferences } from "../lib/prefs";
import { resolveFavoriteOther } from "../lib/resolveFavorite";
import {
  DEFAULT_PREFERENCES,
  FLAVOR_KEYS,
  type Allergen,
  type FlavorProfile,
  type Mood,
  type Preferences,
  type RecipeBase,
  type Strength,
} from "../types";

const BASES: RecipeBase[] = [
  "vodka",
  "gin",
  "rum",
  "tequila",
  "whiskey",
  "brandy",
  "liqueur",
  "other",
  "none",
];

const BASE_LABELS: Record<RecipeBase, string> = {
  vodka: "vodka",
  gin: "gin",
  rum: "rhum",
  tequila: "tequila / mezcal",
  whiskey: "whiskey / bourbon / rye",
  brandy: "brandy / cognac / pisco",
  liqueur: "liqueur / amaro / aperitivo",
  other: "autre",
  none: "sans spiritueux fort",
};

const ALLERGENS: Allergen[] = ["egg", "dairy", "nut", "gluten"];

const ALLERGEN_LABELS: Record<Allergen, string> = {
  egg: "œuf",
  dairy: "lait",
  nut: "noix",
  gluten: "gluten",
};

const MOOD_LABELS: Record<Mood, string> = {
  classic: "classique",
  adventurous: "aventureux",
};

const FLAVOR_LABELS: Record<keyof FlavorProfile, { left: string; right: string; title: string }> = {
  sweet: { title: "Douceur", left: "Sec", right: "Sucré" },
  sour: { title: "Acidité / agrumes", left: "Faible", right: "Vif" },
  bitter: { title: "Amertume", left: "Douce", right: "Amer" },
  herbal: { title: "Herbacé", left: "Peu", right: "Botanique" },
  smoky: { title: "Fumé", left: "Non", right: "Fumé" },
  creamy: { title: "Crémeux", left: "Léger", right: "Crémeux" },
  fruity: { title: "Fruité", left: "Peu", right: "Fruité" },
  refreshing: { title: "Rafraîchissant", left: "Riche", right: "Vif" },
  spicy: { title: "Épicé", left: "Doux", right: "Épicé" },
};

function toggleIn<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [prefs, setPrefs] = useState<Preferences>({
    ...DEFAULT_PREFERENCES,
    flavor: { ...DEFAULT_PREFERENCES.flavor },
  });
  const [favMode, setFavMode] = useState<"pick" | "other">("pick");
  const [favQuery, setFavQuery] = useState("");
  const [otherText, setOtherText] = useState("");

  const filteredRecipes = useMemo(() => {
    const q = favQuery.trim().toLowerCase();
    const list = [...RECIPES].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return list.slice(0, 40);
    return list.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 40);
  }, [favQuery]);

  const selectedFavorite = prefs.favoriteCocktailId
    ? RECIPES.find((r) => r.id === prefs.favoriteCocktailId)
    : undefined;

  const canLeaveFavorite =
    Boolean(prefs.favoriteCocktailId) ||
    (favMode === "other" && otherText.trim().length > 0);

  function setFlavor(key: keyof FlavorProfile, value: number) {
    setPrefs((p) => ({
      ...p,
      flavor: { ...p.flavor, [key]: value },
    }));
  }

  function finish() {
    let favoriteCocktailId = prefs.favoriteCocktailId;
    let favoriteCocktailOther = "";
    if (favMode === "other") {
      favoriteCocktailOther = otherText.trim();
      const mapped = resolveFavoriteOther(favoriteCocktailOther);
      favoriteCocktailId = mapped;
    }
    const next: Preferences = {
      ...prefs,
      favoriteCocktailId,
      favoriteCocktailOther,
    };
    savePreferences(next);
    navigate("/results");
  }

  const steps = useMemo(
    () => [
      {
        title: "Quel est ton cocktail préféré ?",
        body: (
          <>
            <p className="hint">
              Première étape obligatoire — on s&apos;en sert pour caler le profil
              de saveurs et la base spiritueuse.
            </p>
            <div className="choices" style={{ marginBottom: "0.75rem" }}>
              <button
                type="button"
                className={`choice ${favMode === "pick" ? "selected" : ""}`}
                onClick={() => setFavMode("pick")}
              >
                Choisir dans la liste
              </button>
              <button
                type="button"
                className={`choice ${favMode === "other" ? "selected" : ""}`}
                onClick={() => {
                  setFavMode("other");
                  setPrefs((p) => ({ ...p, favoriteCocktailId: null }));
                }}
              >
                Autre…
              </button>
            </div>
            {favMode === "pick" ? (
              <>
                <div className="field">
                  <label htmlFor="fav-search">Rechercher</label>
                  <input
                    id="fav-search"
                    className="text-input"
                    type="search"
                    placeholder="Negroni, Margarita…"
                    value={favQuery}
                    onChange={(e) => setFavQuery(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                {selectedFavorite && (
                  <p className="hint">
                    Sélection : <strong>{selectedFavorite.name}</strong>
                  </p>
                )}
                <div className="choices scroll-choices">
                  {filteredRecipes.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      className={`choice ${prefs.favoriteCocktailId === r.id ? "selected" : ""}`}
                      onClick={() =>
                        setPrefs((p) => ({
                          ...p,
                          favoriteCocktailId: r.id,
                          favoriteCocktailOther: "",
                        }))
                      }
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="field">
                <label htmlFor="fav-other">Ton cocktail (texte libre)</label>
                <input
                  id="fav-other"
                  className="text-input"
                  type="text"
                  placeholder="Ex. Espresso Martini"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                />
                <p className="hint">
                  Si on le reconnaît dans le catalogue, on l&apos;utilise ; sinon
                  on s&apos;appuie sur tes curseurs de saveurs.
                </p>
              </div>
            )}
          </>
        ),
      },
      {
        title: "Profil de saveurs",
        body: (
          <>
            <p className="hint">
              Ajuste chaque axe (0–5). On compare ça au{" "}
              <code>flavorProfile</code> de chaque recette.
            </p>
            {FLAVOR_KEYS.map((key) => {
              const meta = FLAVOR_LABELS[key];
              return (
                <div className="field" key={key}>
                  <label>
                    {meta.title} ({prefs.flavor[key]})
                  </label>
                  <div className="slider-row">
                    <span>{meta.left}</span>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      value={prefs.flavor[key]}
                      onChange={(e) => setFlavor(key, Number(e.target.value))}
                    />
                    <span>{meta.right}</span>
                  </div>
                </div>
              );
            })}
            <div className="field">
              <label>Force (léger → fort) — {prefs.strength}</label>
              <div className="slider-row">
                <span>Léger</span>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={prefs.strength}
                  onChange={(e) =>
                    setPrefs((p) => ({
                      ...p,
                      strength: Number(e.target.value) as Strength,
                    }))
                  }
                />
                <span>Fort</span>
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Bases spiritueuses",
        body: (
          <>
            <p className="hint">
              Multi-sélection. Laisse vide pour rester ouvert·e.
            </p>
            <div className="choices">
              {BASES.map((b) => (
                <button
                  type="button"
                  key={b}
                  className={`choice ${prefs.bases.includes(b) ? "selected" : ""}`}
                  onClick={() =>
                    setPrefs((p) => ({ ...p, bases: toggleIn(p.bases, b) }))
                  }
                >
                  {BASE_LABELS[b]}
                </button>
              ))}
            </div>
          </>
        ),
      },
      {
        title: "Contraintes",
        body: (
          <>
            <label style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="checkbox"
                checked={prefs.noAlcohol}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, noAlcohol: e.target.checked }))
                }
              />
              Sans alcool (mocktails / zéro alcool seulement)
            </label>
            <label style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              <input
                type="checkbox"
                checked={prefs.vegan}
                onChange={(e) =>
                  setPrefs((p) => ({ ...p, vegan: e.target.checked }))
                }
              />
              Végane (exclure œuf / lait / noix)
            </label>
            <div className="field" style={{ marginTop: "1rem" }}>
              <label>Allergies à éviter</label>
              <div className="choices">
                {ALLERGENS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    className={`choice ${prefs.allergens.includes(a) ? "selected" : ""}`}
                    onClick={() =>
                      setPrefs((p) => ({
                        ...p,
                        allergens: toggleIn(p.allergens, a),
                      }))
                    }
                  >
                    {ALLERGEN_LABELS[a]}
                  </button>
                ))}
              </div>
            </div>
          </>
        ),
      },
      {
        title: "Ce que j'ai sous la main (optionnel)",
        body: (
          <>
            <p className="hint">
              Pour prioriser les recettes faisables et inventer des spécialités
              maison, remplis <strong>Mon bar</strong> (alcools, fruits, épices).
              Tu peux le faire maintenant ou plus tard — ce n&apos;est pas
              obligatoire pour voir les suggestions du quiz.
            </p>
            <div className="btn-row">
              <Link className="btn" to="/pantry">
                Ouvrir Mon bar
              </Link>
            </div>
            <p className="hint" style={{ marginTop: "0.75rem" }}>
              Sur les résultats : mode souple (boost + « 4/5 ingrédients ») ou
              filtre strict « Seulement avec mon bar ».
            </p>
          </>
        ),
      },
      {
        title: "Classique ou aventureux ? (optionnel)",
        body: (
          <>
            <p className="hint">Influence légère sur le classement.</p>
            <div className="choices">
              {(["classic", "adventurous"] as Mood[]).map((mood) => (
                <button
                  type="button"
                  key={mood}
                  className={`choice ${prefs.mood === mood ? "selected" : ""}`}
                  onClick={() => setPrefs((p) => ({ ...p, mood }))}
                >
                  {MOOD_LABELS[mood]}
                </button>
              ))}
            </div>
          </>
        ),
      },
    ],
    [
      prefs,
      favMode,
      favQuery,
      otherText,
      filteredRecipes,
      selectedFavorite,
    ],
  );

  const current = steps[step];
  const nextDisabled = step === 0 && !canLeaveFavorite;

  return (
    <section>
      <h1>Quiz de préférences</h1>
      <p style={{ color: "var(--muted)" }}>
        Étape {step + 1} sur {steps.length}
      </p>
      <div className="card form">
        <h2 style={{ marginTop: 0 }}>{current.title}</h2>
        <div className="field">{current.body}</div>
        <div className="btn-row">
          <button
            type="button"
            className="btn"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Retour
          </button>
          {step < steps.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={nextDisabled}
              onClick={() => setStep((s) => s + 1)}
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled={nextDisabled}
              onClick={finish}
            >
              Voir mes suggestions
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
