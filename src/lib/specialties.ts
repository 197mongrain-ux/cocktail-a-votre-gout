/**
 * Heuristic « Spécialités maison » generator from pantry inventory.
 * No external API — templates only.
 */

import {
  ALL_PANTRY_ITEMS,
  type PantryGroup,
  type PantryItem,
} from "../data/pantryCatalog";
import type { FlavorProfile, Preferences, Recipe, RecipeBase, Spirit } from "../types";
import { DEFAULT_FLAVOR } from "../types";
import {
  findCatalogItem,
  pantryHasFruitOrSpice,
  pantryHasSpirit,
  type PantryState,
} from "./pantry";

const SPECIALTY_CACHE_KEY = "specialty-cache-v1";

export interface SpecialtyGuard {
  ok: boolean;
  message?: string;
}

export function canGenerateSpecialties(state: PantryState): SpecialtyGuard {
  if (!pantryHasSpirit(state)) {
    return {
      ok: false,
      message:
        "Ajoute au moins un alcool (spiritueux ou liqueur) dans Mon bar pour générer des spécialités maison.",
    };
  }
  if (!pantryHasFruitOrSpice(state)) {
    return {
      ok: false,
      message:
        "Ajoute au moins un fruit ou une épice / aromate pour composer des spécialités maison.",
    };
  }
  return { ok: true };
}

function itemsInGroup(state: PantryState, group: PantryGroup): PantryItem[] {
  return state[group]
    .map((id) => findCatalogItem(id) ?? ({
      id,
      label: id,
      tokens: [id],
      group,
    }))
    .filter(Boolean) as PantryItem[];
}

function customAsItems(state: PantryState, group: PantryGroup): PantryItem[] {
  // Customs are untyped; lightly treat them as fruits/epices for variety
  return state.custom.map((c, i) => ({
    id: `custom-${group}-${i}`,
    label: c,
    tokens: [c],
    group,
  }));
}

const SPIRIT_TO_BASE: Record<string, RecipeBase> = {
  vodka: "vodka",
  gin: "gin",
  "rhum-blanc": "rum",
  "rhum-vieux": "rum",
  tequila: "tequila",
  mezcal: "tequila",
  bourbon: "whiskey",
  rye: "whiskey",
  scotch: "whiskey",
  cognac: "brandy",
  pisco: "brandy",
  campari: "liqueur",
  aperol: "liqueur",
  "vermouth-doux": "liqueur",
  "vermouth-sec": "liqueur",
  cointreau: "liqueur",
  amaretto: "liqueur",
  "coffee-liqueur": "liqueur",
  champagne: "other",
  amaro: "liqueur",
};

const SPIRIT_TO_SPIRIT: Record<string, Spirit> = {
  vodka: "vodka",
  gin: "gin",
  "rhum-blanc": "rum",
  "rhum-vieux": "rum",
  tequila: "tequila",
  mezcal: "mezcal",
  bourbon: "bourbon",
  rye: "rye",
  scotch: "whiskey",
  cognac: "cognac",
  pisco: "brandy",
};

interface Template {
  /** French name pattern; {spirit} {fruit} {spice} */
  name: (a: string, b: string, c?: string) => string;
  story: (a: string, b: string, c?: string) => string;
  ingredients: (spirit: PantryItem, fruit: PantryItem, spice?: PantryItem, liqueur?: PantryItem) => string[];
  steps: string[];
  flavor: (fruit: PantryItem, spice?: PantryItem) => FlavorProfile;
  tags: Recipe["tags"];
  abvBand: Recipe["abvBand"];
}

