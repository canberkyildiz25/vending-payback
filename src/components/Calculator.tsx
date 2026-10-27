"use client";

import { useEffect, useMemo, useState } from "react";
import { computePayback, type PaybackResult } from "@/lib/payback";
import { SCENARIO_IDS, type ScenarioId } from "@/lib/scenarios";
import { stateFromPreset, toSearchParams, type CalcState } from "@/lib/state";
import { ResultDisplay } from "./ResultDisplay";
import { Worksheet } from "./Worksheet";

export function Calculator({ initial }: { initial: CalcState }) {
  const [state, setState] = useState(initial);

  const results = useMemo(
    () => Object.fromEntries(SCENARIO_IDS.map((id) => [id, computePayback(state.fleet, state.scenarios[id])])) as Record<ScenarioId, PaybackResult>,
    [state],
  );
  const query = useMemo(() => toSearchParams(state).toString(), [state]);

  // Keep the address bar in step so the case can be bookmarked or shared.
  useEffect(() => {
    const t = setTimeout(() => window.history.replaceState(null, "", `?${query}`), 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <Worksheet
        state={state}
        onPreset={(p) => setState((s) => ({ ...stateFromPreset(p, s.currency), selected: s.selected }))}
        onCurrency={(c) => setState((s) => ({ ...s, currency: c }))}
        onFleet={(k, v) => setState((s) => ({ ...s, fleet: { ...s.fleet, [k]: v } }))}
        onScenario={(id, k, v) =>
          setState((s) => ({ ...s, scenarios: { ...s.scenarios, [id]: { ...s.scenarios[id], [k]: v } } }))
        }
      />
      <ResultDisplay
        state={state}
        results={results}
        onSelect={(id) => setState((s) => ({ ...s, selected: id }))}
        proposalHref={`/proposal?${query}`}
      />
    </div>
  );
}
