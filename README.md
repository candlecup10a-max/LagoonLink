# LagoonLink: 10s Dataset Match Puzzle

An Android-style mobile matching puzzle game built with **React 19**, **TypeScript**, **Tailwind CSS**, **Vite PWA**, and **Firebase (Firestore & Google Auth)**. Players connect matching target items scattered among 10 decoys over a tropical beach lagoon backdrop within a 10-second countdown per step.

---

## Key Features

- **100-Item Dataset & `/images/` Folder**:
  - Includes all **100 dataset items** (50 Fruits, 30 Animals, 9 Nature elements, and 11 Objects, from `#001 Apple` to `#100 Bottle`, including `#061 Dog`) stored in `/images/` and `/public/images/` alongside `manifest.json`.
  - Features photorealistic custom sprites for **Kiwi**, **Pear**, **Spoon**, **Cycle**, and **Pen** bundled via Vite asset imports and copied into `/public/` for production deployments.
- **10-Second Target Linking Gameplay**:
  - Each step spawns the target item (3 to 6 copies depending on difficulty) amidst **10 distractor items** (or **10 total board items** mode).
  - Tap or drag across matching target items to draw a glowing cobalt-blue link trail before the **10.0s** timer expires.
  - Ocean wave transition animation sweeps across the lagoon between levels to reset and buoyantly pop in the new wave of tokens.
- **5 Selectable Progressive Difficulty Levels**:
  - **Level 1 (Easy)**: 3 targets · 10s window · gentle drift · mixed decoys (`+100 pts/target`).
  - **Level 2 (Medium)**: 4 targets · 10s window · moderate drift · category/color-matched decoys (`+140 pts/target`).
  - **Level 3 (Hard)**: 5 targets · 10s window · faster drift · lookalike decoys (`+180 pts/target`).
  - **Level 4 (Expert)**: 5 targets · 10s window · rapid currents · lookalike decoys (`+230 pts/target`).
  - **Level 5 (Master)**: 6 targets · 10s window · cyclone currents · lookalike decoys (`+250+ pts/target`).
- **5-Heart Life System, 3-Level Flawless Milestone & Daily Bonus**:
  - Players start each run with **5 Hearts**.
  - **3-Level Flawless Milestone**: Completing **3 consecutive levels without failure** automatically recovers **+1 lost Heart** (up to the maximum of 5 Hearts, or awards `+500 bonus points` if already at 5/5 Hearts).
  - **Daily Heart Bonus**: Claimable once per day from the bottom control bar or the **Levels** tab for **+1 Heart** (up to 5) and **+250 bonus points**.
- **360px Mobile Phone UI & Installable PWA**:
  - Designed for a `360px` mobile smartphone viewport with a compact `46px` top app bar, thumb-zone game controls (**Hint**, **Clear**, **+1 Heart**, **Pause**), and a `52px` 4-tab bottom navigation bar (**Play**, **Levels**, **Ranks**, **Dataset**).
  - Configured with `vite-plugin-pwa`, Web App Manifest (`standalone` portrait display), `192x192` / `512x512` / maskable icons, and offline asset precaching.
- **Live Firebase Leaderboards**:
  - Real-time global Top 10 leaderboard (`/leaderboards/global`) and personal score history (`/scores/{scoreId}`) backed by Cloud Firestore and Google Sign-In, with automatic `localStorage` fallback when playing offline or signed out.

---

## Project Structure

```text
├── images/                         # 100 generated dataset SVG sprites + manifest.json
├── public/
│   ├── images/                     # Publicly served dataset sprites & stage backdrops
│   ├── pwa-192x192.png             # Android / Chromium home screen icon (192x192)
│   ├── pwa-512x512.png             # Android / Chromium splash & store icon (512x512)
│   ├── pwa-maskable-512x512.png    # Android adaptive maskable icon (512x512)
│   └── apple-touch-icon.png        # iOS Safari home screen icon (180x180)
├── scripts/
│   └── scrape_dataset_images.mjs   # Script to regenerate all 100 dataset item sprites
├── src/
│   ├── assets/images/              # Bundled stage backdrops & custom item sprites
│   ├── data/datasetItems.ts        # 100 dataset item definitions & 5 level configs
│   ├── utils/sound.ts              # Web Audio API synthesized sound effects
│   ├── firebase.ts                 # Firebase Auth & Firestore leaderboard client
│   ├── usePWAInstall.ts            # PWA install prompt & online/offline status hooks
│   ├── PWAInstallButton.tsx        # In-app Install / Download App modal & offline badge
│   ├── App.tsx                     # 360px mobile game shell, arena, levels, ranks & dataset tabs
│   └── main.tsx                    # App entry point & PWA service worker registration
├── capacitor.config.json           # Capacitor configuration for native Android APK builds
├── firestore.rules                 # Hardened Cloud Firestore security rules
├── vercel.json                     # Vercel static asset & SPA rewrite configuration
└── vite.config.ts                  # Vite + Tailwind CSS + VitePWA configuration
```

---

## Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Regenerate Dataset Sprites (Optional)
```bash
node scripts/scrape_dataset_images.mjs
```

### 3. Run Development Server
```bash
npm run dev
```
The app starts on `http://localhost:3000`.

### 4. Type-Check & Build for Production
```bash
npm run lint
npm run build
```

---

## Deploying & Packaging as a Mobile App

### Deploy to Vercel
The repository includes `vercel.json` and Vite ES module asset imports so the tropical beach lagoon backdrop and all 100 dataset sprites bundle cleanly into `dist/`.
1. Push the project to GitHub/GitLab or run `npx vercel`.
2. Framework Preset: **Vite** (`npm run build`, output directory: `dist`).

### Install as a Mobile PWA (Android & iOS)
1. Open the deployed URL on your phone and tap the green **Get App / Install on Phone** button.
2. On **Android (Chrome/Edge)**: Tap **Install Directly to Home Screen** or open the browser menu (`⋮`) → **Install app**.
3. On **iOS (Safari)**: Tap **Share** → **Add to Home Screen**.

### Build a Native Android `.APK` / `.AAB`
- **Via PWABuilder**: Paste your deployed URL into [PWABuilder.com](https://www.pwabuilder.com/) and select **Package for Stores → Android** to download a signed `.apk` and `.aab`.
- **Via Capacitor & Android Studio**:
  ```bash
  npm run build
  npm install @capacitor/core @capacitor/cli @capacitor/android
  npx cap add android
  npx cap sync
  npx cap open android
  ```
