// ============================================================
// FLIPIA — ARCADE DELUXE theme
// Juicy mobile-game look: flat solid hues + chunky 3D "lip"
// shadows (no gradients). Keeps Fredoka + Nunito DNA.
// ============================================================

export type HueName =
  | "violet"
  | "blue"
  | "coral"
  | "green"
  | "gold"
  | "pink"
  | "white";

// Each hue is a triplet: [base, darker "lip" shade, soft bg tint]
export type Hue = readonly [string, string, string];
export type HueMap = Record<HueName, Hue>;

export type ThemeColors = {
  surface: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerLow: string;
  p1: string;
  p1Bg: string;
  p2: string;
  p2Bg: string;
  primary: string;
  primaryContainer: string;
  primaryContainerBg: string;
  onSurface: string;
  onSurfaceVariant: string;
  onSurfaceMuted: string;
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  warning: string;
  warningBg: string;
  ghostBorder: string;
  shadow: string;
  // Arcade 3D system ----------------------------------------
  /** Brand hues with their darker "lip" + soft bg tint. */
  hues: HueMap;
  /** Bottom "lip" shadow color for chunky panels. */
  panelLip: string;
  /** Soft ambient drop shadow color for panels. */
  panelShadow: string;
};

const lightHues: HueMap = {
  violet: ["#6C4CF1", "#4A2BC0", "#ECE6FE"],
  blue: ["#2D9CFF", "#1A6FCC", "#E2F0FF"],
  coral: ["#FF6B4D", "#D8431F", "#FFE7E0"],
  green: ["#1FC08A", "#149068", "#D8F6EC"],
  gold: ["#FFC23C", "#E59410", "#FFF1CF"],
  pink: ["#FF5C9D", "#DB2F76", "#FFE4F0"],
  white: ["#FFFFFF", "#D8D0EC", "#FFFFFF"],
};

const darkHues: HueMap = {
  violet: ["#7C5CFF", "#5536D6", "#2A2348"],
  blue: ["#3DA8FF", "#1A6FCC", "#16263D"],
  coral: ["#FF7D61", "#D8431F", "#3A211A"],
  green: ["#27CE97", "#149068", "#123028"],
  gold: ["#FFCB55", "#E59410", "#332811"],
  pink: ["#FF6FA8", "#DB2F76", "#331824"],
  white: ["#2E2748", "#1C1733", "#2E2748"],
};

export const lightColors: ThemeColors = {
  surface: "#EFE8F7",
  surfaceContainer: "#FFFFFF",
  surfaceContainerHigh: "#FFFFFF",
  surfaceContainerLow: "#F4EFFB",
  p1: "#2D9CFF",
  p1Bg: "#E2F0FF",
  p2: "#FF6B4D",
  p2Bg: "#FFE7E0",
  primary: "#6C4CF1",
  primaryContainer: "#6C4CF1",
  primaryContainerBg: "#ECE6FE",
  onSurface: "#2A2150",
  onSurfaceVariant: "#6B6396",
  onSurfaceMuted: "#A79FCB",
  success: "#1FC08A",
  successBg: "#D8F6EC",
  error: "#FF6B4D",
  errorBg: "#FFE7E0",
  warning: "#E59410",
  warningBg: "#FFF1CF",
  ghostBorder: "rgba(42, 33, 80, 0.08)",
  shadow: "transparent",
  hues: lightHues,
  // NOTE: colors used inside `boxShadow` strings must be comma-free
  // (8-digit hex), otherwise rgba() commas break RN's multi-shadow parser.
  panelLip: "#2A21500F",
  panelShadow: "#2A215047",
};

export const darkColors: ThemeColors = {
  surface: "#161229",
  surfaceContainer: "#211B3B",
  surfaceContainerHigh: "#2C2549",
  surfaceContainerLow: "#1B1633",
  p1: "#3DA8FF",
  p1Bg: "#16263D",
  p2: "#FF7D61",
  p2Bg: "#3A211A",
  primary: "#7C5CFF",
  primaryContainer: "#7C5CFF",
  primaryContainerBg: "#2A2348",
  onSurface: "#EDE8FA",
  onSurfaceVariant: "#B5ACD6",
  onSurfaceMuted: "#7B73A0",
  success: "#27CE97",
  successBg: "#123028",
  error: "#FF7D61",
  errorBg: "#3A211A",
  warning: "#FFCB55",
  warningBg: "#332811",
  ghostBorder: "rgba(255, 255, 255, 0.08)",
  shadow: "transparent",
  hues: darkHues,
  panelLip: "#00000059",
  panelShadow: "#00000080",
};

export const colors = lightColors;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;
