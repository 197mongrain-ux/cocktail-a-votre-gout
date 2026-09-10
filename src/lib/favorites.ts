import { FAVORITES_STORAGE_KEY } from "../types";

export function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function saveFavorites(ids: string[]): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

export function toggleFavorite(id: string): string[] {
  const current = loadFavorites();
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id];
  saveFavorites(next);
  return next;
}

export function isFavorite(id: string): boolean {
  return loadFavorites().includes(id);
}
