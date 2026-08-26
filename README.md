# Contribute

Cross-platform expense splitting inspired by Splitwise Pro — share costs fairly across friends, homes, and trips.

## Platforms

One Expo (React Native) codebase runs on:

- **iOS** (Expo Go or simulator)
- **Android** (Expo Go or emulator)
- **Web** (browser)

## Features

- Overall balances (you owe / owed to you)
- Groups with per-member balances
- Friends and one-to-one settle-up
- Add expenses with equal split + categories
- Activity feed
- Local persistence (AsyncStorage) with demo seed data

## Quick start

```bash
npm install
npx expo start
```

Then press:

- `w` — web
- `a` — Android
- `i` — iOS (macOS)

Or open the QR code in Expo Go on a physical device.

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Expo dev server |
| `npm run web` | Web only |
| `npm run android` | Android |
| `npm run ios` | iOS |

## Project layout

- `app/` — Expo Router screens (tabs + modals + detail routes)
- `components/` — UI building blocks
- `lib/` — types, balances math, seed data, store
- `constants/theme.ts` — brand colors and type

## Notes

Data stays on-device for this build. Account → **Reset demo data** restores the sample household.
