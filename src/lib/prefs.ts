import {
  DEFAULT_FLAVOR,
  DEFAULT_PREFERENCES,
  PREFS_STORAGE_KEY,
  type Preferences,
} from "../types";

export function loadPreferences(): Preferences | null {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Preferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      flavor: { ...DEFAULT_FLAVOR, ...(parsed.flavor ?? {}) },
      bases: parsed.bases ?? [],
      spirits: parsed.spirits ?? [],
      allergens: parsed.allergens ?? [],
      availableIngredients: parsed.availableIngredients ?? [],
      favoriteCocktailId: parsed.favoriteCocktailId ?? null,
      favoriteCocktailOther: parsed.favoriteCocktailOther ?? "",
    };
  } catch {
    return null;
  }
}

export function savePreferences(prefs: Preferences): void {
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(prefs));
}
