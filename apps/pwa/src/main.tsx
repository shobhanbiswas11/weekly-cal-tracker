import { ClerkProvider } from "@clerk/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ApiProvider } from "@weekly-cal/frontend";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.tsx";
import { useCreateApiClient } from "./hooks/use-create-api-client";
import "./index.css";
import { queryClient } from "./lib/query-client";
import { ChatRuntimeProvider } from "./pages/chat";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in environment");
}

function ApiProviderBridge({ children }: { children: React.ReactNode }) {
  const client = useCreateApiClient();
  return <ApiProvider client={client}>{children}</ApiProvider>;
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <ApiProviderBridge>
        <ChatRuntimeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ChatRuntimeProvider>
      </ApiProviderBridge>
    </QueryClientProvider>
  </ClerkProvider>,
);
