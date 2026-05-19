# Project Status — Weekly Calorie Tracker

> Production Release Tracker

---

## Execution Roadmap

> Phases are sequential. Tasks within a phase can be done in parallel unless noted.

### Phase 1 — Foundation & Quick Fixes

| Task                              | From Bucket           | Parallel?                   |
| --------------------------------- | --------------------- | --------------------------- |
| Fix splash screen                 | Bug Fixes / UI Polish | ✅ Yes                       |
| Increase logo stroke width        | UI Polish             | ✅ Yes                       |
| Fix duplicate agent calls on send | Bug Fixes / Chat      | ✅ Yes                       |
| Add bottom tab navigation         | Navigation            | ❌ No — blocks Phase 2 pages |

### Phase 2 — Core Pages

| Task                          | From Bucket        | Parallel?              |
| ----------------------------- | ------------------ | ---------------------- |
| Build Daily View page         | Navigation         | ✅ Yes (all 3 parallel) |
| Build Weekly View page        | Navigation         | ✅ Yes                  |
| Profile screen with info list | Profile & Settings | ✅ Yes                  |

### Phase 3 — Dashboard & Page Enhancements 

| Task                              | From Bucket        | Parallel?            |
| --------------------------------- | ------------------ | -------------------- |
| ℹ️ button on main calorie ring     | Dashboard          | ✅ Yes (all parallel) |
| Day tap → popup with day details  | Dashboard          | ✅ Yes                |
| Nutrient tap → macro source modal | Dashboard          | ✅ Yes                |
| Weekly ℹ️ button                   | Profile & Settings | ✅ Yes                |
| Edit/delete meal entries via UI   | UX & Reliability   | ✅ Yes                |
| Empty states for no-data screens  | Onboarding         | ✅ Yes                |

### Phase 4 — Chat Improvements

| Task                                  | From Bucket | Parallel?                      |
| ------------------------------------- | ----------- | ------------------------------ |
| Swipe-down to dismiss chat modal      | Chat & AI   | ✅ Yes (all parallel)           |
| Chat history — last 5 on device       | Chat & AI   | ✅ Yes                          |
| Archive icon → select previous thread | Chat & AI   | ❌ No — depends on chat history |

### Phase 5 — Profile, Settings & Onboarding

| Task                           | From Bucket        | Parallel?                                 |
| ------------------------------ | ------------------ | ----------------------------------------- |
| Edit profile (without chat)    | Profile & Settings | ✅ Yes (all parallel)                      |
| Edit daily calorie/macro goals | Profile & Settings | ✅ Yes                                     |
| Logout functionality           | Profile & Settings | ✅ Yes                                     |
| App appearance (theme toggle)  | Profile & Settings | ✅ Yes                                     |
| Delete account                 | Profile & Settings | ✅ Yes                                     |
| Privacy Policy & Terms links   | Profile & Settings | ✅ Yes                                     |
| App version / About            | Profile & Settings | ✅ Yes                                     |
| Interactive onboarding flow    | Onboarding         | ❌ No — depends on profile edit being done |

### Phase 6 — UX Polish

| Task                                 | From Bucket      | Parallel?            |
| ------------------------------------ | ---------------- | -------------------- |
| Loading skeletons                    | UI Polish        | ✅ Yes (all parallel) |
| Haptic feedback on chat FAB          | UI Polish        | ✅ Yes                |
| Error boundaries & friendly messages | UX & Reliability | ✅ Yes                |
| Offline / network error handling     | UX & Reliability | ✅ Yes                |
| Push notification reminders          | UX & Reliability | ✅ Yes                |

### Phase 7 — Auth & Release

| Task                                   | From Bucket    | Parallel?                       |
| -------------------------------------- | -------------- | ------------------------------- |
| Add Apple Sign-In                      | Auth & Release | ❌ No — do first in this phase   |
| Clerk production keys (Google + Apple) | Auth & Release | ❌ No — depends on Apple Sign-In |
| Android build & testing                | Auth & Release | ✅ Yes — parallel with above     |
| Error logging service (Sentry)         | Observability  | ✅ Yes                           |
| Force update mechanism                 | Observability  | ✅ Yes                           |

---

## 👉 Next Up

**Phase 1** — Start with these 4 tasks in parallel:
1. Fix splash screen
2. Increase logo stroke width
3. Fix duplicate agent calls
4. Add bottom tab navigation (critical path — blocks everything else)

---

## Summary

| Bucket                   | Total  | Done  | In Progress | Remaining |
| ------------------------ | ------ | ----- | ----------- | --------- |
| UI Polish & Branding     | 4      | 0     | 0           | 4         |
| Dashboard Enhancements   | 3      | 0     | 0           | 3         |
| Navigation & Routing     | 4      | 1     | 0           | 3         |
| Profile & Settings       | 9      | 0     | 0           | 9         |
| Chat & AI                | 5      | 1     | 0           | 4         |
| Onboarding               | 2      | 0     | 0           | 2         |
| UX & Reliability         | 5      | 1     | 0           | 4         |
| Auth & Release Readiness | 3      | 0     | 0           | 3         |
| Observability            | 2      | 0     | 0           | 2         |
| Bug Fixes                | 2      | 0     | 0           | 2         |
| **Total**                | **39** | **3** | **0**       | **36**    |

---

## 🎨 UI Polish & Branding

