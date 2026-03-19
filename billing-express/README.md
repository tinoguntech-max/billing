# TamNet Billing System

Sistem billing internet dengan integrasi MikroTik PPPoE dan WhatsApp Gateway.

## Quick Start (Development)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env sesuai konfigurasi
node scripts/init-db.js
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Buka browser: `http://localhost:5173`

## Production Build & Deploy

### Build Aplikasi
```bash
# Linux/Mac
chmod +x build.sh
./build.sh

# Windows
build.bat
```

### Deploy dengan PM2
```bash
# Install PM2
npm install -g pm2

# Start aplikasi
pm2 start ecosystem.config.js

# Auto-start on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
pm2 logs billing-tamnet
```

### Deploy Manual
```bash
cd backend
npm start
# Akses: http://localhost:5000
```

📖 **Panduan Deploy Lengkap:** Lihat [DEPLOY.md](./DEPLOY.md)

## Struktur Project

```
billing-express/
├── backend/          # Express.js API (Port 5000)
├── frontend/         # React + Vite (Port 5173)
└── README.md
```

## Ukuran Folder

Folder besar yang **TIDAK** perlu di-commit ke Git:

- `backend/node_modules/` (~77 MB) - Dependencies
- `backend/whatsapp-session/` (~160 MB) - WhatsApp browser cache
- `backend/.wwebjs_cache/` (~1 MB) - WhatsApp cache
- `frontend/node_modules/` (~98 MB) - Dependencies

**Total ukuran development:** ~336 MB
**Ukuran source code saja:** ~1 MB

## Instalasi

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env sesuai konfigurasi
node scripts/init-db.js
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Fitur

- ✅ Dashboard & Laporan
- ✅ Manajemen Pelanggan, Paket, Tagihan
- ✅ Integrasi MikroTik PPPoE (Isolir, Enable, Disconnect)
- ✅ WhatsApp Gateway (Self-hosted, unlimited)
- ✅ Monitoring koneksi otomatis
- ✅ Notifikasi WhatsApp otomatis (offline/online)
- ✅ Role-based access (Admin, Bendahara, Karyawan)

## Teknologi

**Backend:**
- Express.js
- MySQL2
- whatsapp-web.js (Puppeteer)
- node-routeros (MikroTik API)

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Lucide Icons

## Catatan Penting

### WhatsApp Session
Folder `whatsapp-session/` berisi browser cache Chromium untuk WhatsApp Web. Ukurannya besar (~160 MB) tapi **NORMAL**. Folder ini:
- Sudah di-ignore di Git
- Berisi session login WhatsApp
- Akan dibuat otomatis saat pertama kali scan QR
- Bisa dihapus jika ingin reset session

### Cara Reset WhatsApp Session
```bash
cd backend
rm -rf whatsapp-session .wwebjs_cache
npm start
# Scan QR code lagi di http://localhost:5000/api/whatsapp/qr
```

## Konfigurasi MikroTik

Masuk ke menu Pengaturan > Konfigurasi MikroTik:
- Host: IP MikroTik
- Port: 8728 (API) atau 9125 (custom)
- Username: admin MikroTik
- Password: password MikroTik

## License

Proprietary - TamNet Internet Provider
