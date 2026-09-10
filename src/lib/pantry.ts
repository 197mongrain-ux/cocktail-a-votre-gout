/**
 * Pantry (« Mon bar ») — persistence, normalize matching, coverage scoring.
 */

import { ALL_PANTRY_ITEMS, type PantryGroup, type PantryItem } from "../data/pantryCatalog";
import type { Recipe } from "../types";

export const PANTRY_STORAGE_KEY = "pantry-v1";

/** Free staples that never count as missing. */
export const STAPLES = [
  "glace",
  "ice",
  "eau",
  "water",
  "sucre",
  "sugar",
  "sugar cube",
  "sel",
  "salt",
  "soda water",
  "soda",
  "eau gazeuse",
  "sparkling water",
  "club soda",
] as const;

export interface PantryState {
  alcools: string[];
  fruits: string[];
  epices: string[];
  autres: string[];
  /** Free-text custom items (any group). */
  custom: string[];
}

export const EMPTY_PANTRY: PantryState = {
  alcools: [],
  fruits: [],
  epices: [],
  autres: [],
  custom: [],
};

export type PantryFilterMode = "off" | "soft" | "hard";

export interface PantryCoverage {
  matched: number;
  total: number;
  /** 0–1 */
  ratio: number;
  missing: string[];
  /** French display e.g. « 4/5 ingrédients » */
  label: string;
}

