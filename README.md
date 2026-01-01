# 🎤 KaraokeKu

Website karaoke modern (Vue + Express) dengan fitur karaoke player, lirik sinkron, kontrol vocal, pitch, playlist, upload, dan admin panel.

## ✨ Fitur

**User**
- Karaoke player + lirik sinkron
- Vocal on/off
- Pitch control (+/- semitone)
- Playlist & favorit
- Score & history
- Upload video + thumbnail

**Admin**
- Dashboard statistik
- CRUD lagu (search/filter)
- Review upload (approve/reject)
- Auto song scanner (scan folder)

## 🧱 Tech Stack

- Frontend: Vue 3 + Vite, Vue Router, Pinia, Bootstrap 5
- Backend: Node.js + Express
- Database: MariaDB + Sequelize
- Auth: JWT + bcryptjs

## ✅ Persiapan

- Node.js 18+ (disarankan 20+)
- MariaDB 10.5+
- (Opsional) Docker + Docker Compose

## 🚀 Menjalankan (Local Development)

### 1) Database

```sql
CREATE DATABASE karaoke_db;
CREATE USER 'karaoke'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON karaoke_db.* TO 'karaoke'@'localhost';
FLUSH PRIVILEGES;
```

### 2) Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Backend: `http://localhost:3000`

### 3) Frontend

```bash
cd client
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

## 🐳 Menjalankan (Docker)

```bash
docker compose up --build -d
```

Akses app: `http://localhost:5003`

## 📲 Installer via Google Chrome (PWA)

PWA bisa di-install di Android/desktop melalui Chrome.

**Production mode (server melayani `client/dist`)**
```bash
npm --prefix client run build
NODE_ENV=production npm --prefix server start
```

Lalu buka `http://localhost:3000` di Chrome → klik tombol **Install** / **Add to Home screen**.

> Catatan: Untuk install di perangkat non-localhost, butuh HTTPS + domain.

## 🤖 Android App (WebView Wrapper)

Project Android ada di folder `android/` (membungkus web KaraokeKu via WebView) dan bisa dibuild jadi APK.
Lihat petunjuk di `android/README.md`.

## 📱 Android Native Client

- Folder `android/` sekarang berisi aplikasi native Kotlin/Compose dengan arsitektur MVVM yang berbicara langsung ke backend (`/server`).
- Fitur utama (autentikasi JWT, daftar lagu, pencarian/penyaringan, pemutaran video, playlist/favorit, permintaan lagu, chat via Socket.IO, riwayat skor, donasi, upload, notifikasi) sudah ditangani secara native.
- Ikuti `android/README.md` untuk setup, konfigurasi API/Socket, Firebase, dan perintah build (`./gradlew assembleDebug` / `./gradlew installDebug`).

## 🔐 Login Google (Firebase) (Opsional)

1. Buat project di Firebase Console.
2. Aktifkan **Authentication → Sign-in method → Google**.
3. Tambahkan **Authorized domains** (mis. `localhost` dan domain production).
4. Buat **Firebase Web App** → ambil `VITE_FIREBASE_*` untuk `client/.env`.
5. Buat **Service Account** (Firebase Admin SDK) untuk backend (disarankan pakai file JSON dan set `FIREBASE_SERVICE_ACCOUNT_PATH` di `server/.env`).

Contoh env ada di:
- `client/.env.example`
- `server/.env.example`

## 🎵 Auto Song Scanner

Letakkan video di `./uploads/videos/` lalu jalankan scan dari Admin Panel atau CLI.

**Format nama file yang di-scan**
```
JUDUL LAGU#NAMA ARTIS#NEGARA.mp4
JUDUL LAGU#NAMA ARTIS#NEGARA.mpg
```

CLI:
```bash
cd server
npm run scan-songs
```

## 👤 Default Admin

- Username: `admin`
- Password: `admin123`

> Wajib ganti password untuk production.

## 🔒 Keamanan & GitHub

- Jangan commit file rahasia: `.env`, `*firebase-adminsdk*.json`, dll.
- Folder `uploads/` berisi file user/video dan **tidak boleh** ikut repo (sudah di-ignore).
