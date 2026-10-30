// Saved client cases, kept in this browser only (localStorage). Each case is
// stored as the same query string the URL uses, so opening one is a plain
// fromSearchParams call and old saves keep working as the state grows.
import { fromSearchParams, toSearchParams, type CalcState } from "./state";

export type SavedCase = { id: string; name: string; savedAt: string; query: string };

type Store = Pick<Storage, "getItem" | "setItem">;

export const SAVED_KEY = "vending-payback:saved:v1";
const MAX_CASES = 50;

function isCase(v: unknown): v is SavedCase {
  const c = v as SavedCase;
  return !!c && typeof c.id === "string" && typeof c.name === "string" && typeof c.savedAt === "string" && typeof c.query === "string";
}

/** Newest first. A broken or blocked store reads as empty. */
export function listCases(store: Store | null): SavedCase[] {
  try {
    const raw = store?.getItem(SAVED_KEY);
    const data: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter(isCase) : [];
  } catch {
    return [];
  }
}

function write(store: Store | null, cases: SavedCase[]): boolean {
  try {
    if (!store) return false;
    store.setItem(SAVED_KEY, JSON.stringify(cases));
    return true;
  } catch {
    return false;
  }
}

/**
 * Saves under a name. Saving again under the same name (case-insensitive)
 * replaces that case. Returns the new list, or null when the browser blocks storage.
 */
export function saveCase(store: Store | null, name: string, state: CalcState, now = new Date()): SavedCase[] | null {
  const clean = name.trim().slice(0, 80);
  if (!clean) return null;
  const others = listCases(store).filter((c) => c.name.toLowerCase() !== clean.toLowerCase());
  const entry: SavedCase = {
    id: `${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: clean,
    savedAt: now.toISOString(),
    query: toSearchParams(state).toString(),
  };
  const next = [entry, ...others].slice(0, MAX_CASES);
  return write(store, next) ? next : null;
}

export function removeCase(store: Store | null, id: string): SavedCase[] | null {
  const next = listCases(store).filter((c) => c.id !== id);
  return write(store, next) ? next : null;
}

/** Puts a removed case back in its old place (for Undo). */
export function restoreCase(store: Store | null, entry: SavedCase, index: number): SavedCase[] | null {
  const list = listCases(store).filter((c) => c.id !== entry.id);
  list.splice(Math.min(index, list.length), 0, entry);
  return write(store, list) ? list : null;
}

export const caseState = (c: SavedCase): CalcState => fromSearchParams(new URLSearchParams(c.query));
