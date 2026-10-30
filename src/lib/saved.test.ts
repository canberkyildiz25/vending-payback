import { describe, expect, it } from "vitest";
import { SAVED_KEY, caseState, listCases, removeCase, restoreCase, saveCase } from "./saved";
import { DEFAULT_STATE, fromSearchParams, stateFromPreset, toSearchParams } from "./state";

function memoryStore() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
}

describe("saved cases", () => {
  it("saves, lists newest first and reopens the exact state", () => {
    const store = memoryStore();
    const gym = stateFromPreset("gym", "GBP");
    gym.fleet.machines = 14;
    saveCase(store, "Gym prospect", gym, new Date("2026-10-01"));
    saveCase(store, "Hospital", stateFromPreset("hospital"), new Date("2026-10-02"));
    const list = listCases(store);
    expect(list.map((c) => c.name)).toEqual(["Hospital", "Gym prospect"]);
    expect(caseState(list[1])).toEqual(gym);
  });

  it("replaces a case saved again under the same name", () => {
    const store = memoryStore();
    saveCase(store, "Acme", DEFAULT_STATE);
    saveCase(store, " acme ", stateFromPreset("office"));
    const list = listCases(store);
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("acme");
    expect(caseState(list[0]).preset).toBe("office");
  });

  it("removes and restores a case in its old place", () => {
    const store = memoryStore();
    saveCase(store, "One", DEFAULT_STATE);
    saveCase(store, "Two", DEFAULT_STATE);
    saveCase(store, "Three", DEFAULT_STATE);
    const before = listCases(store);
    const gone = before[1];
    expect(removeCase(store, gone.id)!.map((c) => c.name)).toEqual(["Three", "One"]);
    expect(restoreCase(store, gone, 1)!.map((c) => c.name)).toEqual(["Three", "Two", "One"]);
  });

  it("ignores empty names, corrupt data and blocked storage", () => {
    const store = memoryStore();
    expect(saveCase(store, "   ", DEFAULT_STATE)).toBeNull();
    store.setItem(SAVED_KEY, "{not json");
    expect(listCases(store)).toEqual([]);
    store.setItem(SAVED_KEY, JSON.stringify([{ id: 1 }, "x"]));
    expect(listCases(store)).toEqual([]);
    const blocked = { getItem: () => { throw new Error("blocked"); }, setItem: () => { throw new Error("blocked"); } };
    expect(listCases(blocked)).toEqual([]);
    expect(saveCase(blocked, "A", DEFAULT_STATE)).toBeNull();
    expect(listCases(null)).toEqual([]);
  });
});

describe("pilot figures in the URL", () => {
  it("round-trip, including an unknown uplift", () => {
    const s = stateFromPreset("campus");
    s.pilot = { upliftPct: null, cardSharePct: 62.4, machines: 6, daysBefore: 0, daysAfter: 41, replaced: { upliftPct: 15, cardSharePct: 70 } };
    s.scenarios.realistic.cardSharePct = 62.4;
    expect(fromSearchParams(toSearchParams(s))).toEqual(s);
  });
});
