import { ClerkProvider } from "@clerk/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

// Register service worker
registerSW({ immediate: true });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "oklch(0.7 0.2 145)",
          colorBackground: "oklch(0.15 0.02 260)",
          colorText: "oklch(0.95 0.01 260)",
          colorInputBackground: "oklch(0.2 0.02 260)",
          colorInputText: "oklch(0.95 0.01 260)",
        },
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
);
