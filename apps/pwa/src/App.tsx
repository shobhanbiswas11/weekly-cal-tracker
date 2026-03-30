import { Navigate, Route, Routes } from "react-router";
import { Header } from "./components/layout/Header";
import ChatPage from "./pages/chat";
import DailyPage from "./pages/daily";
import HomePage from "./pages/home";
import WeeklyPage from "./pages/weekly";

function App() {
  return (
    <div className="flex flex-col h-dvh">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/daily" element={<DailyPage />} />
        <Route path="/weekly" element={<WeeklyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
