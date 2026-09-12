import { create } from "zustand";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("app_theme_mode") as ThemeMode;
    if (saved === "dark" || saved === "light") return saved;
  }
  return "light";
};

const applyThemeToDOM = (mode: ThemeMode) => {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", mode);
    if (mode === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }
};

const initialMode = getInitialTheme();
applyThemeToDOM(initialMode);

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: initialMode,

  toggleTheme: () => {
    const nextMode = get().mode === "light" ? "dark" : "light";
    localStorage.setItem("app_theme_mode", nextMode);
    applyThemeToDOM(nextMode);
    set({ mode: nextMode });
  },

  setMode: (mode: ThemeMode) => {
    localStorage.setItem("app_theme_mode", mode);
    applyThemeToDOM(mode);
    set({ mode });
  },
}));
