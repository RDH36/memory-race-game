export type ThemeColors = {
  surface: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  p1: string;
  p1Bg: string;
  p2: string;
  p2Bg: string;
  primary: string;
  primaryContainer: string;
  primaryContainerBg: string;
  onSurface: string;
  onSurfaceVariant: string;
  success: string;
  successBg: string;
  error: string;
  errorBg: string;
  shadow: string;
};

export const lightColors: ThemeColors = {
  surface: "#FAF1F1",
  surfaceContainer: "#FFFFFF",
  surfaceContainerHigh: "#FFFFFF",
  p1: "#5DA9FE",
  p1Bg: "#E8F1FE",
  p2: "#A2340A",
  p2Bg: "#FAECE7",
  primary: "#3B309E",
  primaryContainer: "#534AB7",
  primaryContainerBg: "#F0EDFB",
  onSurface: "#1A1C17",
  onSurfaceVariant: "#474553",
  success: "#1D9E75",
  successBg: "#ECFDF5",
  error: "#DC2626",
  errorBg: "#FEF2F2",
  shadow: "#1A1C17",
};

export const darkColors: ThemeColors = {
  surface: "#121212",
  surfaceContainer: "#1E1E1E",
  surfaceContainerHigh: "#2A2A2A",
  p1: "#5DA9FE",
  p1Bg: "#1A2A3D",
  p2: "#E8714A",
  p2Bg: "#2D1A12",
  primary: "#B4A7FF",
  primaryContainer: "#7B6FD4",
  primaryContainerBg: "#1E1A33",
  onSurface: "#E6E1E5",
  onSurfaceVariant: "#ADA8B5",
  success: "#4ADE80",
  successBg: "#0F2A1A",
  error: "#F87171",
  errorBg: "#2D1212",
  shadow: "#000000",
};

export const colors = lightColors;

export const shadows = {
  ambient: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.06,
    shadowRadius: 40,
    elevation: 3,
  },
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;
