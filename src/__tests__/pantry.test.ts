import { describe, expect, it } from "vitest";
import { RECIPES } from "../data/recipes";
import {
  computeCoverage,
  ingredientCovered,
  isStapleIngredient,
  normalizeToken,
  pantryIsEmpty,
  pantrySoftBoost,
  pantryTokens,
  type PantryState,
} from "../lib/pantry";
import { rankRecipes, scoreRecipe } from "../lib/scoring";
import { DEFAULT_PREFERENCES } from "../types";

const mojito = RECIPES.find((r) => r.id === "mojito")!;
const negroni = RECIPES.find((r) => r.id === "negroni")!;
const daiquiri = RECIPES.find((r) => r.id === "daiquiri")!;

const fullMojitoBar: PantryState = {
  alcools: ["rhum-blanc"],
  fruits: ["citron-vert"],
  epices: ["menthe"],
  autres: ["sirop-simple"],
  custom: [],
};

describe("normalize + staples", () => {
  it("strips accents", () => {
    expect(normalizeToken("Citron Vert")).toBe("citron vert");
    expect(normalizeToken("Épices")).toBe("epices");
  });

  it("treats glace/eau/sucre/sel/soda as staples", () => {
    expect(isStapleIngredient("Glace")).toBe(true);
    expect(isStapleIngredient("ice")).toBe(true);
    expect(isStapleIngredient("splash of water")).toBe(true);
    expect(isStapleIngredient("Salt for rim (optional)")).toBe(true);
    expect(isStapleIngredient("Soda water")).toBe(true);
    expect(isStapleIngredient("1 sugar cube (or 1/4 oz simple syrup)")).toBe(
      true,
    );
  });

  it("does not treat gin or lime as staples", () => {
    expect(isStapleIngredient("2 oz gin")).toBe(false);
    expect(isStapleIngredient("1 oz fresh lime juice")).toBe(false);
  });
});

describe("ingredient matching / aliases", () => {
  it("maps citron vert ↔ lime", () => {
    const tokens = pantryTokens({
      alcools: [],
      fruits: ["citron-vert"],
      epices: [],
      autres: [],
      custom: [],
    });
    expect(ingredientCovered("1 oz fresh lime juice", tokens)).toBe(true);
    expect(ingredientCovered("jus de citron vert", tokens)).toBe(true);
  });

  it("matches rum aliases", () => {
    const tokens = pantryTokens({
      alcools: ["rhum-blanc"],
      fruits: [],
      epices: [],
      autres: [],
      custom: [],
    });
    expect(ingredientCovered("2 oz white rum", tokens)).toBe(true);
  });
});

describe("coverage scoring", () => {
  it("scores high coverage for mojito when bar is stocked", () => {
    const cov = computeCoverage(mojito, fullMojitoBar);
    expect(cov.total).toBeGreaterThan(0);
    expect(cov.matched).toBeGreaterThanOrEqual(cov.total - 1);
    expect(cov.label).toMatch(/\d+\/\d+ ingrédients/);
  });

  it("ignores staples as missing", () => {
    // Daiquiri: rum, lime, simple syrup — syrup may count; ice is staple if present
    const bar: PantryState = {
      alcools: ["rhum-blanc"],
      fruits: ["citron-vert"],
      epices: [],
      autres: ["sirop-simple"],
      custom: [],
    };
    const cov = computeCoverage(daiquiri, bar);
    expect(cov.missing.every((m) => !isStapleIngredient(m))).toBe(true);
    expect(cov.ratio).toBeGreaterThanOrEqual(0.9);
  });

  it("soft boost increases with coverage", () => {
    expect(pantrySoftBoost({ matched: 4, total: 4, ratio: 1, missing: [], label: "4/4" }, false)).toBe(18);
    expect(pantrySoftBoost({ matched: 2, total: 4, ratio: 0.5, missing: [], label: "2/4" }, false)).toBe(9);
    expect(pantrySoftBoost({ matched: 0, total: 4, ratio: 0, missing: [], label: "0/4" }, true)).toBe(0);
  });

  it("soft mode boosts pantry-friendly recipes", () => {
    const prefs = { ...DEFAULT_PREFERENCES };
    const softMojito = scoreRecipe(mojito, prefs, {
      pantry: fullMojitoBar,
      pantryMode: "soft",
    })!;
    const softNegroni = scoreRecipe(negroni, prefs, {
      pantry: fullMojitoBar,
      pantryMode: "soft",
    })!;
    expect(softMojito.pantryCoverage!.ratio).toBeGreaterThan(
      softNegroni.pantryCoverage!.ratio,
    );
    expect(softMojito.score).toBeGreaterThan(softNegroni.score - 5);
  });

  it("hard filter excludes recipes with missing pantry items", () => {
    const prefs = { ...DEFAULT_PREFERENCES };
    const ranked = rankRecipes(RECIPES, prefs, {
      pantry: fullMojitoBar,
      pantryMode: "hard",
    });
    // Negroni needs gin/campari/vermouth — should be out
    expect(ranked.every((r) => r.recipe.id !== "negroni")).toBe(true);
    // Mojito should pass (rum, lime, mint, syrup + soda staple)
    const m = ranked.find((r) => r.recipe.id === "mojito");
    expect(m).toBeTruthy();
    expect(m!.pantryCoverage!.missing.length).toBe(0);
  });

  it("empty pantry does not filter", () => {
    expect(pantryIsEmpty({
      alcools: [],
      fruits: [],
      epices: [],
      autres: [],
      custom: [],
    })).toBe(true);
    const ranked = rankRecipes(RECIPES, DEFAULT_PREFERENCES, {
      pantry: {
        alcools: [],
        fruits: [],
        epices: [],
        autres: [],
        custom: [],
      },
      pantryMode: "hard",
    });
    expect(ranked.length).toBeGreaterThan(10);
  });
});
