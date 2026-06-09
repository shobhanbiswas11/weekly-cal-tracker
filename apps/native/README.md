# Weekly Health

A React Native (Expo) iOS app that helps users track their weekly calorie intake and health metrics. Features AI-powered chat for nutrition guidance and a subscription model for premium features.

## Tech Stack

- **Framework:** Expo (React Native)
- **Auth:** Clerk
- **Payments:** RevenueCat (App Store subscriptions)
- **AI Chat:** Custom AI SDK integration
- **Styling:** NativeWind (Tailwind for RN)
- **Navigation:** Expo Router (file-based)
- **Storage:** expo-sqlite, expo-secure-store

## App Info

| Field     | Value                        |
| --------- | ---------------------------- |
| Bundle ID | `com.botobrain.weeklyhealth` |
| App Name  | Weekly Health                |
| Scheme    | `native`                     |

## Getting Started

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start Metro bundler
pnpm start:native

# Run on iOS simulator
pnpm start:native:ios

# Prebuild (for native modules)
pnpm prebuild-clean:native
```

## Build & Deploy

See [checklist/ios-build-deployment.md](checklist/ios-build-deployment.md) for step-by-step build instructions.

## Subscriptions

See [checklist/revenuecat-appstore-setup.md](checklist/revenuecat-appstore-setup.md) for RevenueCat + App Store Connect setup.
