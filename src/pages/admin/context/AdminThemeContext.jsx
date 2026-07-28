import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AdminThemeContext = createContext({ adminTheme: "light", toggleAdminTheme: () => {} });

export function AdminThemeProvider({ children }) {
  const [adminTheme, setAdminTheme] = useState(() => {
    return localStorage.getItem("aca-admin-theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("aca-admin-theme", adminTheme);
  }, [adminTheme]);

  // Listen for OS preference changes (e.g. user toggles system dark mode)
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      if (!localStorage.getItem("aca-admin-theme")) {
        setAdminTheme(e.matches ? "dark" : "light");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const toggleAdminTheme = useCallback(() => {
    setAdminTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return (
    <AdminThemeContext.Provider value={{ adminTheme, toggleAdminTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export default AdminThemeContext;
