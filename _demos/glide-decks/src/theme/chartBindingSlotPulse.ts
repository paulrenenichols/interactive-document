import { tokens } from "./tokens";

/** Keyframes shared by chart binding drop slots and index source-series intro affordance. */
export const chartBindingSlotPulseKeyframes = {
  "@keyframes chartBindingSlotPulse": {
    "0%, 100%": {
      boxShadow: `0 0 0 1px ${tokens.colorPrimary}, 0 0 12px ${tokens.colorPrimary}44`,
    },
    "50%": {
      boxShadow: `0 0 0 3px ${tokens.colorPrimary}, 0 0 18px ${tokens.colorPrimary}55`,
    },
  },
} as const;

export const CHART_BINDING_SLOT_PULSE_ANIMATION_INFINITE =
  "chartBindingSlotPulse 1.15s ease-in-out infinite" as const;

/** ~3.45s — three cycles, then styles drop (pair with timeout or `animationend`). */
export const CHART_BINDING_SLOT_PULSE_ANIMATION_INTRO =
  "chartBindingSlotPulse 1.15s ease-in-out 3" as const;

export const CHART_BINDING_SLOT_PULSE_INTRO_MS = Math.ceil(1.15 * 3 * 1000);
