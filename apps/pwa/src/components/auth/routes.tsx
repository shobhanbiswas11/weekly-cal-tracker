import { Show } from "@clerk/react";
const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === "true";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (bypassAuth) return <>{children}</>;
  return <Show when="signed-in">{children}</Show>;
}

export function UnProtectedRoute({ children }: { children: React.ReactNode }) {
  return <Show when="signed-out">{children}</Show>;
}
