require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mysql = require('mysql2/promise')

async function init() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 3306,
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  console.log('✅ Terhubung ke MySQL')

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'billing_internet'}\``)
  await conn.query(`USE \`${process.env.DB_NAME || 'billing_internet'}\``)
  console.log('✅ Database siap')

  await conn.query(`
    CREATE TABLE IF NOT EXISTS paket (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      nama_paket  VARCHAR(100) NOT NULL,
      kecepatan   INT NOT NULL,
      harga       DECIMAL(12,0) NOT NULL,
      deskripsi   TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS pelanggan (
      id            INT AUTO_INCREMENT PRIMARY KEY,
      nama          VARCHAR(100) NOT NULL,
      email         VARCHAR(100),
      telepon       VARCHAR(20),
      alamat        TEXT,
      ip_address    VARCHAR(20),
      id_paket      INT,
      status        ENUM('Aktif','Nonaktif','Trial') DEFAULT 'Aktif',
      tgl_bergabung DATE,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_paket) REFERENCES paket(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS tagihan (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      no_tagihan      VARCHAR(30) UNIQUE NOT NULL,
      id_pelanggan    INT NOT NULL,
      periode         VARCHAR(30),
      jumlah          DECIMAL(12,0) NOT NULL,
      tgl_jatuh_tempo DATE,
      status          ENUM('Lunas','Belum Bayar','Terlambat') DEFAULT 'Belum Bayar',
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_pelanggan) REFERENCES pelanggan(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS pembayaran (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      id_tagihan  INT NOT NULL,
      jumlah      DECIMAL(12,0) NOT NULL,
      metode      ENUM('Transfer Bank','Tunai','QRIS','E-Wallet') DEFAULT 'Tunai',
      tgl_bayar   DATETIME DEFAULT CURRENT_TIMESTAMP,
      keterangan  TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_tagihan) REFERENCES tagihan(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS pengaturan (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      nama_isp   VARCHAR(100),
      telepon    VARCHAR(20),
      email      VARCHAR(100),
      website    VARCHAR(100),
      alamat     TEXT,
      logo_url   VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS pengeluaran (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      kategori        VARCHAR(50) NOT NULL,
      jumlah          DECIMAL(12,0) NOT NULL,
      tgl_pengeluaran DATE NOT NULL,
      keterangan      TEXT,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;

    CREATE TABLE IF NOT EXISTS karyawan (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      nama       VARCHAR(100) NOT NULL,
      email      VARCHAR(100) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      role       ENUM('admin','bendahara','karyawan') DEFAULT 'karyawan',
      telepon    VARCHAR(20),
      alamat     TEXT,
      foto       VARCHAR(255),
      aktif      TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `)
  console.log('✅ Semua tabel siap')

  // Indexes
  const indexes = [
    ['pelanggan',  'idx_pel_status',   'status'],
    ['pelanggan',  'idx_pel_id_paket', 'id_paket'],
    ['pelanggan',  'idx_pel_nama',     'nama'],
    ['tagihan',    'idx_tag_pelanggan','id_pelanggan'],
    ['tagihan',    'idx_tag_status',   'status'],
    ['tagihan',    'idx_tag_created',  'created_at'],
    ['pembayaran', 'idx_pay_tagihan',  'id_tagihan'],
    ['pembayaran', 'idx_pay_tgl',      'tgl_bayar'],
    ['pengeluaran','idx_pgl_tgl',      'tgl_pengeluaran'],
    ['pengeluaran','idx_pgl_kategori', 'kategori'],
  ]
  for (const [table, name, col] of indexes) {
    await conn.query(`ALTER TABLE \`${table}\` ADD INDEX \`${name}\` (${col})`).catch(() => {})
  }
  console.log('✅ Indexes siap')

  // Seed paket
  await conn.query(`
    INSERT IGNORE INTO paket (id, nama_paket, kecepatan, harga, deskripsi) VALUES
    (1, 'Paket Starter 10M',  10,  100000, 'Cocok untuk 1-2 perangkat rumahan'),
    (2, 'Paket Keluarga 20M', 20,  175000, 'Streaming & browsing seluruh keluarga'),
    (3, 'Paket Rumahan 50M',  50,  300000, 'Gaming & kerja dari rumah'),
    (4, 'Paket Bisnis 100M',  100, 550000, 'Performa maksimal untuk bisnis');
  `)

  // Seed pelanggan
  await conn.query(`
    INSERT IGNORE INTO pelanggan (id, nama, email, telepon, alamat, ip_address, id_paket, status, tgl_bergabung) VALUES
    (1, 'Budi Santoso',  'budi@email.com',   '0812-1234-5678', 'Jl. Mawar No. 5',   '192.168.1.101', 1, 'Aktif',    '2024-01-15'),
    (2, 'Siti Rahayu',   'siti@email.com',   '0813-2345-6789', 'Jl. Melati No. 3',  '192.168.1.102', 2, 'Aktif',    '2024-02-10'),
    (3, 'Agus Priyanto', 'agus@email.com',   '0814-3456-7890', 'Jl. Dahlia No. 7',  '192.168.1.103', 3, 'Trial',    '2026-03-01'),
    (4, 'Dewi Kusuma',   'dewi@email.com',   '0815-4567-8901', 'Jl. Anggrek No. 2', '192.168.1.104', 1, 'Aktif',    '2023-11-20'),
    (5, 'Hendra Wijaya', 'hendra@email.com', '0816-5678-9012', 'Jl. Kenanga No. 9', '192.168.1.105', 4, 'Nonaktif', '2023-08-05'),
    (6, 'Rina Amelia',   'rina@email.com',   '0817-6789-0123', 'Jl. Tulip No. 11',  '192.168.1.106', 2, 'Aktif',    '2025-06-18');
  `)

  // Seed tagihan
  await conn.query(`
    INSERT IGNORE INTO tagihan (id, no_tagihan, id_pelanggan, periode, jumlah, tgl_jatuh_tempo, status) VALUES
    (1, 'INV-2603-001', 1, 'Maret 2026', 100000, '2026-03-20', 'Lunas'),
    (2, 'INV-2603-002', 2, 'Maret 2026', 175000, '2026-03-20', 'Belum Bayar'),
    (3, 'INV-2603-003', 3, 'Maret 2026', 300000, '2026-03-25', 'Belum Bayar'),
    (4, 'INV-2603-004', 4, 'Maret 2026', 100000, '2026-03-20', 'Lunas'),
    (5, 'INV-2603-005', 6, 'Maret 2026', 175000, '2026-03-22', 'Belum Bayar');
  `)

  // Seed pembayaran
  await conn.query(`
    INSERT IGNORE INTO pembayaran (id, id_tagihan, jumlah, metode, tgl_bayar) VALUES
    (1, 1, 100000, 'Transfer Bank', '2026-03-10 09:30:00'),
    (2, 4, 100000, 'Tunai',         '2026-03-11 14:00:00');
  `)

  // Seed pengaturan
  await conn.query(`
    INSERT IGNORE INTO pengaturan (nama_isp, telepon, email, website, alamat) VALUES
    ('NetBill Internet Provider', '(0355) 123-4567', 'info@netbill.id', 'https://netbill.id', 'Jl. Mawar No. 12, Tulungagung');
  `)

  // Seed pengeluaran
  await conn.query(`
    INSERT IGNORE INTO pengeluaran (id, kategori, jumlah, tgl_pengeluaran, keterangan) VALUES
    (1, 'Listrik',      350000, '2026-03-05', 'Tagihan listrik bulan Maret'),
    (2, 'Operasional',  150000, '2026-03-07', 'Pembelian alat tulis kantor'),
    (3, 'Gaji',        2500000, '2026-03-01', 'Gaji teknisi lapangan'),
    (4, 'Peralatan',    800000, '2026-03-12', 'Kabel UTP Cat6 50m');
  `)

  // Seed karyawan (password: admin123, bendahara123, karyawan123)
  const bcrypt = require('bcryptjs')
  const users = [
    { id: 1, nama: 'Super Admin',    email: 'admin@netbill.id',      password: 'admin123',     role: 'admin' },
    { id: 2, nama: 'Sari Bendahara', email: 'bendahara@netbill.id',  password: 'bendahara123', role: 'bendahara' },
    { id: 3, nama: 'Budi Teknisi',   email: 'karyawan@netbill.id',   password: 'karyawan123',  role: 'karyawan' },
  ]
  for (const u of users) {
    const hashed = await bcrypt.hash(u.password, 10)
    await conn.query(
      'INSERT IGNORE INTO karyawan (id, nama, email, password, role) VALUES (?,?,?,?,?)',
      [u.id, u.nama, u.email, hashed, u.role]
    )
  }
  console.log('✅ Karyawan seed: admin@netbill.id / admin123')

  console.log('✅ Data seed berhasil')
  console.log('\n🎉 Database billing_internet siap!')
  await conn.end()
}

init().catch(err => { console.error('❌ Error:', err.message); process.exit(1) })
