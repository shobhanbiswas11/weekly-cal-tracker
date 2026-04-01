import { SignInButton } from "@clerk/react";
import { Navigate, Route, Routes } from "react-router";
import { ProtectedRoute, UnProtectedRoute } from "./components/auth";
import { Header } from "./components/layout/Header";
import ChatPage from "./pages/chat";
import DailyPage from "./pages/daily";
import HomePage from "./pages/home";
import WeeklyPage from "./pages/weekly";

function App() {
  return (
    <>
      <UnProtectedRoute>
        <SignInButton />
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
