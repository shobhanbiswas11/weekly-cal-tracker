import { Navigate, Route, Routes, useLocation } from "react-router";
import { ProtectedRoute, UnProtectedRoute } from "./components/auth";
import { Header } from "./components/layout/Header";
import ChatPage from "./pages/chat";
import DailyPage from "./pages/daily";
import HomePage from "./pages/home";
import SSOCallbackPage from "./pages/sso-callback";
import WeeklyPage from "./pages/weekly";
import WelcomePage from "./pages/welcome";

function App() {
  const location = useLocation();

  // Handle SSO callback separately (outside auth guards)
  if (location.pathname === "/sso-callback") {
    return <SSOCallbackPage />;
  }

  return (
    <>
      <UnProtectedRoute>
        <WelcomePage />
      </UnProtectedRoute>
      <ProtectedRoute>
        <div className="flex flex-col h-dvh">
          <Header />
          <div className="flex-1 min-h-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/daily" element={<DailyPage />} />
              <Route path="/weekly" element={<WeeklyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}

export default App;
