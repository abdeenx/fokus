# Fokus

Pick one short anchor for your day — a task, goal, quote, or reminder — and Fokus pins it to your iPhone home screen via a native WidgetKit widget that updates the moment you save a new focus.

Fokus is a frontend-only React Native (Expo) app. There is no backend, no database, no auth, and no sync — everything is stored locally with AsyncStorage. The iOS widget reads from the same shared App Group so the home screen always reflects what the app shows.

---

## Run in Expo Go

```bash
npm install
npx expo start
```

Scan the QR code from the Expo Go app on your iPhone. The whole UI works in Expo Go; the iOS home-screen widget itself does **not** appear because WidgetKit extensions require a native build. The JS bridge to the widget silently no-ops in Expo Go, so the app behaves identically minus the home-screen pixels.

---

## Native iOS build (on a physical iPhone)

### Prerequisites

- macOS with **Xcode 15 or newer** installed from the App Store.
- Xcode Command Line Tools — `xcode-select --install`.
- A (free) Apple Developer account, signed in inside **Xcode → Settings → Accounts**.
- An iPhone connected by USB. Tap **Trust** on the iPhone when prompted.

### Build & install

```bash
npm install
chmod +x ios-device.sh
npm run ios:device
```

`ios-device.sh` runs `expo prebuild --platform ios`, installs dependencies, and then `expo run:ios --device`. On first launch you'll need to trust the developer cert on the phone:

> Settings → General → VPN & Device Management → tap your developer profile → Trust.

### Build & install a standalone app

```bash
npx expo run:ios --device --configuration Release
```

For a specific connected iPhone:
```bash
npx expo run:ios --device "Ahmed’s iPhone" --configuration Release
```

### Add the widget to your home screen

1. Long-press an empty spot on the home screen until the icons jiggle.
2. Tap the **+** in the top-left corner.
3. Search for **Fokus**.
4. Swipe between Small / Medium / Large and pick a size.
5. Tap **Add Widget**.

Save a focus in the app — the widget refreshes within ~1 second.

---

## JS-only iterations

After the first native install, you can keep Metro running and just edit JS / TypeScript files:

```bash
npx expo start --dev-client
```

You only need to rerun `npm run ios:device` when you change anything under:

- `plugins/`
- `target/`
- The `plugins` list in `app.json`
- Any native dependency in `package.json`

---

## Project structure

```
fokus/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root stack + FocusProvider wrapper
│   ├── +not-found.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Single-slot tab group (hidden tab bar)
│   │   └── index.tsx             # Home — current focus + history
│   ├── edit.tsx                  # Modal — set/edit today's focus
│   ├── guide.tsx                 # "Add widget" walkthrough
│   └── settings.tsx              # Clear history, About, link to guide
├── components/
│   ├── WidgetPreview.tsx         # Mock of the iOS widget (Small/Medium/Large)
│   ├── HistoryItem.tsx           # Row in the history list
│   ├── ErrorBoundary.tsx
│   ├── ErrorFallback.tsx
│   └── KeyboardAwareScrollViewCompat.tsx
├── context/
│   └── FocusContext.tsx          # Global state + AsyncStorage + native bridge
├── hooks/
│   └── useColors.ts              # Returns the active theme palette
├── constants/
│   └── colors.ts                 # Design tokens (light + dark)
├── plugins/
│   └── withFokusWidget.js        # Expo config plugin — wires up the widget
├── target/
│   └── FokusWidget/              # Source-of-truth for the WidgetKit extension
│       ├── FokusWidget.swift     # Timeline provider + SwiftUI views
│       ├── FokusWidgetBundle.swift
│       └── Info.plist
├── assets/
│   └── images/icon.png
├── app.json
├── package.json
├── ios-device.sh
└── README.md
```

The plugin copies `target/FokusWidget/` into `ios/FokusWidget/` and writes a Swift bridge (`FokusWidgetBridge.swift` + `FokusWidgetBridge.m`) into the main app target during `expo prebuild`. The `ios/` and `android/` directories are generated and should never be hand-edited.

---

## Customizing the widget

All widget visuals live in `target/FokusWidget/FokusWidget.swift`. The shared data contract is:

```swift
struct FokusData: Codable {
    var text: String         // current focus text
    var category: String     // "focus" | "goal" | "quote" | "reminder"
    var lastUpdated: String  // ISO 8601
}
```

To add a new field:

1. Add it to `FokusData` in `target/FokusWidget/FokusWidget.swift`.
2. Add it to `FocusItem` in `context/FocusContext.tsx`.
3. Include the new field in the JSON serialized by `tryUpdateNativeWidget`.

After native changes, rerun `npm run ios:device`.

---

## Changing the bundle ID / App Group

`com.example.fokus` (bundle) and `group.com.example.fokus` (App Group) must stay in sync across **four** locations:

1. `app.json` → `expo.ios.bundleIdentifier`
2. `plugins/withFokusWidget.js` → the `APP_GROUP` constant
3. `target/FokusWidget/FokusWidget.swift` → the `AppGroupID` constant
4. `target/FokusWidget/Info.plist` → the `FokusAppGroupID` string

If they drift, the widget reads stale or empty data and there is no error.

---

## Troubleshooting

**"xcrun: error: invalid active developer path"** — install Xcode CLI tools: `xcode-select --install`, then accept the license: `sudo xcodebuild -license accept`.

**Signing errors during `npm run ios:device`** — open `ios/Fokus.xcworkspace` in Xcode, select the **Fokus** target, then under **Signing & Capabilities** pick your personal team. Repeat for the **FokusWidget** target.

**Widget doesn't appear in the widget gallery** — make sure you ran a full `npm run ios:device` (not just a JS reload) after a native change. On the iPhone, fully delete the app and reinstall.

**Widget shows the placeholder text** — open the app once, save a focus, and wait a second. If it still doesn't update, double-check that the App Group ID matches in all four locations above and that App Groups capability is enabled for both targets in Xcode.

**Errors about `expo-router` types** — run `npx expo customize tsconfig.json` once, then `npm run typecheck` again.
