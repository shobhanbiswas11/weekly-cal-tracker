import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { ProtectedRoute, UnProtectedRoute } from "./components/auth";
import { ErrorBoundary } from "./components/error-boundary";
import { Header } from "./components/layout/Header";
import ChatPage from "./pages/chat";
import DailyPage from "./pages/daily";
import { PageHome } from "./pages/home";
import { LoadingSkeleton } from "./pages/home/loading-skeleton";
import SSOCallbackPage from "./pages/sso-callback";
import WeeklyPage from "./pages/weekly";
import WelcomePage from "./pages/welcome";

const PageFallback = () => (
  <div className="p-4 text-sm text-muted-foreground">Loading...</div>
);

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
            <ErrorBoundary>
              <Routes>
                <Route
                  path="/"
                  element={
                    <Suspense fallback={<LoadingSkeleton />}>
                      <PageHome />
                    </Suspense>
                  }
                />
                <Route path="/chat" element={<ChatPage />} />
                <Route
                  path="/daily"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <DailyPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/weekly"
                  element={
                    <Suspense fallback={<PageFallback />}>
                      <WeeklyPage />
                    </Suspense>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}

export default App;
