# RevenueCat + App Store Connect Setup Checklist

Reusable step-by-step checklist for connecting RevenueCat with App Store Connect for any iOS app with auto-renewable subscriptions.

---

## Prerequisites

- [ ] Apple Developer Account ($99/year) active
- [ ] App already created in App Store Connect
- [ ] Bundle ID registered (e.g., `com.botobrain.weeklyhealth`)

---

## PART 1: App Store Connect Agreements

- [ ] Sign latest **Paid Applications Agreement** (Business section)
- [ ] Complete all **Tax** forms
- [ ] Link **Bank Account** → status must show "Clear"

> ⚠️ You CANNOT test or sell in-app purchases until all agreements are signed and banking is cleared.

---

## PART 2: Create Subscription Products in App Store Connect ✅

### Create Subscription Group

- [ ] Go to My Apps → [Your App] → Subscriptions (left sidebar)
- [ ] Click **+** next to "Subscription Groups"
- [ ] Enter Reference Name (e.g., `Weekly Health Pro`)
- [ ] Click **Create**

### Create Each Subscription Product

Repeat for each duration (monthly, annual, etc.):

- [ ] Inside the subscription group, click **+** to add a subscription
- [ ] Enter **Reference Name** (e.g., `Weekly Health Pro Monthly`)
- [ ] Enter **Product ID** using naming convention: `<app>_<price>_<duration>_<intro_duration><intro_price>`
  - Example: `weeklyhealth_399_1m`, `weeklyhealth_2999_1y`, `weeklyhealth_999_1m_1w0` (with 1 week free trial)
- [ ] Click **Create**
- [ ] Set **Subscription Duration** (1 Month, 1 Year, etc.) → **Save**
- [ ] Under **Subscription Prices**, click **+**
  - Select base country
  - Choose price (e.g., $3.99, $29.99)
  - Click Next → Apple auto-fills other regions → Create
- [ ] Click **Save**

### Add Localization (per product)

- [ ] In **App Store Information** section, click **+** next to "Localization"
- [ ] Select language (e.g., English U.S.)
- [ ] Enter **Subscription Display Name** (e.g., `Weekly Health Pro`)
  - ⚠️ Use the **same** display name for all products (monthly, annual, etc.). Apple already shows duration/price separately. Don't append "Monthly" or "Annual" — it's redundant and clutters the listing.
- [ ] Enter **Description** (user-facing description of what they get)
- [ ] Click **Save**

### Add Localization to Subscription Group

- [ ] Go to the Subscription Group page
- [ ] Click **+** next to Localizations
- [ ] Select language
- [ ] Enter **Subscription Group Display Name** (e.g., `Weekly Health Pro`)
  - Use the same name as your product display name. This is what users see in their subscription management settings.
- [ ] Choose **App Name** (from App Store listing or custom, e.g., `Weekly Health`)
  - Useful if your App Store title is long like "Weekly Health - Calorie Tracker"; you can shorten it here.
- [ ] Click **Save**

### Add Reviewer Information (per product)

- [ ] Upload **Screenshot** (640 × 920 px) of your paywall
- [ ] Optionally add **Review Notes**
- [ ] Click **Save**

---

## PART 3: Generate In-App Purchase Key (StoreKit 2)

