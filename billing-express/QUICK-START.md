# Quick Start Guide - TamNet Billing

## 🚀 Development (Local)

```bash
# Terminal 1 - Backend
cd billing-express/backend
npm install
cp .env.example .env
node scripts/init-db.js
npm start

# Terminal 2 - Frontend
cd billing-express/frontend
npm install
npm run dev
```

Buka: `http://localhost:5173`

---

## 📦 Production Build

```bash
cd billing-express

# Linux/Mac
./build.sh

# Windows
build.bat
```

---

## 🌐 Deploy ke Server

### 1. Upload ke Server
```bash
# Via Git
git clone <repo-url> /var/www/billing-tamnet

# Via SCP
scp -r billing-express user@server:/var/www/billing-tamnet
```

### 2. Setup Database
```bash
mysql -u root -p
CREATE DATABASE billing_internet;
CREATE USER 'billing_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON billing_internet.* TO 'billing_user'@'localhost';
EXIT;
```

### 3. Configure
```bash
cd /var/www/billing-tamnet/billing-express/backend
cp .env.example .env
nano .env  # Edit konfigurasi
```

### 4. Initialize
```bash
node scripts/init-db.js
node scripts/add-wa-notification.js
```

### 5. Build Frontend
```bash
cd ../frontend
npm install
npm run build
```

### 6. Start dengan PM2
```bash
cd ..
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

Akses: `http://server-ip:5000`

---

## 🔧 PM2 Commands

```bash
# Status
pm2 status

# Logs
pm2 logs billing-tamnet

# Restart
pm2 restart billing-tamnet

# Stop
pm2 stop billing-tamnet

# Delete
pm2 delete billing-tamnet

# Monitor
pm2 monit
```

---

## 🔐 First Login

1. Buka aplikasi di browser
2. Login dengan kredensial yang dibuat di `init-db.js`
3. Masuk ke menu Pengaturan
4. Konfigurasi MikroTik
5. Scan WhatsApp QR: `http://server-ip:5000/api/whatsapp/qr`

---

## 🐛 Troubleshooting

### Backend tidak start
```bash
pm2 logs billing-tamnet
# Cek error
```

### Database error
```bash
mysql -u billing_user -p billing_internet
# Test koneksi
```

### Port sudah digunakan
```bash
# Linux
sudo lsof -i :5000
sudo kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### WhatsApp error
```bash
cd backend
rm -rf whatsapp-session .wwebjs_cache
pm2 restart billing-tamnet
# Scan QR lagi
```

---

## 📚 Dokumentasi Lengkap

- [DEPLOY.md](./DEPLOY.md) - Panduan deploy lengkap
- [README.md](./README.md) - Dokumentasi project

---

## 🆘 Support

Jika ada masalah:
1. Cek logs: `pm2 logs billing-tamnet`
2. Cek database connection
3. Cek file .env
4. Restart service: `pm2 restart billing-tamnet`
