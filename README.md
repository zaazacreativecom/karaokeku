# 🎤 KaraokeKu - Website Karaoke Modern

Website karaoke modern dengan fitur lengkap: video karaoke dengan lirik, kontrol vocal on/off, pitch control, playlist management, dan admin panel.

## 🚀 Fitur Utama

### User Features
- **Karaoke Player** - Video player dengan synchronized lyrics
- **Vocal On/Off** - Toggle antara versi full vocal dan instrumental
- **Pitch Control** - Ubah pitch suara (+/- 6 semitone)
- **Playlist Management** - Buat dan kelola playlist karaoke
- **Score System** - Catat skor dan riwayat karaoke
- **Upload Video** - User dapat upload video karaoke

### Admin Features
- **Dashboard** - Statistik total user, lagu, dan play count
- **Song Management** - CRUD lagu dengan search & filter
- **User Management** - Kelola user dan role
- **Upload Review** - Approve/reject upload dari user
- **Auto Song Scanner** - Scan folder untuk menambahkan lagu otomatis

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3 + Vite, Vue Router, Pinia |
| Styling | Bootstrap 5, Custom CSS |
| Backend | Node.js + Express.js |
| Database | MariaDB + Sequelize ORM |
| Auth | JWT + bcryptjs |

## 📁 Struktur Proyek

```
karaoke/
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── config/        # Database & CORS config
│   │   ├── controllers/   # Request handlers
│   │   ├── middlewares/   # Auth, error handler, upload
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── seeders/       # Database seeders
│   │   └── utils/         # Helper functions
│   ├── uploads/           # Uploaded files
│   ├── app.js             # Express config
│   └── server.js          # Entry point
│
└── client/                 # Frontend Vue 3
    ├── src/
    │   ├── assets/        # CSS & images
    │   ├── router/        # Vue Router config
    │   ├── services/      # API services
    │   ├── stores/        # Pinia stores
    │   └── views/         # Page components
    └── index.html
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MariaDB 10.5+
- npm atau yarn

### 1. Setup Database

```sql
CREATE DATABASE karaoke_db;
CREATE USER 'karaoke'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON karaoke_db.* TO 'karaoke'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env sesuai konfigurasi database Anda
nano .env

# Jalankan seeder (optional - buat data contoh)
npm run seed

# Jalankan development server
npm run dev
```

Backend berjalan di: `http://localhost:3000`

### 3. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

## 🔐 Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| User | demo | demo123 |

> ⚠️ **Penting**: Segera ganti password default di production!

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user baru |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |

### Songs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/songs` | List semua lagu (+ filter) |
| GET | `/api/songs/:id` | Detail lagu |
| GET | `/api/songs/top` | Top songs |
| GET | `/api/songs/genres` | List genre |
| GET | `/api/songs/languages` | List bahasa |

### Playlists
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/playlists` | List playlist user |
| POST | `/api/playlists` | Buat playlist |
| GET | `/api/playlists/:id` | Detail playlist |
| PUT | `/api/playlists/:id` | Update playlist |
| DELETE | `/api/playlists/:id` | Hapus playlist |
| POST | `/api/playlists/:id/songs` | Tambah lagu ke playlist |

### Playback & Scores
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/playback/start` | Mulai playback |
| POST | `/api/playback/end` | Akhiri playback |
| GET | `/api/playback/me/scores` | User score summary |
| GET | `/api/playback/me/history` | User play history |
| GET | `/api/playback/leaderboard` | Leaderboard |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| POST | `/api/admin/songs/scan` | Scan songs dari folder |
| GET/POST/PUT/DELETE | `/api/admin/songs` | CRUD songs |
| GET/PUT/DELETE | `/api/admin/users` | Manage users |
| GET/PUT/DELETE | `/api/admin/uploads` | Review uploads |

## 🎵 Auto Song Scanner

Fitur scan otomatis untuk menambahkan lagu dari folder. 

### Format Nama File
```
JUDUL-LAGU#ARTIS#GENRE#NEGARA.mp4
```

### Contoh
```
Laskar-Pelangi#Nidji#Pop#Indonesia.mp4
Bohemian-Rhapsody#Queen#Rock#English.mp4
```

### Cara Penggunaan

1. Letakkan file video di folder `./uploads/videos/`
2. Buka Admin Panel > Dashboard
3. Klik "Scan Lagu Baru"
4. Preview dengan "Dry Run" atau langsung scan

Atau via command line:
```bash
npm run scan-songs
```

## 🎨 Screenshots

Lihat folder `/docs/screenshots/` untuk screenshot aplikasi.

## 📝 Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=karaoke_db
DB_USER=karaoke
DB_PASS=password

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_MAX_SIZE=500
SONGS_DIRECTORY=./uploads/videos

# Frontend
FRONTEND_URL=http://localhost:5173
```

## 🤝 Contributing

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - Lihat file `LICENSE` untuk detail.

---

Made with ❤️ for Karaoke Lovers