const TEMPLATES: Template[] = [
  {
    name: (s, f, sp) =>
      sp ? `${s} ${f} & ${sp}` : `Éclat de ${f} au ${s}`,
    story: (s, f, sp) =>
      sp
        ? `Créé pour ton bar : ${s.toLowerCase()}, ${f.toLowerCase()} et une touche de ${sp.toLowerCase()}.`
        : `Créé pour ton bar : un sour vif autour du ${s.toLowerCase()} et du ${f.toLowerCase()}.`,
    ingredients: (spirit, fruit, spice, liqueur) => {
      const list = [
        `2 oz ${spirit.label}`,
        `1 oz jus de ${fruit.label}`,
        "0.75 oz sirop simple",
      ];
      if (liqueur) list.push(`0.5 oz ${liqueur.label}`);
      if (spice) list.push(`quelques ${spice.label.toLowerCase()} (au goût)`);
      list.push("Glace");
      return list;
    },
    steps: [
      "Secoue tous les liquides avec de la glace.",
      "Double-filtre dans un verre froid.",
      "Garnis avec un peu de fruit ou d'aromate du bar.",
    ],
    flavor: (_fruit, spice) => ({
      ...DEFAULT_FLAVOR,
      sour: 4,
      sweet: 3,
      fruity: 4,
      refreshing: 4,
      spicy: spice ? 3 : 1,
      herbal: spice && /menthe|basilic|romarin|thym/i.test(spice.label) ? 3 : 1,
    }),
    tags: ["citrus", "fruity", "refreshing"],
    abvBand: "medium",
  },
  {
    name: (s, f, sp) =>
      sp ? `Maison ${s}–${sp}` : `Highball ${s} ${f}`,
    story: (s, f, sp) =>
      `Créé pour ton bar : version allégée et pétillante avec ${s.toLowerCase()} et ${f.toLowerCase()}${sp ? `, parfum ${sp.toLowerCase()}` : ""}.`,
    ingredients: (spirit, fruit, spice) => {
      const list = [
        `1.5 oz ${spirit.label}`,
        `0.75 oz jus de ${fruit.label}`,
        "Soda water",
        "Glace",
      ];
      if (spice) list.push(`${spice.label} pour garnir`);
      return list;
    },
    steps: [
      "Remplis un highball de glace.",
      "Ajoute le spiritueux et le jus ; complète au soda.",
      "Remue doucement ; garnis.",
    ],
    flavor: (_fruit, spice) => ({
      ...DEFAULT_FLAVOR,
      sweet: 2,
      sour: 3,
      fruity: 3,
      refreshing: 5,
      herbal: spice ? 3 : 1,
      spicy: spice && /piment|gingembre/i.test(spice.label) ? 3 : 0,
    }),
    tags: ["refreshing", "low-abv", "fruity"],
    abvBand: "low",
  },
  {
    name: (s, f) => `Old Fashioned ${f} (${s})`,
    story: (s, f) =>
      `Créé pour ton bar : esprit old fashioned, fruité avec ${f.toLowerCase()} et ${s.toLowerCase()}.`,
    ingredients: (spirit, fruit, spice) => {
      const list = [
        `2 oz ${spirit.label}`,
        "1/4 oz sirop simple",
        `zeste ou trait de ${fruit.label}`,
        "Glace",
      ];
      if (spice) list.push(`pincée de ${spice.label.toLowerCase()}`);
      return list;
    },
    steps: [
      "Remue spiritueux, sirop et glace jusqu'à bien froid.",
      "Filtre sur un gros glaçon.",
      "Exprime le zeste / ajoute le fruit ; aromates au goût.",
    ],
    flavor: (_fruit, spice) => ({
      ...DEFAULT_FLAVOR,
      sweet: 2,
      bitter: 2,
      fruity: 3,
      spicy: spice ? 2 : 1,
      smoky: 1,
      refreshing: 1,
    }),
    tags: ["dry", "fruity"],
    abvBand: "high",
  },
  {
    name: (s, f, sp) =>
      sp ? `Smash ${s} ${f}–${sp}` : `Smash ${s} ${f}`,
    story: (s, f, sp) =>
      `Créé pour ton bar : smash écrasé — ${f.toLowerCase()}${sp ? ` et ${sp.toLowerCase()}` : ""} sur ${s.toLowerCase()}.`,
    ingredients: (spirit, fruit, spice) => {
      const list = [
        `2 oz ${spirit.label}`,
        `${fruit.label} (écrasé)`,
        "0.75 oz sirop simple",
        "0.75 oz jus d'agrume (citron ou citron vert si dispo)",
        "Glace",
      ];
      if (spice) list.push(`${spice.label} (légèrement écrasé)`);
      return list;
    },
    steps: [
      "Écrase doucement le fruit (et l'aromate) avec le sirop.",
      "Ajoute spiritueux, jus et glace ; secoue.",
      "Verse tout dans un rocks ; ajuste au goût.",
    ],
    flavor: (_fruit, spice) => ({
      ...DEFAULT_FLAVOR,
      sweet: 3,
      sour: 3,
      fruity: 5,
      refreshing: 4,
      herbal: spice && /menthe|basilic/i.test(spice.label) ? 4 : 1,
      spicy: spice && /piment|gingembre/i.test(spice.label) ? 3 : 0,
    }),
    tags: ["fruity", "sweet", "refreshing"],
    abvBand: "medium",
  },
];

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function profileDistance(a: FlavorProfile, b: FlavorProfile): number {
  let sum = 0;
  for (const k of Object.keys(a) as (keyof FlavorProfile)[]) {
    sum += Math.abs((a[k] ?? 0) - (b[k] ?? 0));
  }
  return sum;
}

function leanFlavor(
  base: FlavorProfile,
  target: FlavorProfile | undefined,
): FlavorProfile {
  if (!target) return base;
  const out = { ...base };
  for (const k of Object.keys(base) as (keyof FlavorProfile)[]) {
    // nudge 30% toward user / favorite prefs
    out[k] = Math.round(base[k] * 0.7 + target[k] * 0.3);
    out[k] = Math.max(0, Math.min(5, out[k]));
  }
  return out;
}

/**
 * Generate 3–8 house specialties from pantry.
 * Returns [] if pantry too empty (caller should show guard message).
 */
