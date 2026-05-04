import { ClerkProvider } from "@clerk/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import "./index.css";
import { queryClient } from "./lib/query-client";
import { ChatRuntimeProvider } from "./pages/chat";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment");
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <ChatRuntimeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ChatRuntimeProvider>
    </QueryClientProvider>
  </ClerkProvider>,
);
