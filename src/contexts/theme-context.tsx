import { theme } from "antd";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    resolvedMode: "light" | "dark";
    algorithm: typeof theme.defaultAlgorithm;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "theme-mode";

const getSystemTheme = (): "light" | "dark" => {
    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setModeState] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return (saved as ThemeMode) || "system";
    });

    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? "dark" : "light");
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, mode);
    }, [mode]);

    const setMode = (newMode: ThemeMode) => {
        setModeState(newMode);
    };

    const resolvedMode = mode === "system" ? systemTheme : mode;
    const algorithm = resolvedMode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm;

    return (
        <ThemeContext.Provider value={{ mode, setMode, resolvedMode, algorithm }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
