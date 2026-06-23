export type ThemeName = "dark" | "light";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  danger: string;
  success: string;
}

export const darkTheme: ThemeColors = {
  background: "#0B0B0F",
  surface: "#16161D",
  surfaceAlt: "#1F1F29",
  border: "#2A2A35",
  text: "#F5F5F7",
  textMuted: "#9A9AA5",
  primary: "#5B8CFF",
  danger: "#FF5C5C",
  success: "#3DDC84",
};

export const lightTheme: ThemeColors = {
  background: "#FFFFFF",
  surface: "#F6F6F8",
  surfaceAlt: "#EDEDF1",
  border: "#E1E1E6",
  text: "#15151A",
  textMuted: "#6B6B75",
  primary: "#3366E6",
  danger: "#D7373F",
  success: "#1E9E59",
};

export const THEMES: Record<ThemeName, ThemeColors> = {
  dark: darkTheme,
  light: lightTheme,
};

export const AD_FREQUENCY = {
  tabSwitchesPerInterstitial: 3,
  feedItemsPerNativeAd: 3,
  commentsPerNativeAd: 4,
};

export const RATE_LIMIT = {
  maxCommentsPerMinute: 5,
};