export function generateSpecialties(
  state: PantryState,
  prefs?: Preferences | null,
  limit = 6,
): Recipe[] {
  const guard = canGenerateSpecialties(state);
  if (!guard.ok) return [];

  const spirits = itemsInGroup(state, "alcools");
  const fruits = [
    ...itemsInGroup(state, "fruits"),
    ...customAsItems(state, "fruits").slice(0, 2),
  ];
  const spices = [
    ...itemsInGroup(state, "epices"),
    ...customAsItems(state, "epices").slice(0, 1),
  ];
  const liqueurs = spirits.filter((s) =>
    ["campari", "aperol", "cointreau", "amaretto", "coffee-liqueur", "amaro", "vermouth-doux", "vermouth-sec"].includes(s.id),
  );
  const baseSpirits = spirits.filter((s) => !liqueurs.includes(s));
  const spiritPool = baseSpirits.length > 0 ? baseSpirits : spirits;

  const targetFlavor =
    prefs?.flavor ??
    undefined;

  const combos: Recipe[] = [];
  let n = 0;
  for (const spirit of spiritPool) {
    for (const fruit of fruits.length ? fruits : spices.slice(0, 1)) {
      const spice =
        spices.length > 0
          ? spices[(n + spiritPool.indexOf(spirit)) % spices.length]
          : undefined;
      // skip spice === fruit label collisions
      const useSpice =
        spice && spice.label !== fruit.label ? spice : undefined;
      const liqueur =
        liqueurs.length > 0 ? liqueurs[n % liqueurs.length] : undefined;
      const tpl = TEMPLATES[n % TEMPLATES.length];
      const name = tpl.name(spirit.label, fruit.label, useSpice?.label);
      const story = tpl.story(spirit.label, fruit.label, useSpice?.label);
      const flavor = leanFlavor(
        tpl.flavor(fruit, useSpice),
        targetFlavor,
      );
      const base = SPIRIT_TO_BASE[spirit.id] ?? "other";
      const spiritTag = SPIRIT_TO_SPIRIT[spirit.id] ?? "none";
      const id = `specialty-${slugify(name)}-${n}`;
      combos.push({
        id,
        name,
        category: "specialty",
        base,
        spirits: spiritTag === "none" ? [] : [spiritTag],
        ingredients: tpl.ingredients(spirit, fruit, useSpice, liqueur),
        steps: tpl.steps,
        tags: tpl.tags,
        allergens: [],
        abvBand: tpl.abvBand,
        garnish: useSpice?.label ?? fruit.label,
        description: story,
        flavorProfile: flavor,
      });
      n += 1;
      if (combos.length >= Math.min(8, Math.max(3, limit))) break;
    }
    if (combos.length >= Math.min(8, Math.max(3, limit))) break;
  }

  // Prefer those closer to user flavor prefs
  if (targetFlavor && combos.length > 1) {
    combos.sort(
      (a, b) =>
        profileDistance(a.flavorProfile, targetFlavor) -
        profileDistance(b.flavorProfile, targetFlavor),
    );
  }

  const capped = combos.slice(0, Math.min(8, Math.max(3, limit)));
  cacheSpecialties(capped);
  return capped;
}

export function cacheSpecialties(recipes: Recipe[]): void {
  try {
    const prev = loadSpecialtyCache();
    const map = new Map(prev.map((r) => [r.id, r]));
    for (const r of recipes) map.set(r.id, r);
    const all = [...map.values()].slice(-40);
    sessionStorage.setItem(SPECIALTY_CACHE_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function loadSpecialtyCache(): Recipe[] {
  try {
    const raw = sessionStorage.getItem(SPECIALTY_CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Recipe[];
  } catch {
    return [];
  }
}

export function getSpecialtyById(id: string): Recipe | undefined {
  return loadSpecialtyCache().find((r) => r.id === id);
}

/** Catalog lookup with specialty session fallback. */
export function resolveRecipe(id: string, getCatalog: (id: string) => Recipe | undefined): Recipe | undefined {
  return getCatalog(id) ?? getSpecialtyById(id);
}

/** Only pantry + staples appear in specialty ingredients (for tests). */
export function specialtyUsesOnlyPantry(
  recipe: Recipe,
  state: PantryState,
): boolean {
  const labels = new Set<string>();
  for (const g of ["alcools", "fruits", "epices", "autres"] as PantryGroup[]) {
    for (const id of state[g]) {
      const item = ALL_PANTRY_ITEMS.find((p) => p.id === id);
      if (item) labels.add(item.label.toLowerCase());
      labels.add(id.toLowerCase());
      if (item) for (const t of item.tokens) labels.add(t.toLowerCase());
    }
  }
  for (const c of state.custom) labels.add(c.toLowerCase());

  const staples = [
    "glace",
    "ice",
    "eau",
    "water",
    "sucre",
    "sugar",
    "sel",
    "salt",
    "soda water",
    "soda",
    "sirop simple",
    "simple syrup",
    "agrume",
    "citron",
    "citron vert",
    "jus",
  ];

  for (const ing of recipe.ingredients) {
    const lower = ing.toLowerCase();
    // skip if clearly staple-ish
    if (staples.some((s) => lower.includes(s))) continue;
    // must mention at least one pantry label/token
    const ok = [...labels].some((l) => l && lower.includes(l));
    if (!ok) return false;
  }
  return true;
}
