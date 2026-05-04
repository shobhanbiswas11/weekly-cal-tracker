import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { ProtectedRoute, UnProtectedRoute } from "./components/auth";
import { ErrorBoundary } from "./components/error-boundary";
import { Header } from "./components/layout/Header";
import { PageChat } from "./pages/chat";
import { LoaderPageHome, PageHome } from "./pages/home";
import { PageSSOCallback } from "./pages/sso";
import { PageWelcome } from "./pages/welcome";

function App() {
  const location = useLocation();

  // Handle SSO callback separately (outside auth guards)
  if (location.pathname === "/sso-callback") {
    return <PageSSOCallback />;
  }

  return (
    <>
      <UnProtectedRoute>
        <PageWelcome />
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
                    <Suspense fallback={<LoaderPageHome />}>
                      <PageHome />
                    </Suspense>
                  }
                />
                <Route path="/chat" element={<PageChat />} />
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
