/** Cocktail recipe + preference types for the web MVP. */

export type RecipeCategory = "classic" | "specialty";

export type RecipeTag =
  | "sweet"
  | "dry"
  | "citrus"
  | "bitter"
  | "herbal"
  | "creamy"
  | "spicy"
  | "fruity"
  | "smoky"
  | "refreshing"
  | "low-abv"
  | "no-abv"
  | "saq"
  | "vedette";

export type Allergen = "egg" | "dairy" | "nut" | "gluten";

/** Display / multi-spirit tags (kept for UI detail). */
export type Spirit =
  | "whiskey"
  | "bourbon"
  | "rye"
  | "gin"
  | "vodka"
  | "rum"
  | "tequila"
  | "mezcal"
  | "brandy"
  | "cognac"
  | "none";

/** Primary base used by quiz + scoring. */
export type RecipeBase =
  | "vodka"
  | "gin"
  | "rum"
  | "tequila"
  | "whiskey"
  | "brandy"
  | "liqueur"
  | "other"
  | "none";

export type AbvBand = "none" | "low" | "medium" | "high";

/** Each axis 0–5 (0 = absent, 5 = dominant). */
export interface FlavorProfile {
  sweet: number;
  sour: number;
  bitter: number;
  spicy: number;
  herbal: number;
  smoky: number;
  creamy: number;
  fruity: number;
  refreshing: number;
}

export const FLAVOR_KEYS: (keyof FlavorProfile)[] = [
  "sweet",
  "sour",
  "bitter",
  "spicy",
  "herbal",
  "smoky",
  "creamy",
  "fruity",
  "refreshing",
];

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  /** Primary spirit base for scoring. */
  base: RecipeBase;
  spirits: Spirit[];
  ingredients: string[];
  steps: string[];
  tags: RecipeTag[];
  allergens: Allergen[];
  abvBand: AbvBand;
  garnish: string;
  description: string;
  flavorProfile: FlavorProfile;
  /** Québec / SAQ-inspired featured suggestion. */
  featuredQc?: boolean;
  /** Provenance tip for UI filters (public inspiration only). */
  source?: "saq-inspire";
}

export type Strength = 1 | 2 | 3 | 4 | 5; // light → strong
export type Mood = "classic" | "adventurous";

/** User flavor prefs mirror recipe axes (0–5). */
export type UserFlavorPrefs = FlavorProfile;

export interface Preferences {
  /** Recipe id from catalog, or null if skipped / unknown “autre”. */
  favoriteCocktailId: string | null;
  /** Free-text when user picks “autre”. */
  favoriteCocktailOther: string;
  flavor: UserFlavorPrefs;
  strength: Strength;
  /** Preferred bases (multi). Empty = open. */
  bases: RecipeBase[];
  /** Legacy spirit chips still accepted by scoring as soft signal. */
  spirits: Spirit[];
  noAlcohol: boolean;
  vegan: boolean;
  allergens: Allergen[];
  mood: Mood;
  availableIngredients: string[];
}

export interface RankedRecipe {
  recipe: Recipe;
  score: number;
  reasons: string[];
  /** Present when pantry is non-empty and scoring computed coverage. */
  pantryCoverage?: {
    matched: number;
    total: number;
    ratio: number;
    missing: string[];
    label: string;
  };
}

export const DEFAULT_FLAVOR: FlavorProfile = {
  sweet: 2,
  sour: 2,
  bitter: 1,
  spicy: 1,
  herbal: 1,
  smoky: 0,
  creamy: 0,
  fruity: 2,
  refreshing: 3,
};

export const DEFAULT_PREFERENCES: Preferences = {
  favoriteCocktailId: null,
  favoriteCocktailOther: "",
  flavor: { ...DEFAULT_FLAVOR },
  strength: 3,
  bases: [],
  spirits: [],
  noAlcohol: false,
  vegan: false,
  allergens: [],
  mood: "classic",
  availableIngredients: [],
};

export const PREFS_STORAGE_KEY = "cocktail-prefs-v2";
export const FAVORITES_STORAGE_KEY = "cocktail-favorites-v1";

/** True when recipe is part of SAQ / produits vedettes suggestions. */
export function isSaqFeatured(recipe: Recipe): boolean {
  return Boolean(
    recipe.featuredQc ||
      recipe.source === "saq-inspire" ||
      recipe.tags.includes("saq") ||
      recipe.tags.includes("vedette"),
  );
}
