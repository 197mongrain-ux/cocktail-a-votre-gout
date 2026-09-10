import { describe, expect, it } from "vitest";
import { RECIPES, getRecipeById } from "../data/recipes";
import { FLAVOR_KEYS } from "../types";

describe("recipe seed", () => {
  it("has at least 60 recipes", () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(60);
  });

  it("includes required classics", () => {
    const names = new Set(RECIPES.map((r) => r.name));
    for (const n of [
      "Old Fashioned",
      "Negroni",
      "Margarita",
      "Daiquiri",
      "Martini",
      "Manhattan",
      "Mojito",
      "Whiskey Sour",
      "Espresso Martini",
      "French 75",
      "Aperol Spritz",
      "Piña Colada",
    ]) {
      expect(names.has(n)).toBe(true);
    }
  });

  it("has unique ids, base, and flavorProfile fields", () => {
    const ids = new Set<string>();
    const bases = new Set([
      "vodka",
      "gin",
      "rum",
      "tequila",
      "whiskey",
      "brandy",
      "liqueur",
      "other",
      "none",
    ]);
    for (const r of RECIPES) {
      expect(r.id).toBeTruthy();
      expect(ids.has(r.id)).toBe(false);
      ids.add(r.id);
      expect(r.ingredients.length).toBeGreaterThan(0);
      expect(r.steps.length).toBeGreaterThan(0);
      expect(["classic", "specialty"]).toContain(r.category);
      expect(["none", "low", "medium", "high"]).toContain(r.abvBand);
      expect(bases.has(r.base)).toBe(true);
      expect(Array.isArray(r.tags)).toBe(true);
      expect(Array.isArray(r.allergens)).toBe(true);
      expect(r.garnish).toBeTruthy();
      expect(r.flavorProfile).toBeTruthy();
      for (const k of FLAVOR_KEYS) {
        const v = r.flavorProfile[k];
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(5);
      }
    }
  });

  it("includes no-abv options", () => {
    expect(RECIPES.some((r) => r.abvBand === "none")).toBe(true);
    expect(RECIPES.some((r) => r.tags.includes("no-abv"))).toBe(true);
  });

  it("getRecipeById works", () => {
    expect(getRecipeById("negroni")?.name).toBe("Negroni");
    expect(getRecipeById("nope")).toBeUndefined();
  });

  it("mixes classic and specialty", () => {
    expect(RECIPES.some((r) => r.category === "classic")).toBe(true);
    expect(RECIPES.some((r) => r.category === "specialty")).toBe(true);
  });
});
