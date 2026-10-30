// The shelf's slot codes, typed in the way you would on a real machine.
import { PRESET_IDS, type PresetId } from "./presets";

const FIRST_SLOT = 11;

export const slotCode = (id: PresetId) => String(FIRST_SLOT + PRESET_IDS.indexOf(id));

export function presetForCode(code: string): PresetId | null {
  return PRESET_IDS.find((id) => slotCode(id) === code) ?? null;
}

export type KeyResult =
  /** Waiting for the second digit. */
  | { kind: "typing"; buffer: string }
  | { kind: "selected"; preset: PresetId; code: string }
  | { kind: "invalid"; code: string };

/** Two digits make a code; the buffer empties once the code has been judged. */
export function pressDigit(buffer: string, digit: string): KeyResult {
  const next = buffer + digit;
  if (next.length < 2) return { kind: "typing", buffer: next };
  const preset = presetForCode(next);
  return preset ? { kind: "selected", preset, code: next } : { kind: "invalid", code: next };
}
