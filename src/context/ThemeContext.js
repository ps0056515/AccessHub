import { createContext, useContext, useState, useEffect, useCallback } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

/**
 * ThemeProvider — manages light / dark theme globally.
 *
 * On mount it reads from localStorage ("aca-theme") first; if nothing is
 * stored it falls back to the OS preference via prefers-color-scheme.
 *
 * Changing the theme updates:
 *  • The `data-theme` attribute on <html> (so CSS `[data-theme='dark']` works)
 *  • localStorage so the preference survives page refreshes
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // The blocking <script> in index.html already set data-theme on <html>
    // so we just read whatever it decided.
    return document.documentElement.getAttribute("data-theme") || "light";
  });

  // Keep <html data-theme> and localStorage in sync whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("aca-theme", theme);

    // Also update the meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute(
        "content",
        theme === "dark" ? "#0F172A" : "#074a9e"
      );
    }
  }, [theme]);

  // Listen for OS preference changes (e.g. user toggles system dark mode)
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      // Only follow OS preference if the user hasn't manually chosen a theme
      if (!localStorage.getItem("aca-theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
