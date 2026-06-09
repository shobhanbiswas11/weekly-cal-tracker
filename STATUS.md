# Weekly Health — Task List

> Phases are ordered. Check off as you go.

---

## Phase 1 — Foundation

- [x] Fix splash screen
- [x] Increase logo stroke width
- [x] Add bottom tab navigation _(future: native tabs is a good-to-have)_
- [ ] Fix duplicate agent calls on send

---

## Phase 2 — Core Pages

- [x] Dashboard page
- [x] Daily View page
- [x] Weekly View page
- [x] Profile screen

---

## Phase 3 — Dashboard Enhancements

- [x] ℹ️ button on calorie ring — explain how calculation works
- [x] Day tap → popup with day details
- [x] Nutrient tap → macro source modal
- [x] Weekly ℹ️ button

---

## Phase 4 — Chat

- [x] Swipe-down to dismiss chat modal
- [x] Chat history — last 5 conversations on device
- [x] Archive icon → select previous thread _(requires chat history first)_

---

## Phase 5 — Profile & Settings

- [x] Edit profile (without chat)
- [ ] Edit daily calorie / macro goals
- [x] Logout
- [ ] App appearance — theme toggle (light / dark / system)
- [x] Delete account
- [x] Privacy Policy & Terms of Service links
- [x] App version / About
- [x] Interactive onboarding flow _(requires edit profile first)_

---

## Phase 6 — UX Polish

- [x] Pull-to-refresh
- [ ] Edit / delete meal entries via UI (swipe or long-press)
- [ ] Empty states for no-data screens
- [ ] Loading skeletons
- [ ] Haptic feedback on chat FAB
- [ ] Error boundaries & friendly messages
- [ ] Offline / network error handling
- [ ] Push notification reminders

---

## Phase 7 — Auth & Release

- [x] Chat memory / context
- [x] Add Apple Sign-In
- [ ] Clerk production keys — Google + Apple _(requires Apple Sign-In first)_
- [ ] Android build & testing
- [ ] Error logging (Sentry or similar)
- [ ] Force update mechanism

---

## Phase 8 — iOS App Store Submission

### Must Have

- [x] Add Apple Sign-In (entitlement exists, must implement or remove)
- [x] ~~Fix iOS icon~~ — intentional (dark icon as default)
- [x] Verify privacy policy URL is live (`botobrain.com/privacy`)
- [x] Verify terms of service URL is live (`botobrain.com/terms`)
- [ ] Configure RevenueCat products in App Store Connect (yearly + monthly)
- [ ] Ensure "Restore Purchases" flow works correctly
- [ ] Clerk production keys configured
- [ ] App Store Connect metadata (description, keywords, category)
- [ ] Screenshots for required device sizes (6.7", 6.5", 5.5")
- [ ] Age rating questionnaire
- [ ] Provide demo account for Apple review team
- [ ] Test full purchase + restore flow on TestFlight

### Good to Have

- [ ] Fix duplicate agent calls on send (Phase 1 leftover)
- [ ] Remove dev-only plist entries (`NSLocalNetworkUsageDescription`, `NSBonjourServices`)
- [ ] Remove `exp+weekly-health` URL scheme (Expo Go artifact)
- [ ] Empty states for no-data screens
- [ ] Error boundaries & friendly messages
- [ ] Loading skeletons
- [ ] App preview video for App Store listing

