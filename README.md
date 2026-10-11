# MotoCare

A motorcycle maintenance tracker for Android — Expo, React Native, TypeScript, Expo Router, and a local SQLite database. No account required; install and start tracking immediately.

## Status: Phase 1 (MVP) complete

**Working now:**
- Motorcycle profile — create, edit, view, delete; supports multiple motorcycles
- Dashboard with live status (🟢 OK / 🟠 Coming soon / 🔴 Overdue)
- Maintenance records — type, date, mileage, cost, parts, brand, DIY/workshop, notes, next interval
- Default maintenance types (oil, filters, spark plugs, valve clearance, brake fluid, coolant, chain, tyres) plus custom types you define
- Automatic upcoming-maintenance calculation from mileage and/or time intervals, with overdue clearly flagged
- Full maintenance history with type filtering
- Mileage tracking — tap the odometer on the dashboard to update it
- Sample data on first launch (clearly flagged, removable from Settings any time)

**Scaffolded as "coming soon" screens, not yet built:** Fuel log, Expenses, Parts garage, Documents & photos, Reminders. These are Phase 2/3.

## Requirements on your laptop
- [Node.js](https://nodejs.org) 20 or newer
- The **Expo Go** app on your Android phone (Play Store) — this is the easiest way to test; no Android Studio or emulator needed

## Run it

1. Unzip the project and open a terminal in the `motocare` folder.
2. Install dependencies:
   ```
   npm install
   ```
3. Align every Expo package to your installed SDK version (recommended — corrects any version drift from the versions pinned here):
   ```
   npx expo install --fix
   ```
4. Start the dev server:
   ```
   npx expo start
   ```
5. A QR code appears in the terminal. Open **Expo Go** on your Android phone and scan it — your phone and laptop need to be on the same Wi-Fi network. The app builds and opens on your phone.

That's it — no build step, no cable, no Android Studio required to try it out.

## Project structure

```
motocare/
├── app/                        Expo Router — each file is a screen/route
│   ├── _layout.tsx              Root layout: DB init gate + stack navigator
│   ├── (tabs)/                  Bottom tab bar
│   │   ├── _layout.tsx
│   │   ├── index.tsx             Home / Dashboard
│   │   ├── maintenance.tsx       Upcoming + History
│   │   ├── fuel.tsx              Coming soon
│   │   ├── expenses.tsx          Coming soon
│   │   └── more.tsx              Menu
│   ├── motorcycle/
│   │   ├── [id].tsx              View motorcycle
│   │   ├── form.tsx              Create/edit motorcycle
│   │   └── list.tsx              My Motorcycles
│   ├── maintenance/
│   │   ├── [id].tsx              View maintenance record
│   │   └── form.tsx              Create/edit maintenance record
│   ├── parts.tsx                Coming soon
│   ├── documents.tsx            Coming soon
│   └── settings.tsx
├── src/
│   ├── database/                 SQLite connection, migrations, repositories
│   │   ├── db.ts                  Connection + migration runner
│   │   ├── seed.ts                Default maintenance types + sample data
│   │   ├── motorcycleRepository.ts
│   │   └── maintenanceRepository.ts
│   ├── components/                Reusable UI — buttons, cards, form fields, list rows
│   ├── context/AppContext.tsx     Global state: DB ready, motorcycles, active motorcycle
│   ├── utils/                     Status calculations, formatting, validation
│   ├── theme.ts                   Colors, spacing, type scale
│   └── types.ts                   Shared TypeScript types
├── package.json
├── app.json                     App config (name, Android package, expo-router plugin)
├── babel.config.js
└── tsconfig.json
```

## How it's built
- **Local-first:** everything is stored on-device via `expo-sqlite`. Nothing is sent anywhere, no account needed.
- **Modular data layer:** every screen talks to the database only through `src/database/*Repository.ts`. A future cloud-sync backend can be dropped in behind those same function signatures without touching a single screen.
- **File-based routing:** every file under `app/` is a real Expo Router route (Android-first; also works on iOS/web with no extra work).

## A note on testing
This was checked as thoroughly as possible without a live Metro bundler: every local import was cross-checked against the actual exports of its target file (no typos or missing functions), all JSON configs were validated, and the `expo-sqlite` / `expo-router` / date-picker APIs were verified against current documentation rather than assumed. It has not been run through `npx expo start` directly, since this environment has no network access to install dependencies. If you hit an error on first run, paste it back and it can be fixed directly.
