import { RECIPES } from "../data/recipes";

/** Map free-text favorite to a recipe id when the name matches loosely. */
export function resolveFavoriteOther(text: string): string | null {
  const q = text.trim().toLowerCase();
  if (!q || q.length < 2) return null;
  const exact = RECIPES.find((r) => r.name.toLowerCase() === q);
  if (exact) return exact.id;
  const starts = RECIPES.find((r) => r.name.toLowerCase().startsWith(q));
  if (starts) return starts.id;
  const includes = RECIPES.find((r) => r.name.toLowerCase().includes(q));
  if (includes) return includes.id;
  return null;
}
