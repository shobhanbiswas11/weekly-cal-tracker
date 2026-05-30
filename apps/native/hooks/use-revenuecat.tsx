import { RevenueCatContext } from "@/components/revenuecat-provider";
import { useContext } from "react";

export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  }
  return context;
}
