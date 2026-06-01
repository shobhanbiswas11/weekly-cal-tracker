import {
  ENTITLEMENT_ID,
  configureRevenueCat,
  identifyUser,
} from "@/lib/revenuecat";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
  PurchasesPackage,
} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

export interface SubscriptionContextType {
  isProUser: boolean;
  isLoading: boolean;
  activeSubscription: string | undefined;
  expirationDate: string | null;
  presentPaywall: () => Promise<boolean>;
  presentPaywallIfNeeded: () => Promise<boolean>;
  manageSubscription: () => Promise<void>;
  restorePurchases: () => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionContextType | null>(
  null,
);

interface SubscriptionProviderProps {
  children: React.ReactNode;
  userId?: string | null;
}

export function SubscriptionProvider({
  children,
  userId,
}: SubscriptionProviderProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isProUser = useMemo(() => {
    return customerInfo?.entitlements.active[ENTITLEMENT_ID] !== undefined;
  }, [customerInfo]);

  useEffect(() => {
    async function init() {
      try {
        await configureRevenueCat(userId ?? undefined);

        if (userId) {
          await identifyUser(userId);
        }

        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);

        const offers = await Purchases.getOfferings();
        setOfferings(offers);
      } catch (e) {
        console.error("[RevenueCat] Initialization error:", e);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [userId]);

  // Listen for customer info updates
  useEffect(() => {
    const handler = (info: CustomerInfo) => {
      setCustomerInfo(info);
    };

    Purchases.addCustomerInfoUpdateListener(handler);

    return () => {
      Purchases.removeCustomerInfoUpdateListener(handler);
    };
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (e) {
      console.error("[RevenueCat] Failed to refresh customer info:", e);
    }
  }, []);

  const presentPaywall = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RevenueCatUI.presentPaywall();

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshCustomerInfo();
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
        default:
          return false;
      }
    } catch (e) {
      console.error("[RevenueCat] Failed to present paywall:", e);
      return false;
    }
  }, [refreshCustomerInfo]);

  const presentPaywallIfNeeded = useCallback(async (): Promise<boolean> => {
    try {
      const result = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: ENTITLEMENT_ID,
      });

      switch (result) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          await refreshCustomerInfo();
          return true;
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
        case PAYWALL_RESULT.CANCELLED:
        default:
          return false;
      }
    } catch (e) {
      console.error("[RevenueCat] Failed to present paywall:", e);
      return false;
    }
  }, [refreshCustomerInfo]);

  const presentCustomerCenter = useCallback(async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (e) {
      console.error("[RevenueCat] Failed to present customer center:", e);
    }
  }, []);

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        const { customerInfo: info } = await Purchases.purchasePackage(pkg);
        setCustomerInfo(info);
        return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      } catch (e: any) {
        if (e.userCancelled) {
          return false;
        }
        console.error("[RevenueCat] Purchase failed:", e);
        throw e;
      }
    },
    [],
  );

  const restorePurchases = useCallback(async (): Promise<CustomerInfo> => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return info;
    } catch (e) {
      console.error("[RevenueCat] Restore failed:", e);
      throw e;
    }
  }, []);

  const manageSubscription = presentCustomerCenter;

  const activeSubscription = customerInfo?.activeSubscriptions?.[0];
  const expirationDate =
    customerInfo?.entitlements.active[ENTITLEMENT_ID]?.expirationDate ?? null;

  const restorePurchasesWrapped = useCallback(async () => {
    await restorePurchases();
  }, [restorePurchases]);

  const value: SubscriptionContextType = useMemo(
    () => ({
      isProUser,
      isLoading,
      activeSubscription,
      expirationDate,
      presentPaywall,
      presentPaywallIfNeeded,
      manageSubscription,
      restorePurchases: restorePurchasesWrapped,
    }),
    [
      isProUser,
      isLoading,
      activeSubscription,
      expirationDate,
      presentPaywall,
      presentPaywallIfNeeded,
      manageSubscription,
      restorePurchasesWrapped,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}
