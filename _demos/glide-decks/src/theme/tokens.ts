/** Design system tokens — see design/design-guidelines.md */

export const tokens = {
  colorPrimary: "#E8472A",
  colorChrome: "#0D1526",
  colorSelection: "#B8C8E8",
  colorWarning: "#FFC13A",
  colorSuccess: "#3A8A28",
  colorSecondary: "#3F6080",
  colorDanger: "#BC3020",
  colorSurface: "#F4F5F7",
  colorPanel: "#FFFFFF",
  colorBorder: "#D1D9E6",
  /** Chart axes, tick marks, leader lines on labels (design canvas — not binding shape preview). */
  colorChartLines: "#A5AEBD",
} as const;

/** Section 1.4 — series color order for Recharts */
export const CHART_SERIES_COLORS: readonly string[] = [
  tokens.colorPrimary,
  tokens.colorChrome,
  tokens.colorWarning,
  tokens.colorSuccess,
  tokens.colorSecondary,
  tokens.colorSelection,
  tokens.colorDanger,
];
