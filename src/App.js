import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppShell from "components/layout/AppShell/AppShell";
import AdminDashboard from "pages/admin/AdminDashboard";
import RequireAuth from "components/auth/RequireAuth";
import RequireAdmin from "components/auth/RequireAdmin";
import { AuthProvider } from "context/AuthContext";
import { ConfigProvider } from "context/ConfigContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfigProvider>
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
        </ConfigProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
