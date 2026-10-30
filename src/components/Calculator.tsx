"use client";

import { pilotValue, type CalcState } from "@/lib/state";
import { PilotPanel } from "./PilotPanel";
import { ResultDisplay } from "./ResultDisplay";
import { SavedCases } from "./SavedCases";
import { useCalcState } from "./useCalcState";
import { PresetShelf, Worksheet } from "./Worksheet";

export function Calculator({ initial }: { initial: CalcState }) {
  const { state, setState, results, query, onPreset, onCurrency, onFleet, onScenario, onSelect } = useCalcState(initial);

  return (
    <>
      <PresetShelf state={state} onPreset={onPreset} onCurrency={onCurrency} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <Worksheet state={state} onFleet={onFleet} onScenario={onScenario} />
        <ResultDisplay
          state={state}
          results={results}
          onSelect={onSelect}
          proposalHref={`/proposal?${query}`}
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <PilotPanel
          state={state}
          onApply={(p) =>
            setState((s) => {
              const r = s.scenarios.realistic;
              return {
                ...s,
                // keep the estimates from before the first pilot, so they can be put back
                pilot: { ...p, replaced: s.pilot?.replaced ?? { ...r } },
                selected: "realistic",
                scenarios: {
                  ...s.scenarios,
                  realistic: {
                    upliftPct: p.upliftPct === null ? r.upliftPct : pilotValue(p.upliftPct),
                    cardSharePct: p.cardSharePct === null ? r.cardSharePct : pilotValue(p.cardSharePct),
                  },
                },
              };
            })
          }
          onClear={() =>
            setState((s) => ({ ...s, pilot: null, scenarios: s.pilot ? { ...s.scenarios, realistic: { ...s.pilot.replaced } } : s.scenarios }))
          }
        />
        <SavedCases state={state} onOpen={setState} />
      </div>
    </>
  );
}