- [ ] Go to [App Store Connect → Users and Access → Integrations → In-App Purchase](https://appstoreconnect.apple.com/access/integrations/api/subs)
- [ ] Click **Generate In-App Purchase Key** (or **+**)
- [ ] Name: `RevenueCat` (or anything descriptive)
- [ ] Click **Generate**
- [ ] **Download the .p8 file immediately** (one-time download only!)
- [ ] Note the **Key ID**
- [ ] Copy the **Issuer ID** from the top of the page
  - If not visible, create any App Store Connect API key first, then it appears

> ⚠️ Store the .p8 file securely. You cannot re-download it.

---

## PART 4: RevenueCat Dashboard Setup

### Create Project & App

- [ ] Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
- [ ] Create a new **Project** (or use existing)
- [ ] Go to **Apps & providers** → click **+ New App**
- [ ] Select **App Store**
- [ ] Enter **App name** and **Bundle ID**

### Upload In-App Purchase Key

- [ ] In your App Store app settings, go to **In-app purchase key configuration** tab
- [ ] Upload the `.p8` file
- [ ] Enter the **Key ID**
- [ ] Enter the **Issuer ID**
- [ ] Click **Save Changes**
- [ ] Verify you see **"Valid credentials"** with all permissions checked

### Get API Key

- [ ] In Apps & providers, click your App Store app
- [ ] Copy the **Public API Key** (starts with `appl_...`)
- [ ] Set as environment variable: `EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxxxx`

---

## PART 5: Configure Products, Entitlements & Offerings in RevenueCat

### Import Products

- [ ] Go to **Product catalog → Products**
- [ ] Click **+ New** → **Import Products**
- [ ] Select your App Store products and import
- [ ] (Manual fallback: **+ New product** → Store: App Store → enter exact Product ID)

### Create Entitlement

- [ ] Go to **Product catalog → Entitlements**
- [ ] Click **+ New**
- [ ] Enter **Identifier** (must match your code, e.g., `Weekly Health Pro`)
- [ ] Click **Save**

### Attach Products to Entitlement

- [ ] Click into your entitlement
- [ ] Click **Attach** → select monthly product → Attach
- [ ] Click **Attach** → select annual product → Attach

### Create Offering

- [ ] Go to **Product catalog → Offerings**
- [ ] Click **+ New**
- [ ] **Identifier:** `default`
- [ ] **Description:** something descriptive
- [ ] Click **Save**
- [ ] Ensure it's set as the **Default Offering**

### Add Packages to Offering

- [ ] Click into your offering
- [ ] Click **+ Add package**
  - Identifier: `$rc_monthly`
  - Attach: monthly product
  - Save
- [ ] Click **+ Add package**
  - Identifier: `$rc_annual`
  - Attach: annual product
  - Save

---

## PART 6: App Code Configuration

### Required in your app code:

```typescript
// Entitlement ID — must match RevenueCat dashboard exactly
export const ENTITLEMENT_ID = "Weekly Health Pro";

// Product IDs — must match App Store Connect exactly
export const PRODUCT_IDS = {
  monthly: "weeklyhealth_399_1m",
  yearly: "weeklyhealth_2999_1y",
} as const;
```

### Environment variable:

```
EXPO_PUBLIC_REVENUECAT_API_KEY=appl_xxxxxxxxxxxxxxxx
```

---

## PART 7: Testing

### Create Sandbox Tester

- [ ] App Store Connect → Users and Access → Sandbox → Test Accounts
- [ ] Click **+** to create a new sandbox tester
- [ ] Use a real email (not your Apple ID)
- [ ] Fill in name, password, region → Create

### Test on Device

- [ ] On iPhone: Settings → App Store → Sandbox Account → sign in with sandbox tester
- [ ] Build and run app on physical device
- [ ] Trigger paywall → make a purchase
- [ ] Verify in RevenueCat dashboard: Customers → entitlement is active

> ⚠️ Sandbox subscriptions renew at accelerated rates (monthly = 5 min, annual = 1 hour)

---

## PART 8: Production Submission

- [ ] Ensure all products show **"Ready to Submit"** in App Store Connect
- [ ] In your app version, under **In-App Purchases and Subscriptions**, click **+** and add all products
- [ ] Submit app for review (Apple reviews app + IAPs together)

---

## Quick Reference Template

| Item                   | Value                   |
| ---------------------- | ----------------------- |
| Bundle ID              | `com.example.yourapp`   |
| Subscription Group     | `Your Pro Group`        |
| Monthly Product ID     | `yourapp_XXX_1m`        |
| Annual Product ID      | `yourapp_XXXX_1y`       |
| RevenueCat Entitlement | `Your Entitlement Name` |
| RevenueCat Offering    | `default`               |
| Monthly Package        | `$rc_monthly`           |
| Annual Package         | `$rc_annual`            |

---

## Naming Convention for Product IDs

```
<app>_<price>_<duration>_<intro_duration><intro_price>
```

- `app`: Unique prefix for your app (can't reuse across apps even if deleted)
- `price`: Price in cents without decimal (e.g., 399 = $3.99)
- `duration`: Subscription period (1m, 3m, 6m, 1y)
- `intro_duration`: Introductory/trial period (1w, 2w, 1m) — omit if none
- `intro_price`: Introductory price in cents, use 0 for free trial — omit if none

Examples:
- `weeklyhealth_399_1m` → $3.99/month, no trial
- `weeklyhealth_2999_1y` → $29.99/year, no trial
- `weeklyhealth_399_1m_1w0` → $3.99/month with 1 week free trial
- `weeklyhealth_2999_1y_3d0` → $29.99/year with 3 day free trial
- `myapp_999_1m_1m499` → $9.99/month with 1 month intro at $4.99

---

## Common Mistakes to Avoid

1. **Not signing Paid Applications Agreement** → products won't work
2. **Product ID typo** → RevenueCat won't find your products
3. **Forgetting to upload .p8 key** → transactions fail silently with StoreKit 2
4. **Entitlement ID mismatch** between code and dashboard → users pay but don't get access
5. **Not attaching products to entitlement** → purchases won't unlock features
6. **Missing localization on products** → can't submit for review
7. **Missing reviewer screenshot** → can't submit for review
8. **Not adding IAPs to app version** → products not included in review