| #   | Task                        | Status | Notes                                    |
| --- | --------------------------- | ------ | ---------------------------------------- |
| 1   | Increase logo stroke width  | ⬜ Todo | Customize logo SVG for better visibility |
| 2   | Fix splash screen           | ⬜ Todo | Splash screen not working properly       |
| 3   | Haptic feedback on chat FAB | ⬜ Todo | Add haptic when user taps chat button    |
| 4   | Loading skeletons           | ⬜ Todo | Skeleton placeholders during data fetch  |

---

## 📊 Dashboard Enhancements

| #   | Task                                          | Status | Notes                                                                    |
| --- | --------------------------------------------- | ------ | ------------------------------------------------------------------------ |
| 1   | Add ℹ️ button on main calorie ring             | ⬜ Todo | On tap → show how calculation is done                                    |
| 2   | Day tap in week view → popup with day details | ⬜ Todo | Click a day inside the week → modal with breakdown                       |
| 3   | Nutrient tap → macro source modal             | ⬜ Todo | Click protein/carbs/fat → modal showing which meals contributed how much |

---

## 🧭 Navigation & Routing

| #   | Task                      | Status | Notes                                   |
| --- | ------------------------- | ------ | --------------------------------------- |
| 1   | Add bottom tab navigation | ⬜ Todo | Tabs: Dashboard, Daily, Weekly, Profile |
| 2   | Build Daily View page     | ⬜ Todo | Full daily breakdown view               |
| 3   | Build Weekly View page    | ⬜ Todo | Full weekly breakdown view              |
| 4   | Dashboard page (existing) | ✅ Done | Already implemented                     |

---

## 👤 Profile & Settings

| #   | Task                                    | Status | Notes                                            |
| --- | --------------------------------------- | ------ | ------------------------------------------------ |
| 1   | Profile screen with info list           | ⬜ Todo | Show "My Profile" item → stored profile data     |
| 2   | Edit profile (without chat)             | ⬜ Todo | Direct form to update name, weight, height, etc. |
| 3   | Edit daily calorie/macro goals          | ⬜ Todo | Manual override of AI-calculated targets         |
| 4   | Logout functionality                    | ⬜ Todo | Clerk sign-out integration                       |
| 5   | Delete account                          | ⬜ Todo | Required for App Store / Play Store compliance   |
| 6   | App appearance setting                  | ⬜ Todo | Light / Dark / System Default theme toggle       |
| 7   | Privacy Policy & Terms of Service links | ⬜ Todo | Required for store submission                    |
| 8   | App version / About                     | ⬜ Todo | Show version number, useful for support          |
| 9   | Weekly ℹ️ button on week dashboard       | ⬜ Todo | Explain how weekly calculation works             |

---

## 💬 Chat & AI

| #   | Task                                                     | Status | Notes                                          |
| --- | -------------------------------------------------------- | ------ | ---------------------------------------------- |
| 1   | Chat history — store last 5 conversations on device      | ⬜ Todo | Local storage only, no backend                 |
| 2   | Archive icon (top-left of chat) → select previous thread | ⬜ Todo | Let user switch between saved conversations    |
| 3   | Swipe-down to dismiss chat modal                         | ⬜ Todo | Replace current full modal with swipe-to-close |
| 4   | Fix duplicate agent calls on send                        | ⬜ Todo | Bug: agent called twice per food log message   |
| 5   | Add memory/context to chat                               | ✅ Done | Conversations retain context within a thread   |

---

## 🚀 Onboarding

| #   | Task                             | Status | Notes                                                        |
| --- | -------------------------------- | ------ | ------------------------------------------------------------ |
| 1   | Interactive onboarding flow      | ⬜ Todo | Triggered when no profile exists; guided setup wizard        |
| 2   | Empty states for no-data screens | ⬜ Todo | Friendly UI when no meals logged yet (dashboard, daily, etc) |

---

## 🛡️ UX & Reliability

| #   | Task                                      | Status | Notes                                                                                         |
| --- | ----------------------------------------- | ------ | --------------------------------------------------------------------------------------------- |
| 1   | Error boundaries & user-friendly messages | ⬜ Todo | Graceful fallback on crashes / API failures                                                   |
| 2   | Offline / network error handling          | ⬜ Todo | Detect connectivity, show retry UI                                                            |
| 3   | Pull-to-refresh                           | ✅ Done | Already implemented                                                                           |
| 4   | Push notification reminders               | ⬜ Todo | "Log your lunch" nudges to build habit                                                        |
| 5   | Edit/delete meal entries via UI           | ⬜ Todo | Manual edit/delete from Daily/Dashboard view (swipe or long-press) without going through chat |

---

## � Auth & Release Readiness

| #   | Task                                   | Status | Notes                                              |
| --- | -------------------------------------- | ------ | -------------------------------------------------- |
| 1   | Add Apple Sign-In                      | ⬜ Todo | Required for iOS App Store submission              |
| 2   | Clerk production keys (Google + Apple) | ⬜ Todo | Replace dev keys with production OAuth credentials |
| 3   | Android build & testing                | ⬜ Todo | Test full app flow on Android device/emulator      |

---

## �📡 Observability

| #   | Task                   | Status | Notes                                                    |
| --- | ---------------------- | ------ | -------------------------------------------------------- |
| 1   | Error logging service  | ⬜ Todo | Integrate Sentry / Bugsnag / similar for crash reporting |
| 2   | Force update mechanism | ⬜ Todo | Push critical updates to users when needed               |

---

## 🐛 Bug Fixes

| #   | Task                               | Status | Notes                                    |
| --- | ---------------------------------- | ------ | ---------------------------------------- |
| 1   | Splash screen not loading properly | ⬜ Todo | Investigate and fix                      |
| 2   | Agent double-invocation on send    | ⬜ Todo | Duplicate tool calls for single food log |



