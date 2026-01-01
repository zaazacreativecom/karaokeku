# KaraokeKu Android (Native)

Aplikasi ini ditulis dalam Kotlin + Jetpack Compose dengan arsitektur modern (MVVM + Flow). Semua fitur utama — otentikasi JWT/Google, daftar lagu + filter, pemutaran video (ExoPlayer), playlist & favorit, request lagu, chat real-time (Socket.IO), riwayat skor, donasi, upload oleh admin, dan notifikasi Firebase — sudah tersedia tanpa WebView.

## Setup

1. **Jalankan backend** (`server`) agar API (`http://localhost:5003/api`) dan Socket.IO (`http://localhost:5003`) aktif.
2. **Atur endpoint** di `android/gradle.properties`: `karaokeApiBaseUrl` dan `karaokeSocketUrl` supaya mengarah ke instance backend Anda.
3. **Firebase**: letakkan `google-services.json` yang valid di `android/app/`. `android/app/src/main/res/values/strings.xml` sudah menyediakan placeholder `default_web_client_id`; ganti dengan yang sesuai dari Firebase Console.
4. **Periksa gradle** via wrapper (`android/gradlew`). Gradle wrapper sudah disertakan agar build selalu konsisten.
5. **Token persistence** dijaga oleh `SharedPreferences`, sementara Retrofit + OkHttp menangani header Authorization otomatis.

## Build & Run

```bash
cd android
./gradlew assembleDebug        # hanya compile
./gradlew installDebug         # install ke perangkat terhubung
```

## Penggunaan singkat

- **Auth**: Login/register memakai JWT, sekaligus login Google yang memanfaatkan Firebase Auth (aktifkan `Sign-in method → Google`).
- **Lagu**: layar utama mengandung pencarian + filter genre/bahasa, daftar lagu, dan tombol request/donasi.
- **Player**: detail lagu memakai ExoPlayer dan tombol untuk menandai favorit atau memulai sesi karaoke (melaporkan ke backend).
- **Playlist/Favorit**: kelola playlist pengguna dan buat lagu favorit dari daftar.
- **Chat**: daftar percakapan + pencatatan pesan via REST + WebSocket.
- **Donasi/Request**: form donasi, daftar metode pembayaran aktif (QR) dan request lagu tersimpan.
- **Upload**: admin bisa unggah video + thumbnail lokal via Storage Access Framework.
- **Notifikasi**: Firebase Cloud Messaging menampilkan notifikasi push bawaan.

## Catatan

- Jika backend berjalan di host berbeda (mis. emulator), pastikan `karaokeApiBaseUrl` mengarah ke URL yang dapat dijangkau perangkat.
- Gunakan `./gradlew lint` atau `./gradlew test` untuk quality check tambahan.
- Perubahan API atau socket di backend seketika akan langsung terlihat di klien ini tanpa WebView.
