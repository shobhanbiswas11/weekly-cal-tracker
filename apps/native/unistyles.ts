import { StyleSheet } from "react-native-unistyles";

const lightTheme = {
  colors: {
    background: "#ffffff",
    card: "#f4f4f4",
    foreground: "#0d0d0d",
    mutedForeground: "#6e6e80",
    primary: "#10a37f",
    primaryForeground: "#ffffff",
    border: "#e8e8e8",
    fill: "#1c1c1c",
    fillForeground: "#ffffff",
    fillDisabled: "#c8c8c8",
  },
};

const darkTheme = {
  colors: {
    background: "#0d0d0d",
    card: "#1e1e1e",
    foreground: "#f5f5f5",
    mutedForeground: "#8e8ea0",
    primary: "#10a37f",
    primaryForeground: "#ffffff",
    border: "#2a2a2a",
    fill: "#ffffff",
    fillForeground: "#0d0d0d",
    fillDisabled: "#3a3a3a",
  },
};

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

declare module "react-native-unistyles" {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    adaptiveThemes: true,
  },
});
