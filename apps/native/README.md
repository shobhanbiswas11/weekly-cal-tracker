# Weekly Health - iOS Builds

## 1. Release Build for Test Device

1. Prebuild with development environment:

   ```bash
   NODE_ENV=development npx expo prebuild --clean
   ```

2. Install pods:

   ```bash
   cd ios && pod install && cd ..
   ```

3. Open workspace in Xcode:

   ```bash
   open ios/WeeklyHealth.xcworkspace
   ```

4. **Connect your iPhone** to your Mac via USB. Tap "Trust" on your phone if prompted.

5. **Select your device as destination:**
   - Look at the **top center toolbar** in Xcode — you'll see something like `WeeklyHealth > iPhone 16 Pro`
   - Click the right part (device name) to open a dropdown
   - Under **iOS Devices**, select your physical iPhone

6. **Set signing team:**
   - In the **left sidebar** (Navigator), click the **folder icon** (first tab) at the top
   - Click the **WeeklyHealth** project (blue icon, top of the file tree)
   - In the main area, click the **WeeklyHealth** target under "TARGETS" (left column)
   - Click the **Signing & Capabilities** tab (top of the main area)
   - Check **Automatically manage signing**
   - In the **Team** dropdown, select your Apple Developer account

7. **Set Build Configuration to Release:**
   - In the **top menu bar**: **Product → Scheme → Edit Scheme...**
   - A dialog opens. In the left sidebar of the dialog, click **Run**
   - In the **Info** tab, find **Build Configuration** dropdown
   - Change from `Debug` to `Release`
   - Click **Close**

8. **Build and install on device:**
   - Press **⌘R** (or top menu: **Product → Run**)
   - Wait for the build to complete — the app will install and launch on your phone

---

## 2. Release Build for App Store Connect

1. Bump `version` and/or `ios.buildNumber` in `app.json` if needed:

   ```json
   "version": "1.0.1",
   "ios": {
     "buildNumber": "3"
   }
   ```

2. Prebuild with production environment:

   ```bash
   NODE_ENV=production npx expo prebuild --clean
   ```

3. Install pods:

   ```bash
   cd ios && pod install && cd ..
   ```

4. Open workspace in Xcode:

   ```bash
   open ios/WeeklyHealth.xcworkspace
   ```

5. **Select "Any iOS Device" as destination:**
   - Top center toolbar — click the device dropdown (right side of `WeeklyHealth > ...`)
   - At the very top of the list, select **Any iOS Device (arm64)**
   - (Do NOT select a simulator or a connected physical device)

6. **Set signing team:**
   - Left sidebar → click **folder icon** (first tab)
   - Click **WeeklyHealth** project (blue icon at top of file tree)
   - Click **WeeklyHealth** target under "TARGETS"
   - Click **Signing & Capabilities** tab
   - Check **Automatically manage signing**
   - Set **Team** to your Apple Developer account (must be enrolled in Apple Developer Program, $99/year)

7. **Archive the app:**
   - Top menu bar: **Product → Archive**
   - Wait for the build to complete (may take a few minutes)
   - When done, the **Organizer** window opens automatically

8. **Upload to App Store Connect:**
   - In the Organizer window, your new archive is selected
   - Click **Distribute App** (right side)
   - Select **App Store Connect** → click **Next**
   - Select **Upload** → click **Next**
   - Keep all checkboxes as default → click **Next**
   - Select **Automatically manage signing** → click **Next**
   - Review the summary → click **Upload**
   - Wait for the upload to finish (progress bar shows)

9. **After upload (~15-30 min for Apple to process):**
   - Go to [App Store Connect](https://appstoreconnect.apple.com)
   - Navigate to **My Apps → Weekly Health**
   - Go to **TestFlight** tab — your build will appear once processing is done
   - Or go to **App Store** tab → add the build to a version for submission
