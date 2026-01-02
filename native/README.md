# KaraokeKu Native (Flutter)

Native app for iOS, Android, and Desktop built with Flutter. This app talks directly to the existing Node.js/Express backend and uses Firebase Auth + JWT.

## Requirements

- Flutter 3.22+ (stable)
- Android Studio / Xcode (for mobile)
- Firebase project (Auth enabled)

## Setup

1) Install dependencies

```bash
cd native
flutter pub get
```

2) Configure environment

```bash
cp .env.example .env
```

Fill `.env` with:
- `API_BASE_URL` (ex: `http://localhost:5000/api`)
- `SOCKET_URL` (ex: `http://localhost:5000`)
- Firebase client configs (`FIREBASE_*`)
- Google Sign-In client IDs (`GOOGLE_IOS_CLIENT_ID`, `GOOGLE_WEB_CLIENT_ID`)

3) Run the app

```bash
flutter run
```

## Firebase Notes

This app initializes Firebase from `.env`. Make sure your Firebase project has:
- Authentication enabled (Email/Password and Google)
- Correct Android/iOS app registrations and client IDs

## Localhost Tips

- Android emulator: use `http://10.0.2.2:5000/api`
- iOS Simulator + Desktop: use `http://localhost:5000/api`

## Build

```bash
flutter build apk
flutter build ios
flutter build macos
flutter build windows
flutter build linux
```

## Features Covered

- Auth (Firebase + JWT)
- Song browsing, search, filters, top songs
- Karaoke player with lyrics overlay and score submission
- Playlists, favorites
- Song requests and uploads (with offline queue)
- Donations and payment methods
- Real-time chat via Socket.IO
- Admin panel (dashboard, users, songs, uploads, requests, donations, payment methods)

## Notes

- Donation proof upload expects a public URL (`proof_url`) because the backend does not currently accept image upload for donation proof.
- Offline upload queue is stored locally and can be retried from the upload list screen.
