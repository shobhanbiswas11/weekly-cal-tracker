import Purchases, { LOG_LEVEL } from "react-native-purchases";

const REVENUECAT_API_KEY = "test_GXBaSpvLZndmmlhtrOvJxdHpVUb";

export const ENTITLEMENT_ID = "Weekly Health Pro";

export const PRODUCT_IDS = {
  yearly: "yearly",
  monthly: "monthly",
} as const;

let isConfigured = false;

export async function configureRevenueCat(userId?: string) {
  if (isConfigured) return;

  Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

  Purchases.configure({
    apiKey: REVENUECAT_API_KEY,
    appUserID: userId ?? undefined,
  });

  isConfigured = true;
}

export async function identifyUser(userId: string) {
  try {
    const { customerInfo } = await Purchases.logIn(userId);
    return customerInfo;
  } catch (e) {
    console.error("[RevenueCat] Failed to identify user:", e);
    throw e;
  }
}

export async function logOutUser() {
  try {
    const customerInfo = await Purchases.logOut();
    return customerInfo;
  } catch (e) {
    console.error("[RevenueCat] Failed to log out user:", e);
    throw e;
  }
}
