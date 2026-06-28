# E2E Testing Conventions (Maestro + React Native iOS)

## Selectors — Priority Order

1. **`id` (testID)** — Use for all inputs, buttons, and screens. Most reliable.
2. **Plain text** — Only for simple `<Text>` elements NOT inside Pressable/Touchable wrappers.
3. **Never use text inside Pressables** — Maestro can't find it (iOS swallows accessibility).

## Keyboard Dismissal (iOS)

`hideKeyboard` is broken on iOS (official known issue). Instead:

```yaml
- tapOn:
    id: "form-scroll-view"   # tap the ScrollView/form container
```

- Tap a non-interactive element **inside the ScrollView** (not the header).
- `keyboardShouldPersistTaps="handled"` dismisses keyboard when tapping non-responder areas within the ScrollView.
- Tapping elements outside the ScrollView (like nav headers) does NOT dismiss the keyboard.

## After Text Input — Always Dismiss Keyboard

```yaml
- tapOn:
    id: "input-field"
- inputText: "value"
- tapOn:
    id: "form-container"    # dismiss keyboard before next action
```

Without this, the next `tapOn` may fail because the target is behind the keyboard.

## Assertions

| Scenario                    | Use                                       |
| --------------------------- | ----------------------------------------- |
| After navigation / API call | `extendedWaitUntil` with `timeout: 15000` |
| Element always on screen    | `assertVisible` (7s default timeout)      |
| Text inside Pressable/Modal | Add `testID`, assert by `id`              |

## scrollUntilVisible

- Only use when the element is genuinely off-screen (e.g., bottom of a long form).
- Do NOT use when keyboard is hiding the element — dismiss keyboard first, then tap directly.
- The element must be findable in the accessibility tree for `scrollUntilVisible` to work.

## testID Naming

- Inputs: `input-{field}` (e.g., `input-name`, `input-height`)
- Buttons: `{action}-button` (e.g., `save-vitals-button`, `setup-vitals-button`)
- Screens/Containers: `{name}-screen` or `{name}-form` (e.g., `dashboard-screen`, `vitals-form`)

## Adding testIDs in React Native

- `<TextInput testID="..." />` — works directly
- `<Pressable testID="..." />` — works directly
- Custom components (Button, InputRow) — must explicitly accept and forward `testID` prop
- `<ScrollView testID="..." />` — use as keyboard dismiss target
