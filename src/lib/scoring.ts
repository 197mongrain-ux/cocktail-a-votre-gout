import { getRecipeById } from "../data/recipes";
import type {
  AbvBand,
  Allergen,
  FlavorProfile,
  Preferences,
  RankedRecipe,
  Recipe,
  RecipeBase,
  Strength,
} from "../types";
import { FLAVOR_KEYS } from "../types";
import {
  computeCoverage,
  pantryIsEmpty,
  pantrySoftBoost,
  type PantryFilterMode,
  type PantryState,
  EMPTY_PANTRY,
} from "./pantry";

const STRENGTH_TO_ABV: Record<Strength, AbvBand[]> = {
  1: ["none", "low"],
  2: ["low", "medium"],
  3: ["medium"],
  4: ["medium", "high"],
  5: ["high"],
};

/** Nearby bases for soft matching (favorite / prefs). */
const NEARBY: Record<RecipeBase, RecipeBase[]> = {
  vodka: ["vodka", "gin", "other"],
  gin: ["gin", "vodka", "other"],
  rum: ["rum", "other"],
  tequila: ["tequila", "other"],
  whiskey: ["whiskey", "brandy", "other"],
  brandy: ["brandy", "whiskey", "other"],
  liqueur: ["liqueur", "other", "none"],
  other: ["other", "liqueur"],
  none: ["none", "liqueur"],
};

/** True if recipe conflicts with declared allergens. */
export function hasAllergenConflict(
  recipe: Recipe,
  allergens: Allergen[],
): boolean {
  if (allergens.length === 0) return false;
  return recipe.allergens.some((a) => allergens.includes(a));
}

/** Vegan filter: exclude egg / dairy / nut allergens on the recipe. */
export function failsVegan(recipe: Recipe, vegan: boolean): boolean {
  if (!vegan) return false;
  const nonVegan: Allergen[] = ["egg", "dairy", "nut"];
  return recipe.allergens.some((a) => nonVegan.includes(a));
}

/** No-alcohol: only recipes tagged no-abv or abvBand none. */
export function failsNoAlcohol(recipe: Recipe, noAlcohol: boolean): boolean {
  if (!noAlcohol) return false;
  return recipe.abvBand !== "none" && !recipe.tags.includes("no-abv");
}

/** Manhattan / L1 distance across flavor axes (0 = identical). */
export function profileDistance(a: FlavorProfile, b: FlavorProfile): number {
  let sum = 0;
  for (const k of FLAVOR_KEYS) {
    sum += Math.abs((a[k] ?? 0) - (b[k] ?? 0));
  }
  return sum;
}

/** Max theoretical L1 distance (9 axes × 5). */
export const MAX_PROFILE_DISTANCE = FLAVOR_KEYS.length * 5;

/** Similarity score 0–maxPts from profile distance. */
export function profileSimilarityPts(
  a: FlavorProfile,
  b: FlavorProfile,
  maxPts: number,
): number {
  const d = profileDistance(a, b);
  const sim = 1 - d / MAX_PROFILE_DISTANCE;
  return Math.round(sim * maxPts);
}

function baseMatchPts(recipeBase: RecipeBase, wanted: RecipeBase[]): number {
  if (wanted.length === 0) return 6;
  if (wanted.includes(recipeBase)) return 18;
  const near = wanted.some((w) => (NEARBY[w] ?? []).includes(recipeBase));
  if (near) return 8;
  return -6;
}

function favoriteBasePts(recipe: Recipe, favorite: Recipe | undefined): number {
  if (!favorite) return 0;
  if (recipe.base === favorite.base) return 22;
  if ((NEARBY[favorite.base] ?? []).includes(recipe.base)) return 10;
  return 0;
}

function moodScore(recipe: Recipe, mood: Preferences["mood"]): number {
  if (mood === "classic" && recipe.category === "classic") return 8;
  if (mood === "adventurous" && recipe.category === "specialty") return 8;
  if (mood === "classic" && recipe.category === "specialty") return -2;
  if (mood === "adventurous" && recipe.category === "classic") return 2;
  return 0;
}

function ingredientBonus(recipe: Recipe, available: string[]): number {
  if (available.length === 0) return 0;
  const hay = recipe.ingredients.join(" ").toLowerCase();
  let hits = 0;
  for (const item of available) {
    const q = item.trim().toLowerCase();
    if (q && hay.includes(q)) hits += 1;
  }
  return Math.min(hits * 3, 12);
}

