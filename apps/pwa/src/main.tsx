import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { ChatRuntimeProvider } from "./features/chat/chat-runtime-provider.tsx";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ChatRuntimeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ChatRuntimeProvider>
  </QueryClientProvider>,
);