/** Strip accents + lowercase + collapse spaces. */
export function normalizeToken(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Alias map: normalized key → preferred pantry token (also normalized). */
const ALIASES: Record<string, string[]> = {
  lime: ["citron vert", "lime"],
  "citron vert": ["citron vert", "lime"],
  lemon: ["citron", "lemon"],
  citron: ["citron", "lemon"],
  whiskey: ["whiskey", "whisky", "bourbon", "rye"],
  whisky: ["whiskey", "whisky", "bourbon", "rye"],
  bourbon: ["bourbon", "whiskey", "whisky"],
  rum: ["rum", "rhum"],
  rhum: ["rum", "rhum"],
  "simple syrup": ["simple syrup", "sirop simple", "sucre"],
  "sirop simple": ["simple syrup", "sirop simple", "sucre"],
  mint: ["mint", "menthe"],
  menthe: ["mint", "menthe"],
  ginger: ["ginger", "gingembre"],
  gingembre: ["ginger", "gingembre"],
  cinnamon: ["cinnamon", "cannelle"],
  cannelle: ["cinnamon", "cannelle"],
};

const STAPLE_SET = new Set(STAPLES.map(normalizeToken));

function expandAliases(norm: string): string[] {
  const extra = ALIASES[norm] ?? [];
  return [norm, ...extra.map(normalizeToken)];
}

/** True if ingredient line is only a staple (ice/water/sugar/salt/soda). */
export function isStapleIngredient(ingredient: string): boolean {
  const n = normalizeToken(ingredient);
  if (!n) return true;
  // strip quantity prefixes roughly
  const stripped = n
    .replace(/^\d+([./]\d+)?\s*(oz|ml|cl|dash|dashes|cube|cubes)?\s*/i, "")
    .trim();
  const candidates = [n, stripped].filter(Boolean);
  for (const c of candidates) {
    if (STAPLE_SET.has(c)) return true;
    for (const st of STAPLE_SET) {
      if (c === st || c.startsWith(st + " ") || c.endsWith(" " + st) || c.includes(" " + st + " ")) {
        // avoid matching "sugar syrup" as pure staple when it's a named syrup — still OK as staple sugar
        if (st === "sugar" || st === "sucre") {
          if (c.includes("syrup") || c.includes("sirop")) {
            // demerara / flavored syrups are NOT free staples unless simple
            if (c.includes("simple") || c === "simple syrup" || c === "sirop simple") {
              return true; // treat simple syrup as staple-adjacent via sugar
            }
            continue;
          }
        }
        // "splash of water", "ice", etc.
        if (c.split(" ").includes(st) || c === st) return true;
      }
    }
  }
  // common staple phrases
  if (/\b(ice|glace|water|eau|salt|sel|soda water|club soda)\b/.test(n)) {
    // exclude tonic / ginger beer
    if (n.includes("tonic") || n.includes("ginger")) return false;
    // sugar cube counts as staple
    if (n.includes("sugar") || n.includes("sucre")) return true;
    if (/\b(ice|glace|water|eau|salt|sel|soda water|club soda|soda)\b/.test(n) && !n.includes("tonic")) {
      // pure-ish
      const withoutQty = stripped;
      if (
        withoutQty === "ice" ||
        withoutQty === "glace" ||
        withoutQty === "water" ||
        withoutQty === "eau" ||
        withoutQty === "salt" ||
        withoutQty === "sel" ||
        withoutQty === "soda water" ||
        withoutQty === "soda" ||
        withoutQty === "club soda" ||
        withoutQty === "eau gazeuse" ||
        withoutQty.includes("splash of water") ||
        withoutQty.startsWith("ice ") ||
        n === "optional salt for rim" ||
        n.includes("salt for rim")
      ) {
        return true;
      }
    }
  }
  if (n.includes("salt for rim") || n.includes("sel pour le bord")) return true;
  if (n === "sugar cube" || n.includes("sugar cube")) return true;
  return false;
}

/** Collect all normalized tokens from pantry state (catalog ids + custom). */
export function pantryTokens(state: PantryState): Set<string> {
  const out = new Set<string>();
  const groups: PantryGroup[] = ["alcools", "fruits", "epices", "autres"];
  for (const g of groups) {
    for (const id of state[g]) {
      const item = ALL_PANTRY_ITEMS.find((p) => p.id === id && p.group === g);
      if (item) {
        for (const t of item.tokens) {
          for (const a of expandAliases(normalizeToken(t))) out.add(a);
        }
        out.add(normalizeToken(item.label));
      } else {
        // id used as free label
        for (const a of expandAliases(normalizeToken(id))) out.add(a);
      }
    }
  }
  for (const c of state.custom) {
    const n = normalizeToken(c);
    if (!n) continue;
    for (const a of expandAliases(n)) out.add(a);
  }
  return out;
}

export function pantryIsEmpty(state: PantryState): boolean {
  return (
    state.alcools.length === 0 &&
    state.fruits.length === 0 &&
    state.epices.length === 0 &&
    state.autres.length === 0 &&
    state.custom.length === 0
  );
}

export function pantryHasSpirit(state: PantryState): boolean {
  return state.alcools.length > 0;
}

export function pantryHasFruitOrSpice(state: PantryState): boolean {
  return state.fruits.length > 0 || state.epices.length > 0;
}

/** Does pantry cover this ingredient line? */
export function ingredientCovered(
  ingredient: string,
  tokens: Set<string>,
): boolean {
  if (isStapleIngredient(ingredient)) return true;
  const n = normalizeToken(ingredient);
  if (!n) return true;

  // Check each pantry token as substring of ingredient (or vice versa for short tokens)
  for (const t of tokens) {
    if (!t) continue;
    if (n.includes(t) || t.includes(n)) return true;
    // word-boundary-ish: token appears as whole words
    const parts = n.split(" ");
    if (parts.includes(t)) return true;
  }

  // Also try alias expansion on significant words in the ingredient
  for (const word of n.split(" ")) {
    if (word.length < 3) continue;
    for (const a of expandAliases(word)) {
      if (tokens.has(a)) return true;
      for (const t of tokens) {
        if (t.includes(a) || a.includes(t)) return true;
      }
    }
  }
  return false;
}

/** Coverage of recipe ingredients by pantry (staples ignored in total). */
export function computeCoverage(
  recipe: Recipe,
  state: PantryState,
): PantryCoverage {
  const tokens = pantryTokens(state);
  const key = recipe.ingredients.filter((i) => !isStapleIngredient(i));
  if (key.length === 0) {
    return {
      matched: 0,
      total: 0,
      ratio: 1,
      missing: [],
      label: "0/0 ingrédients",
    };
  }
  const missing: string[] = [];
  let matched = 0;
  for (const ing of key) {
    if (ingredientCovered(ing, tokens)) matched += 1;
    else missing.push(ing);
  }
  const ratio = matched / key.length;
  return {
    matched,
    total: key.length,
    ratio,
    missing,
    label: `${matched}/${key.length} ingrédients`,
  };
}

/** Soft boost points (0–18) from coverage ratio when pantry non-empty. */
export function pantrySoftBoost(coverage: PantryCoverage, pantryEmpty: boolean): number {
  if (pantryEmpty) return 0;
  if (coverage.total === 0) return 6;
  return Math.round(coverage.ratio * 18);
}

export function loadPantry(): PantryState {
  try {
    const raw = localStorage.getItem(PANTRY_STORAGE_KEY);
    if (!raw) return { ...EMPTY_PANTRY };
    const parsed = JSON.parse(raw) as Partial<PantryState>;
    return {
      alcools: parsed.alcools ?? [],
      fruits: parsed.fruits ?? [],
      epices: parsed.epices ?? [],
      autres: parsed.autres ?? [],
      custom: parsed.custom ?? [],
    };
  } catch {
    return { ...EMPTY_PANTRY };
  }
}

export function savePantry(state: PantryState): void {
  localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(state));
}

export function togglePantryItem(
  state: PantryState,
  group: PantryGroup,
  id: string,
): PantryState {
  const list = state[group];
  const next = list.includes(id)
    ? list.filter((x) => x !== id)
    : [...list, id];
  return { ...state, [group]: next };
}

export function addCustomItem(state: PantryState, label: string): PantryState {
  const t = label.trim();
  if (!t) return state;
  if (state.custom.some((c) => normalizeToken(c) === normalizeToken(t))) {
    return state;
  }
  return { ...state, custom: [...state.custom, t] };
}

export function removeCustomItem(state: PantryState, label: string): PantryState {
  return {
    ...state,
    custom: state.custom.filter((c) => c !== label),
  };
}

export function findCatalogItem(id: string): PantryItem | undefined {
  return ALL_PANTRY_ITEMS.find((p) => p.id === id);
}

/** Resolve display labels for selected pantry. */
export function selectedLabels(state: PantryState): string[] {
  const labels: string[] = [];
  for (const g of ["alcools", "fruits", "epices", "autres"] as PantryGroup[]) {
    for (const id of state[g]) {
      labels.push(findCatalogItem(id)?.label ?? id);
    }
  }
  labels.push(...state.custom);
  return labels;
}
