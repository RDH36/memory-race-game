# Flipia

A competitive memory card game built with React Native and Expo.

## Features

- **Memory Card Game** — Flip cards and find matching pairs before your opponent
- **AI Opponents** — Play against bots with varying difficulty levels
- **Leaderboard** — Track top players by XP, win rate, and rank
- **Google OAuth** — Sign in with your Google account
- **Onboarding** — Interactive tutorial to learn the game mechanics
- **i18n** — Multi-language support via i18next

## Tech Stack

- **Framework**: [Expo](https://expo.dev) (SDK 55) with [Expo Router](https://docs.expo.dev/router/introduction/)
- **Language**: TypeScript
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Backend**: [InstantDB](https://www.instantdb.com/) (real-time database)
- **Auth**: Google Sign-In via `@react-native-google-signin/google-signin`
- **Animations**: React Native Reanimated + Gesture Handler
- **Haptics**: Expo Haptics

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Install

```bash
pnpm install
```

### Run

```bash
pnpm start          # Start Expo dev server
pnpm android        # Run on Android
pnpm ios            # Run on iOS
```

### Build (EAS)

```bash
eas build --platform android
eas build --platform ios
```

## Project Structure

```
app/
├── (tabs)/          # Main tab navigation (home, leaderboard, profile, settings)
├── auth/            # Authentication screens
├── game/            # Game screen
├── onboarding/      # Onboarding flow
└── result/          # Game result screen
```
