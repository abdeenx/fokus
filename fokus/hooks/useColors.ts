import { useColorScheme } from "react-native";
import colors from "@/constants/colors";

export type ColorScheme = "light" | "dark";

export interface ThemeColors {
  primary: string;
  primaryFg: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  gradient: readonly [string, string, ...string[]];
}

export interface ActiveTheme extends ThemeColors {
  scheme: ColorScheme;
  radius: number;
}

export function useColors(): ActiveTheme {
  const scheme: ColorScheme = useColorScheme() === "dark" ? "dark" : "light";
  const palette = colors[scheme];
  return {
    primary: palette.primary,
    primaryFg: palette.primaryFg,
    accent: palette.accent,
    background: palette.background,
    surface: palette.surface,
    foreground: palette.foreground,
    muted: palette.muted,
    border: palette.border,
    gradient: palette.gradient,
    scheme,
    radius: colors.radius,
  };
}
