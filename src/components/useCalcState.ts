"use client";

import { useEffect, useMemo, useState } from "react";
import { computePayback, type FleetInputs, type PaybackResult } from "@/lib/payback";
import type { PresetId } from "@/lib/presets";
import { SCENARIO_IDS, type Currency, type ScenarioId } from "@/lib/scenarios";
import { changeCurrency, stateFromPreset, toSearchParams, type CalcState } from "@/lib/state";

/** The calculator state, its results, and the address bar kept in step so a case can be shared. */
export function useCalcState(initial: CalcState) {
  const [state, setState] = useState(initial);

  const results = useMemo(
    () => Object.fromEntries(SCENARIO_IDS.map((id) => [id, computePayback(state.fleet, state.scenarios[id])])) as Record<ScenarioId, PaybackResult>,
    [state],
  );
  const query = useMemo(() => toSearchParams(state).toString(), [state]);

  useEffect(() => {
    const t = setTimeout(() => window.history.replaceState(null, "", `?${query}`), 250);
    return () => clearTimeout(t);
  }, [query]);

  return {
    state,
    setState,
    results,
    query,
    onPreset: (p: PresetId) => setState((s) => ({ ...stateFromPreset(p, s.currency), selected: s.selected })),
    onCurrency: (c: Currency) => setState((s) => changeCurrency(s, c)),
    onFleet: (k: keyof FleetInputs, v: number) => setState((s) => ({ ...s, fleet: { ...s.fleet, [k]: v } })),
    onScenario: (id: ScenarioId, k: "upliftPct" | "cardSharePct", v: number) =>
      setState((s) => ({ ...s, scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], [k]: v } } })),
    onSelect: (id: ScenarioId) => setState((s) => ({ ...s, selected: id })),
  };
}
