import { describe, expect, it } from "vitest";
import { RECIPES } from "../data/recipes";
import {
  failsNoAlcohol,
  hasAllergenConflict,
  profileDistance,
  rankRecipes,
  scoreRecipe,
  topMatches,
} from "../lib/scoring";
import { DEFAULT_FLAVOR, DEFAULT_PREFERENCES, type Preferences } from "../types";

const whiskeySour = RECIPES.find((r) => r.id === "whiskey-sour")!;
const ledgerCooler = RECIPES.find((r) => r.id === "ledger-lime-cooler")!;
const negroni = RECIPES.find((r) => r.id === "negroni")!;
const boulevardier = RECIPES.find((r) => r.id === "boulevardier")!;
const margarita = RECIPES.find((r) => r.id === "margarita")!;

describe("allergen filtering", () => {
  it("flags egg on whiskey sour", () => {
    expect(hasAllergenConflict(whiskeySour, ["egg"])).toBe(true);
    expect(hasAllergenConflict(whiskeySour, ["dairy"])).toBe(false);
  });

  it("excludes allergen conflicts from ranking", () => {
    const prefs: Preferences = {
      ...DEFAULT_PREFERENCES,
      bases: ["whiskey"],
      allergens: ["egg"],
    };
    const ranked = rankRecipes(RECIPES, prefs);
    expect(ranked.every((r) => r.recipe.id !== "whiskey-sour")).toBe(true);
  });
});

describe("no-alcohol filtering", () => {
  it("fails spirited drinks when noAlcohol", () => {
    expect(failsNoAlcohol(negroni, true)).toBe(true);
    expect(failsNoAlcohol(ledgerCooler, true)).toBe(false);
  });

  it("only returns zero-proof when noAlcohol", () => {
    const prefs: Preferences = {
      ...DEFAULT_PREFERENCES,
      noAlcohol: true,
    };
    const ranked = rankRecipes(RECIPES, prefs);
    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked.every((r) => r.recipe.abvBand === "none")).toBe(true);
  });
});

describe("profile distance", () => {
  it("is zero for identical profiles", () => {
    expect(profileDistance(negroni.flavorProfile, negroni.flavorProfile)).toBe(
      0,
    );
  });

  it("grows as profiles diverge", () => {
    const near = profileDistance(
      negroni.flavorProfile,
      boulevardier.flavorProfile,
    );
    const far = profileDistance(
      negroni.flavorProfile,
      margarita.flavorProfile,
    );
    expect(far).toBeGreaterThan(near);
  });
});

describe("favorite cocktail influence", () => {
  it("ranks drinks near the favorite higher", () => {
    const withFav: Preferences = {
      ...DEFAULT_PREFERENCES,
      favoriteCocktailId: "negroni",
      flavor: { ...DEFAULT_FLAVOR },
      bases: [],
      strength: 4,
      mood: "classic",
    };
    const without: Preferences = {
      ...DEFAULT_PREFERENCES,
      favoriteCocktailId: null,
      flavor: { ...DEFAULT_FLAVOR },
      bases: [],
      strength: 4,
      mood: "classic",
    };

    const rankedFav = rankRecipes(RECIPES, withFav);
    const rankedPlain = rankRecipes(RECIPES, without);

    const blvdFav = rankedFav.findIndex((r) => r.recipe.id === "boulevardier");
    const blvdPlain = rankedPlain.findIndex(
      (r) => r.recipe.id === "boulevardier",
    );
    const margFav = rankedFav.findIndex((r) => r.recipe.id === "margarita");

    expect(blvdFav).toBeGreaterThanOrEqual(0);
    // Boulevardier (bitter whiskey negroni cousin) should outrank margarita when favorite is Negroni
    expect(blvdFav).toBeLessThan(margFav);

    const blvdScoreFav = rankedFav.find((r) => r.recipe.id === "boulevardier")!
      .score;
    const blvdScorePlain = rankedPlain.find(
      (r) => r.recipe.id === "boulevardier",
    )!.score;
    expect(blvdScoreFav).toBeGreaterThan(blvdScorePlain);

    const negroniRanked = scoreRecipe(negroni, withFav)!;
    expect(
      negroniRanked.reasons.some(
        (r) => r.includes("préféré") || r.includes("Negroni"),
      ),
    ).toBe(true);

    const blvdReasons = scoreRecipe(boulevardier, withFav)!.reasons;
    expect(blvdReasons.some((r) => r.includes("lignée") && r.includes("Negroni"))).toBe(
      true,
    );

    // plain ranking still works
    expect(rankedPlain.length).toBeGreaterThan(5);
  });
});

describe("preference scoring", () => {
  it("boosts gin + bitter profile toward negroni", () => {
    const prefs: Preferences = {
      ...DEFAULT_PREFERENCES,
      bases: ["gin"],
      flavor: {
        sweet: 1,
        sour: 0,
        bitter: 5,
        spicy: 0,
        herbal: 4,
        smoky: 0,
        creamy: 0,
        fruity: 1,
        refreshing: 2,
      },
      strength: 5,
      mood: "classic",
    };
    const n = scoreRecipe(negroni, prefs)!;
    const soft = scoreRecipe(ledgerCooler, prefs);
    expect(n).not.toBeNull();
    expect(soft).not.toBeNull();
    expect(n.score).toBeGreaterThan(soft!.score);
    expect(n.reasons.length).toBeGreaterThan(0);
  });

  it("topMatches returns limited sorted list", () => {
    const top = topMatches(RECIPES, DEFAULT_PREFERENCES, 5);
    expect(top).toHaveLength(5);
    for (let i = 1; i < top.length; i++) {
      expect(top[i - 1].score).toBeGreaterThanOrEqual(top[i].score);
    }
  });

  it("vegan filter drops egg/dairy/nut recipes", () => {
    const prefs: Preferences = {
      ...DEFAULT_PREFERENCES,
      vegan: true,
    };
    const ranked = rankRecipes(RECIPES, prefs);
    const banned = new Set(["egg", "dairy", "nut"]);
    expect(
      ranked.every((r) => !r.recipe.allergens.some((a) => banned.has(a))),
    ).toBe(true);
  });
});
