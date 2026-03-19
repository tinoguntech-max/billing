# 🔄 Panduan Setup Tagihan Otomatis

Sistem tagihan akan dibuat **otomatis setiap hari pukul 00:00 (tengah malam)** untuk semua pelanggan aktif berdasarkan tanggal bergabung mereka.

## 📋 Cara Kerja

**Contoh:**
- Pelanggan **Budi** bergabung **15 Januari** → Setiap **tanggal 15**, sistem otomatis membuat tagihan
- Tanggal jatuh tempo: **3 hari** setelah tanggal billing (jadi untuk Budi: tanggal **18**)

## 🚀 Setup & Menjalankan

### Opsi 1: Jalankan Cron Job Lokal (Development)

```bash
# Terminal 1: Jalankan Next.js dev server
npm run dev

# Terminal 2: Jalankan cron job di terminal terpisah
npm run cron
```

**Output menggunakan Buat tagihan otomatis**

```
⏰ Jadwal: Generate tagihan akan berjalan setiap hari pukul 00:00
⏳ Waktu sampai eksekusi berikutnya: 720 menit

[18/3/2026, 09:30:45] Memulai generate tagihan otomatis...
  ✔ Tagihan INV-0326-001 untuk Budi Santoso
  ✔ Tagihan INV-0326-002 untuk Siti Rahayu
  ✔ Tagihan INV-0326-003 untuk Agus Priyanto
[18/3/2026, 09:30:46] Generate selesai: 3 tagihan baru dibuat
```

---

### Opsi 2: Jalankan di Production (dengan PM2)

```bash
# Install PM2 global
npm install -g pm2

# Start cron job dengan PM2
pm2 start cron-generate-tagihan.js --name "billing-cron"

# Lihat status
pm2 list

# Restart otomatis saat server reboot
pm2 startup
pm2 save
```

---

### Opsi 3: Jalankan di Background dengan Screen (Linux/Mac)

```bash
# Buat session baru
screen -S billing-cron

# Jalankan cron job
npm run cron

# Detach dari session (Ctrl + A, lalu D)
```

---

## 📊 Hasil Otomatis

Setelah cron job berjalan:

1. ✅ **Tagihan dibuat otomatis** sesuai tanggal bergabung pelanggan
2. ✅ **Halaman Pembayaran** auto-refresh setiap 3 detik untuk menampilkan data terbaru
3. ✅ **Laporan Keuangan** auto-refresh setiap 5 detik

---

## 🔍 Mengecek Hasil

### Di Halaman **Manajemen Tagihan:**
- Lihat tagihan yang baru dibuat otomatis
- Status awalnya: **"Belum Bayar"**

### Di Halaman **Riwayat Pembayaran:**
- Klik tombol **"Catat Pembayaran"**
- Pilih tagihan yang ada
- Klik **"Konfirmasi Bayar"**
- Data pembayaran akan muncul otomatis di tabel (auto-refresh)
- Status tagihan akan berubah jadi **"Lunas"**

### Di Halaman **Laporan Keuangan:**
- Data akan otomatis update setiap 5 detik
- Lihat ringkasan pendapatan bulan ini
- Lihat grafik trend 6 bulan terakhir

---

## ⚠️ Tips Penting

1. **Jangan stop cron job** saat app sedang berjalan (kecuali maintenance)
2. **Cek log saat startup** untuk memastikan tidak ada error koneksi database
3. **Untuk production**, gunakan PM2 atau supervisor agar tetap running
4. Jika ingin trigger manual saja (tanpa cron), bisa klik tombol **"Generate Otomatis"** di halaman Tagihan

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Error: "Connection refused"
- Pastikan MySQL lagi berjalan
- Check `.env.local` credentials-nya benar

### Tagihan tidak muncul?
- Cek di Terminal 2, apakah ada error message?
- Pastikan pelanggan punya `tgl_bergabung` dan status `Aktif`

---

**Selesai! 🎉 Sistem tagihan otomatis sudah siap digunakan!**
