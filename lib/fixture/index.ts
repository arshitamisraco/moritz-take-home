export * from "./types";
export * from "./clock";
export { demoFixture } from "./demo";
export { goodDayFixture } from "./good-day";
export { overflowFixture } from "./overflow";

import { demoFixture } from "./demo";
import { goodDayFixture } from "./good-day";
import { overflowFixture } from "./overflow";
import type { Fixture } from "./types";

export type ViewState = "demo" | "good" | "loading" | "error" | "overflow";

export function fixtureFor(state: ViewState): Fixture | null {
  switch (state) {
    case "demo":
      return demoFixture;
    case "good":
      return goodDayFixture;
    case "overflow":
      return overflowFixture;
    case "loading":
    case "error":
      return null;
  }
}

export function parseViewState(raw: string | string[] | undefined): ViewState {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "good" || v === "loading" || v === "error" || v === "overflow") return v;
  return "demo";
}
