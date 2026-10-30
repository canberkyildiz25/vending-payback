import { describe, expect, it } from "vitest";
import { presetForCode, pressDigit, slotCode } from "./keypad";
import { PRESET_IDS } from "./presets";

describe("slot codes", () => {
  it("number the shelf from 11 and read back", () => {
    expect(slotCode("custom")).toBe("11");
    expect(slotCode("gym")).toBe("13");
    for (const id of PRESET_IDS) expect(presetForCode(slotCode(id))).toBe(id);
    expect(presetForCode("99")).toBeNull();
  });
});

describe("pressDigit", () => {
  it("waits for the second digit, then selects", () => {
    expect(pressDigit("", "1")).toEqual({ kind: "typing", buffer: "1" });
    expect(pressDigit("1", "3")).toEqual({ kind: "selected", preset: "gym", code: "13" });
  });
  it("rejects a code with no slot", () => {
    expect(pressDigit("2", "7")).toEqual({ kind: "invalid", code: "27" });
    expect(pressDigit("1", "7")).toEqual({ kind: "invalid", code: "17" });
  });
});
