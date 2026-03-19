# Panduan Deploy TamNet Billing System

## Opsi 1: Deploy di VPS/Server Linux (Recommended)

### Persiapan Server

1. **Install Dependencies**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

2. **Setup MySQL**
```bash
sudo mysql_secure_installation

# Login ke MySQL
sudo mysql -u root -p

# Buat database dan user
CREATE DATABASE billing_internet;
CREATE USER 'billing_user'@'localhost' IDENTIFIED BY 'password_kuat_123';
GRANT ALL PRIVILEGES ON billing_internet.* TO 'billing_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Deploy Aplikasi

1. **Clone/Upload Project**
```bash
cd /var/www
sudo git clone <your-repo-url> billing-tamnet
# Atau upload via FTP/SFTP

cd billing-tamnet/billing-express
```

2. **Setup Backend**
```bash
cd backend

# Install dependencies
npm install --production

# Copy dan edit .env
cp .env.example .env
nano .env
```

Edit `.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=billing_user
DB_PASSWORD=password_kuat_123
DB_NAME=billing_internet

# MikroTik
MIKROTIK_HOST=157.15.67.185
MIKROTIK_PORT=9125
MIKROTIK_USER=tamnet
MIKROTIK_PASSWORD=tino2025
```

3. **Initialize Database**
```bash
node scripts/init-db.js
node scripts/add-wa-notification.js
```

4. **Build Frontend**
```bash
cd ../frontend

# Install dependencies
npm install

# Build untuk production
npm run build
# Hasil build ada di folder 'dist'
```

5. **Serve Frontend dari Backend**

Edit `backend/server.js`, tambahkan setelah line `app.use('/uploads', ...)`:

```javascript
// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend/dist')
app.use(express.static(frontendPath))

// Handle React Router - semua route selain /api/* serve index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next()
  res.sendFile(path.join(frontendPath, 'index.html'))
})
```

6. **Start dengan PM2**
```bash
cd backend

# Start aplikasi
pm2 start server.js --name billing-tamnet

# Auto-start on server reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs billing-tamnet

# Status
pm2 status
```

7. **Setup Nginx (Reverse Proxy)**
```bash
sudo apt install -y nginx

