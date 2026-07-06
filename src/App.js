import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "components/layout/AppShell/AppShell";
import AdminDashboard from "pages/admin/AdminDashboard";
import RequireAuth from "components/auth/RequireAuth";
import RequireAdmin from "components/auth/RequireAdmin";
import { AuthProvider } from "context/AuthContext";
import { ConfigProvider } from "context/ConfigContext";
import { ToastProvider } from "context/ToastContext";
import { ConfirmProvider } from "context/ConfirmContext";
import { AriaLiveProvider } from "context/AriaLiveContext";
import useTracker from "hooks/useTracker";

/* Thin wrapper so useTracker runs inside BrowserRouter context */
function TrackerMount({ children }) {
  useTracker();
  return children;
}

export default function App() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
        e.preventDefault();
        e.target.click();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <TrackerMount>
          <ConfigProvider>
            <ToastProvider>
              <ConfirmProvider>
                <AriaLiveProvider>
                  <Routes>
                    <Route element={<RequireAuth />}>
                      <Route
                        path="/admin"
                        element={
                          <RequireAdmin>
                            <AdminDashboard />
                          </RequireAdmin>
                        }
                      />
                    </Route>
                    <Route path="*" element={<AppShell />} />
                  </Routes>
                </AriaLiveProvider>
              </ConfirmProvider>
            </ToastProvider>
          </ConfigProvider>
        </TrackerMount>
      </AuthProvider>
    </BrowserRouter>
  );
}