function buildReasons(
  recipe: Recipe,
  prefs: Preferences,
  favorite: Recipe | undefined,
  parts: { label: string; pts: number }[],
  coverageLabel?: string,
): string[] {
  const reasons: string[] = [];

  if (favorite && recipe.id === favorite.id) {
    reasons.push(`C'est ton cocktail préféré — ${favorite.name}`);
  } else if (favorite) {
    const favDist = profileDistance(recipe.flavorProfile, favorite.flavorProfile);
    if (favDist <= 12 || recipe.base === favorite.base) {
      reasons.push(`Dans la lignée de ton ${favorite.name}`);
    }
  }

  if (coverageLabel) {
    reasons.push(`Couverture du bar : ${coverageLabel}`);
  }

  if (prefs.noAlcohol && recipe.abvBand === "none") {
    reasons.push("Sans alcool — respecte ta préférence");
  }

  if (prefs.bases.length > 0 && prefs.bases.includes(recipe.base)) {
    reasons.push(`Base ${recipe.base} que tu as choisie`);
  }

  const sorted = [...parts].sort((a, b) => b.pts - a.pts);
  for (const p of sorted) {
    if (p.pts <= 0) continue;
    reasons.push(p.label);
    if (reasons.length >= 3) break;
  }

  return [...new Set(reasons)].slice(0, 3);
}

export interface ScoreOptions {
  pantry?: PantryState;
  pantryMode?: PantryFilterMode;
}

/**
 * Score a single recipe. Returns null if filtered out
 * (allergens / vegan / no-alcohol / hard pantry).
 */
export function scoreRecipe(
  recipe: Recipe,
  prefs: Preferences,
  options: ScoreOptions = {},
): RankedRecipe | null {
  if (hasAllergenConflict(recipe, prefs.allergens)) return null;
  if (failsVegan(recipe, prefs.vegan)) return null;
  if (failsNoAlcohol(recipe, prefs.noAlcohol)) return null;

  const pantry = options.pantry ?? EMPTY_PANTRY;
  const pantryMode = options.pantryMode ?? "soft";
  const empty = pantryIsEmpty(pantry);
  let coverage = empty
    ? undefined
    : computeCoverage(recipe, pantry);

  if (!empty && pantryMode === "hard" && coverage && coverage.missing.length > 0) {
    return null;
  }

  const favorite = prefs.favoriteCocktailId
    ? getRecipeById(prefs.favoriteCocktailId)
    : undefined;

  // Heavy weight: similarity to favorite flavor + same/nearby base
  let favoritePts = 0;
  if (favorite) {
    if (recipe.id === favorite.id) {
      favoritePts = 40;
    } else {
      favoritePts =
        profileSimilarityPts(
          recipe.flavorProfile,
          favorite.flavorProfile,
          32,
        ) + favoriteBasePts(recipe, favorite);
    }
  }

  const flavorPts = profileSimilarityPts(
    recipe.flavorProfile,
    prefs.flavor,
    28,
  );
  const basePts = prefs.noAlcohol ? 0 : baseMatchPts(recipe.base, prefs.bases);
  const abvWanted = STRENGTH_TO_ABV[prefs.strength];
  const abvPts = abvWanted.includes(recipe.abvBand) ? 10 : -4;
  const moodPts = moodScore(recipe, prefs.mood);
  const ingPts = ingredientBonus(recipe, prefs.availableIngredients);
  const pantryPts =
    !empty && pantryMode !== "off" && coverage
      ? pantrySoftBoost(coverage, false)
      : 0;

  let score =
    15 +
    favoritePts +
    flavorPts +
    basePts +
    abvPts +
    moodPts +
    ingPts +
    pantryPts;

  if (prefs.strength <= 2 && recipe.tags.includes("low-abv")) score += 4;
  if (prefs.flavor.refreshing >= 4 && recipe.flavorProfile.refreshing >= 4) {
    score += 3;
  }

  const parts = [
    {
      label: "Profil de saveurs proche de tes curseurs",
      pts: flavorPts - 10,
    },
    {
      label:
        abvPts > 0
          ? `La force (${recipe.abvBand}) correspond`
          : "Force différente de celle souhaitée",
      pts: abvPts,
    },
    {
      label:
        prefs.mood === "classic"
          ? "Énergie cocktail classique"
          : "Choix aventureux / spécialité",
      pts: moodPts,
    },
    {
      label: "Utilise des ingrédients que tu as indiqués",
      pts: ingPts,
    },
    {
      label: "Bien couvert par ton bar",
      pts: pantryPts,
    },
  ];

  return {
    recipe,
    score,
    reasons: buildReasons(
      recipe,
      prefs,
      favorite,
      parts,
      coverage && !empty ? coverage.label : undefined,
    ),
    pantryCoverage: coverage,
  };
}

/** Rank all recipes; highest score first. */
export function rankRecipes(
  recipes: Recipe[],
  prefs: Preferences,
  options: ScoreOptions = {},
): RankedRecipe[] {
  const ranked: RankedRecipe[] = [];
  for (const recipe of recipes) {
    const r = scoreRecipe(recipe, prefs, options);
    if (r) ranked.push(r);
  }
  ranked.sort(
    (a, b) =>
      b.score - a.score || a.recipe.name.localeCompare(b.recipe.name),
  );
  return ranked;
}

export function topMatches(
  recipes: Recipe[],
  prefs: Preferences,
  limit = 8,
  options: ScoreOptions = {},
): RankedRecipe[] {
  return rankRecipes(recipes, prefs, options).slice(0, limit);
}
