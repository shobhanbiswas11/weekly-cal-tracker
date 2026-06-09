# iOS Build & Deployment Checklist

Reusable checklist for building and deploying the iOS app to a test device or App Store Connect.

---

## 1. Release Build for Test Device

- [ ] Prebuild with development environment:
  ```bash
  NODE_ENV=development npx expo prebuild --clean
  ```
- [ ] Install pods:
  ```bash
  cd ios && pod install && cd ..
  ```
- [ ] Open workspace in Xcode:
  ```bash
  open ios/WeeklyHealth.xcworkspace
  ```
- [ ] **Connect iPhone** to Mac via USB → Tap "Trust" on phone if prompted
- [ ] **Select device as destination:**
  - Top center toolbar → click device dropdown (right side of `WeeklyHealth > ...`)
  - Under **iOS Devices**, select your physical iPhone
- [ ] **Set signing team:**
  - Left sidebar → folder icon (first tab) → click **WeeklyHealth** project (blue icon)
  - Click **WeeklyHealth** target under "TARGETS"
  - Click **Signing & Capabilities** tab
  - Check **Automatically manage signing**
  - Set **Team** to your Apple Developer account
- [ ] **Set Build Configuration to Release:**
  - Top menu: **Product → Scheme → Edit Scheme...**
  - Left sidebar of dialog → click **Run**
  - **Info** tab → **Build Configuration** dropdown → change to `Release`
  - Click **Close**
- [ ] **Build and install:** Press **⌘R** (or Product → Run)
- [ ] Wait for build → app installs and launches on phone

---

## 2. Release Build for App Store Connect

### Pre-flight

- [ ] Bump `version` and/or `ios.buildNumber` in `app.json` if needed:
  ```json
  "version": "1.0.1",
  "ios": {
    "buildNumber": "4"
  }
  ```

### Build

- [ ] Prebuild with production environment:
  ```bash
  NODE_ENV=production npx expo prebuild --clean
  ```
- [ ] Install pods:
  ```bash
  cd ios && pod install && cd ..
  ```
- [ ] Open workspace in Xcode:
  ```bash
  open ios/WeeklyHealth.xcworkspace
  ```
- [ ] **Select "Any iOS Device" as destination:**
  - Top center toolbar → device dropdown → select **Any iOS Device (arm64)**
  - ⚠️ Do NOT select a simulator or connected physical device
- [ ] **Set signing team:**
  - Left sidebar → folder icon → click **WeeklyHealth** project
  - Click **WeeklyHealth** target → **Signing & Capabilities** tab
  - Check **Automatically manage signing**
  - Set **Team** to your Apple Developer account (must be enrolled, $99/year)

### Archive & Upload

- [ ] **Archive:** Top menu → **Product → Archive** → wait for build to complete
- [ ] Organizer window opens automatically with your archive selected
- [ ] Click **Distribute App**
- [ ] Select **App Store Connect** → Next
- [ ] Select **Upload** → Next
- [ ] Keep all checkboxes as default → Next
- [ ] Select **Automatically manage signing** → Next
- [ ] Review summary → click **Upload**
- [ ] Wait for upload to finish

### After Upload (~15-30 min for Apple to process)

- [ ] Go to [App Store Connect](https://appstoreconnect.apple.com)
- [ ] Navigate to **My Apps → Weekly Health**
- [ ] Check **TestFlight** tab → build appears once processing is done
- [ ] Or go to **App Store** tab → add the build to a version for submission
