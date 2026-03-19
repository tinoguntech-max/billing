# 🌐 NetBill — Sistem Billing Internet

Aplikasi manajemen billing internet berbasis **Next.js 14 + MySQL**, tampilan **Tailwind CSS pastel**, responsif dan modern.

## ✨ Fitur

- **Dashboard** — statistik real-time, grafik pendapatan, distribusi paket
- **Manajemen Pelanggan** — CRUD lengkap, filter, search
- **Manajemen Tagihan** — buat tagihan, tandai lunas
- **Paket Internet** — kelola paket dengan kartu visual
- **Pembayaran** — riwayat transaksi, multi metode
- **Laporan Keuangan** — trend pendapatan, distribusi paket
- **Pengaturan** — info perusahaan, konfigurasi DB

## 🚀 Cara Menjalankan

### 1. Prasyarat

- [Node.js](https://nodejs.org) v18 atau lebih baru
- MySQL 5.7+ atau MariaDB 10+

### 2. Setup Database

Pastikan MySQL berjalan, lalu buat user atau gunakan root.

### 3. Konfigurasi Environment

```bash
cp .env.local.example .env.local
```

Edit file `.env.local` dan isi sesuai konfigurasi MySQL kamu:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password_kamu
DB_NAME=billing_internet
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Inisialisasi Database

```bash
npm run db:init
```

Perintah ini akan:
- Membuat database `billing_internet`
- Membuat semua tabel (paket, pelanggan, tagihan, pembayaran)
- Mengisi data contoh (seed data)

### 6. Jalankan Aplikasi

```bash
npm run dev
```

Buka browser ke: **http://localhost:3000**

---

## 📁 Struktur Project

```
billing-internet/
├── src/
│   ├── app/
│   │   ├── api/                  ← REST API routes
│   │   │   ├── dashboard/        ← GET statistik
│   │   │   ├── pelanggan/        ← CRUD pelanggan
│   │   │   ├── paket/            ← CRUD paket
│   │   │   ├── tagihan/          ← CRUD tagihan
│   │   │   └── pembayaran/       ← CRUD pembayaran
│   │   ├── pelanggan/page.tsx    ← Halaman pelanggan
│   │   ├── tagihan/page.tsx      ← Halaman tagihan
│   │   ├── paket/page.tsx        ← Halaman paket
│   │   ├── pembayaran/page.tsx   ← Halaman pembayaran
│   │   ├── laporan/page.tsx      ← Halaman laporan
│   │   ├── pengaturan/page.tsx   ← Halaman pengaturan
│   │   ├── page.tsx              ← Dashboard (home)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Shell.tsx             ← Layout wrapper
│   │   ├── Sidebar.tsx           ← Navigasi sidebar
│   │   ├── Topbar.tsx            ← Header atas
│   │   ├── Modal.tsx             ← Komponen modal
│   │   └── Toast.tsx             ← Notifikasi toast
│   └── lib/
│       └── db.ts                 ← Koneksi MySQL pool
├── scripts/
│   └── init-db.js                ← Script inisialisasi DB
├── .env.local.example
├── package.json
├── tailwind.config.js
└── next.config.js
```

## 🗄️ Skema Database

```sql
paket        → id, nama_paket, kecepatan, harga, deskripsi
pelanggan    → id, nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung
tagihan      → id, no_tagihan, id_pelanggan, periode, jumlah, tgl_jatuh_tempo, status
pembayaran   → id, id_tagihan, jumlah, metode, tgl_bayar, keterangan
```

## 🛠️ Tech Stack

| Layer    | Teknologi |
|----------|-----------|
| Frontend | Next.js 14 (App Router), React 18 |
| Styling  | Tailwind CSS, Google Fonts |
| Backend  | Next.js API Routes |
| Database | MySQL + mysql2 |
| Icons    | Lucide React |

## 📞 Dukungan

Dibuat dengan ❤️ menggunakan Claude AI
