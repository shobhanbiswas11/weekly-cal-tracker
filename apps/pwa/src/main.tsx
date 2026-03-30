import { TooltipProvider } from "@/components/ui/tooltip";
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
        baseTheme: undefined,
        variables: {
          colorPrimary: "#a3e635",
          colorBackground: "#18181b",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
          colorInputBackground: "#27272a",
          colorInputText: "#fafafa",
          colorNeutral: "#fafafa",
          colorDanger: "#ef4444",
          colorSuccess: "#22c55e",
          borderRadius: "0.5rem",
          fontFamily: "'Geist Variable', sans-serif",
        },
        elements: {
          rootBox: "w-full",
          card: "bg-zinc-900 border border-zinc-800 shadow-xl",
          headerTitle: "text-zinc-50 text-xl font-semibold",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton:
            "bg-zinc-800 border border-zinc-700 text-zinc-50 hover:bg-zinc-700 transition-colors",
          socialButtonsBlockButtonText: "text-zinc-50 font-medium",
          dividerLine: "bg-zinc-700",
          dividerText: "text-zinc-500",
          formFieldLabel: "text-zinc-300",
          formFieldInput:
            "bg-zinc-800 border-zinc-700 text-zinc-50 placeholder:text-zinc-500 focus:border-lime-500 focus:ring-lime-500/20",
          formButtonPrimary:
            "bg-lime-500 hover:bg-lime-600 text-zinc-900 font-semibold",
          footerActionText: "text-zinc-400",
          footerActionLink: "text-lime-400 hover:text-lime-300",
          identityPreviewText: "text-zinc-50",
          identityPreviewEditButton: "text-lime-400",
          userButtonPopoverCard: "bg-zinc-900 border border-zinc-800",
          userButtonPopoverActionButton: "text-zinc-300 hover:bg-zinc-800",
          userButtonPopoverActionButtonText: "text-zinc-300",
          userButtonPopoverFooter: "border-zinc-800",
          userPreviewMainIdentifier: "text-zinc-50",
          userPreviewSecondaryIdentifier: "text-zinc-400",
        },
      }}
    >
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ClerkProvider>
  </StrictMode>,
);