# Buat config
sudo nano /etc/nginx/sites-available/billing-tamnet
```

Isi config:
```nginx
server {
    listen 80;
    server_name billing.tamnet.com;  # Ganti dengan domain Anda

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/billing-tamnet /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

8. **Setup SSL (Optional tapi Recommended)**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d billing.tamnet.com
```

### Akses Aplikasi

- HTTP: `http://your-server-ip` atau `http://billing.tamnet.com`
- HTTPS: `https://billing.tamnet.com` (jika sudah setup SSL)

---

## Opsi 2: Deploy di Windows Server

### Persiapan

1. Install Node.js 20.x dari https://nodejs.org
2. Install MySQL dari https://dev.mysql.com/downloads/installer/
3. Install PM2: `npm install -g pm2`
4. Install PM2 Windows Service: `npm install -g pm2-windows-service`

### Setup

1. **Setup Database** (sama seperti di Linux)

2. **Setup Backend**
```powershell
cd E:\billing-tamnet\billing-express\backend
npm install --production
copy .env.example .env
notepad .env  # Edit konfigurasi
node scripts/init-db.js
```

3. **Build Frontend**
```powershell
cd ..\frontend
npm install
npm run build
```

4. **Update server.js** (sama seperti Opsi 1 step 5)

5. **Start dengan PM2**
```powershell
cd ..\backend
pm2 start server.js --name billing-tamnet
pm2-service-install
pm2 save
```

6. **Setup IIS Reverse Proxy** (Optional)
- Install IIS
- Install URL Rewrite Module
- Install Application Request Routing
- Configure reverse proxy ke localhost:5000

---

## Opsi 3: Deploy dengan Docker

### 1. Buat Dockerfile untuk Backend

`billing-express/backend/Dockerfile`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Expose port
EXPOSE 5000

# Start
CMD ["node", "server.js"]
```

### 2. Buat Dockerfile untuk Frontend

`billing-express/frontend/Dockerfile`:
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

`billing-express/frontend/nginx.conf`:
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Docker Compose

`billing-express/docker-compose.yml`:
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: billing_internet
      MYSQL_USER: billing_user
      MYSQL_PASSWORD: billing_pass
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - billing-network

  backend:
    build: ./backend
    environment:
      PORT: 5000
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: billing_user
      DB_PASSWORD: billing_pass
      DB_NAME: billing_internet
      MIKROTIK_HOST: 157.15.67.185
      MIKROTIK_PORT: 9125
      MIKROTIK_USER: tamnet
      MIKROTIK_PASSWORD: tino2025
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/whatsapp-session:/app/whatsapp-session
    depends_on:
      - mysql
    ports:
      - "5000:5000"
    networks:
      - billing-network
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - billing-network
    restart: unless-stopped

volumes:
  mysql_data:

networks:
  billing-network:
    driver: bridge
```

### 4. Deploy dengan Docker

```bash
cd billing-express

# Build dan start
docker-compose up -d

# Initialize database (first time only)
docker-compose exec backend node scripts/init-db.js
docker-compose exec backend node scripts/add-wa-notification.js

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart
```

---

## Post-Deploy Checklist

### 1. Scan WhatsApp QR Code
```
http://your-server-ip:5000/api/whatsapp/qr
```

### 2. Login Pertama Kali
- Username: admin (sesuai yang dibuat di init-db.js)
- Password: (sesuai yang dibuat di init-db.js)

### 3. Konfigurasi MikroTik
- Masuk ke menu Pengaturan
- Isi konfigurasi MikroTik
- Test koneksi

### 4. Setup Monitoring
- Monitoring service otomatis jalan setiap 5 menit
- Cek logs: `pm2 logs billing-tamnet`

### 5. Backup Database
```bash
# Manual backup
mysqldump -u billing_user -p billing_internet > backup_$(date +%Y%m%d).sql

# Auto backup (crontab)
crontab -e
# Tambahkan:
0 2 * * * mysqldump -u billing_user -pPASSWORD billing_internet > /backup/billing_$(date +\%Y\%m\%d).sql
```

---

## Troubleshooting

### Backend tidak start
```bash
pm2 logs billing-tamnet
# Cek error di logs
```

### Database connection error
```bash
# Test koneksi MySQL
mysql -u billing_user -p billing_internet

# Cek .env file
cat backend/.env
```

### WhatsApp Gateway error
```bash
# Hapus session dan scan ulang
cd backend
rm -rf whatsapp-session .wwebjs_cache
pm2 restart billing-tamnet
# Scan QR lagi
```

### Port sudah digunakan
```bash
# Cek port 5000
sudo lsof -i :5000
# Kill process
sudo kill -9 <PID>
```

---

## Maintenance

### Update Aplikasi
```bash
cd /var/www/billing-tamnet/billing-express

# Pull update
git pull

# Update backend
cd backend
npm install --production
pm2 restart billing-tamnet

# Update frontend
cd ../frontend
npm install
npm run build
```

### Monitor Resources
```bash
# CPU & Memory
pm2 monit

# Disk usage
df -h

# MySQL status
sudo systemctl status mysql
```

### Clean Logs
```bash
# PM2 logs
pm2 flush

# MySQL slow query log
sudo rm /var/log/mysql/slow-query.log
sudo systemctl restart mysql
```

---

## Security Tips

1. **Firewall**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

2. **MySQL Security**
- Jangan expose port 3306 ke public
- Gunakan password kuat
- Backup database secara berkala

3. **Environment Variables**
- Jangan commit file .env ke Git
- Gunakan password yang berbeda untuk production

4. **SSL Certificate**
- Selalu gunakan HTTPS di production
- Renew certificate otomatis dengan certbot

5. **Update Dependencies**
```bash
npm audit
npm audit fix
```

---

## Support

Untuk bantuan lebih lanjut:
- Cek logs: `pm2 logs billing-tamnet`
- Restart service: `pm2 restart billing-tamnet`
- Status: `pm2 status`
