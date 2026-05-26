import { BrowserRouter } from "react-router-dom";
import AppShell from "components/layout/AppShell/AppShell";
import { AuthProvider } from "context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  );
}
