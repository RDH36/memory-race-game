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
};

export const lightColors: ThemeColors = {
  surface: "#FAF1F1",
  surfaceContainer: "#FFFFFF",
  surfaceContainerHigh: "#FFFFFF",
  surfaceContainerLow: "#F4EAEA",
  p1: "#5DA9FE",
  p1Bg: "#E8F1FE",
  p2: "#A2340A",
  p2Bg: "#FAECE7",
  primary: "#3B309E",
  primaryContainer: "#534AB7",
  primaryContainerBg: "#F0EDFB",
  onSurface: "#1A1C17",
  onSurfaceVariant: "#474553",
  onSurfaceMuted: "#7A7885",
  success: "#1D9E75",
  successBg: "#ECFDF5",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  warning: "#D4820A",
  warningBg: "#FEF6E6",
  ghostBorder: "rgba(26, 28, 23, 0.08)",
  shadow: "transparent",
};

export const darkColors: ThemeColors = {
  surface: "#151218",
  surfaceContainer: "#1E1A24",
  surfaceContainerHigh: "#2A2532",
  surfaceContainerLow: "#1A161E",
  p1: "#7EBAFF",
  p1Bg: "#1A2A3D",
  p2: "#E8714A",
  p2Bg: "#2D1A12",
  primary: "#B4A7FF",
  primaryContainer: "#8E82E6",
  primaryContainerBg: "#241E3A",
  onSurface: "#EDE6F2",
  onSurfaceVariant: "#B8B0C4",
  onSurfaceMuted: "#7A7489",
  success: "#4ADE80",
  successBg: "#0F2A1A",
  error: "#F87171",
  errorBg: "#2D1212",
  warning: "#F5B341",
  warningBg: "#2D2011",
  ghostBorder: "rgba(255, 255, 255, 0.08)",
  shadow: "transparent",
};

export const colors = lightColors;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;
