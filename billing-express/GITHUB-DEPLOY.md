# Deploy via GitHub

## Setup Pertama Kali

### 1. Di komputer lokal - Push ke GitHub

```bash
# Masuk ke root project
cd E:\nodejs\billing-internet

# Init git (jika belum)
git init

# Tambah .gitignore di root
# (sudah ada di billing-express/.gitignore)

# Add semua file
git add billing-express/

# Commit
git commit -m "Initial commit - TamNet Billing System"

# Buat repo di GitHub lalu push
git remote add origin https://github.com/USERNAME/billing-tamnet.git
git branch -M main
git push -u origin main
```

### 2. Di VPS - Clone dari GitHub

```bash
# Backup folder lama jika ada
mv /var/www/billing-internet /var/www/billing-internet-backup

# Clone repo
git clone https://github.com/USERNAME/billing-tamnet.git /var/www/billing-internet

# Masuk ke folder
cd /var/www/billing-internet/billing-express/backend

# Setup .env
cp .env.example .env
nano .env  # Edit konfigurasi

# Install dependencies
npm install --production

# Init database
node scripts/init-db.js
node scripts/add-wa-notification.js

# Build frontend
cd ../frontend
npm install
npm run build

# Start dengan PM2
cd ..
pm2 start backend/server.js --name billing-tamnet
pm2 save
pm2 startup
```

---

## Update Aplikasi (Setelah Setup)

### Di komputer lokal - Push update

```bash
cd E:\nodejs\billing-internet

# Add perubahan
git add billing-express/

# Commit
git commit -m "Update: deskripsi perubahan"

# Push ke GitHub
git push origin main
```

### Di VPS - Pull dan deploy

```bash
# Cara 1: Manual
cd /var/www/billing-internet/billing-express
git pull origin main
cd frontend && npm run build
pm2 restart billing-tamnet

# Cara 2: Pakai script otomatis
bash /var/www/billing-internet/billing-express/deploy.sh
```

---

## Auto Deploy dengan Webhook (Opsional)

Jika ingin deploy otomatis setiap kali push ke GitHub:

### 1. Install webhook di server

```bash
sudo apt install -y webhook
```

### 2. Buat config webhook

```bash
nano /etc/webhook.conf
```

Isi:
```json
[
  {
    "id": "deploy-billing",
    "execute-command": "/var/www/billing-internet/billing-express/deploy.sh",
    "command-working-directory": "/var/www/billing-internet/billing-express",
    "response-message": "Deploying...",
    "trigger-rule": {
      "match": {
        "type": "payload-hmac-sha256",
        "secret": "your-secret-key",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
```

### 3. Start webhook service

```bash
webhook -hooks /etc/webhook.conf -port 9000 -verbose &
```

### 4. Setup di GitHub

- Buka repo GitHub > Settings > Webhooks
- Add webhook:
  - Payload URL: `http://IP-SERVER:9000/hooks/deploy-billing`
  - Content type: `application/json`
  - Secret: `your-secret-key`
  - Events: Just the push event

Sekarang setiap kali push ke GitHub, server otomatis pull dan deploy!

---

## Tips

- Jangan commit file `.env` ke GitHub (sudah di .gitignore)
- Jangan commit folder `node_modules`, `dist`, `whatsapp-session`
- Selalu test di lokal sebelum push ke GitHub
- Gunakan branch `main` untuk production
