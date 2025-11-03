-- Create database (run this manually if needed)
-- CREATE DATABASE inventory_db;

-- Create users table (without id_karyawan FK, will be added after karyawan table)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
-- Note: idx_users_id_karyawan will be created after id_karyawan column is added

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
-- This will create admin user if it doesn't exist, or update if exists
INSERT INTO users (username, email, password, role, is_active) 
VALUES (
    'admin', 
    'admin@inventory.com', 
    '$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW', 
    'admin', 
    true
) ON CONFLICT (username) 
DO UPDATE SET 
    email = EXCLUDED.email,
    password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Handle email conflict separately (in case email exists but username is different)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = 'admin@inventory.com' AND username != 'admin') THEN
        UPDATE users 
        SET username = 'admin',
            password = '$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW',
            role = 'admin',
            is_active = true,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = 'admin@inventory.com';
    END IF;
END $$;

-- Create products table (example for inventory management)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    category VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for refresh_tokens updated_at
CREATE TRIGGER update_refresh_tokens_updated_at 
    BEFORE UPDATE ON refresh_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_is_revoked ON refresh_tokens(is_revoked);

-- Create karyawan table
CREATE TABLE IF NOT EXISTS karyawan (
    id_karyawan SERIAL PRIMARY KEY,
    nama_karyawan VARCHAR(100) NOT NULL,
    jabatan VARCHAR(100) NOT NULL,
    nip VARCHAR(50) UNIQUE,
    no_hp VARCHAR(20),
    alamat TEXT,
    status_aktif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for karyawan updated_at
CREATE TRIGGER update_karyawan_updated_at 
    BEFORE UPDATE ON karyawan 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for karyawan
CREATE INDEX IF NOT EXISTS idx_karyawan_nip ON karyawan(nip);
CREATE INDEX IF NOT EXISTS idx_karyawan_jabatan ON karyawan(jabatan);
CREATE INDEX IF NOT EXISTS idx_karyawan_status_aktif ON karyawan(status_aktif);
CREATE INDEX IF NOT EXISTS idx_karyawan_nama_karyawan ON karyawan(nama_karyawan);

-- Add id_karyawan foreign key to users table
-- This is done after karyawan table is created
DO $$
BEGIN
    -- Add column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'id_karyawan'
    ) THEN
        ALTER TABLE users ADD COLUMN id_karyawan INTEGER;
    END IF;
    
    -- Add foreign key constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_id_karyawan_fkey'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_id_karyawan_fkey 
        FOREIGN KEY (id_karyawan) 
        REFERENCES karyawan(id_karyawan) 
        ON DELETE SET NULL;
    END IF;
    
    -- Create index if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'users' AND indexname = 'idx_users_id_karyawan'
    ) THEN
        CREATE INDEX idx_users_id_karyawan ON users(id_karyawan);
    END IF;
END $$;

-- Create barang table
CREATE TABLE IF NOT EXISTS barang (
    id_barang SERIAL PRIMARY KEY,
    nama_barang VARCHAR(100) NOT NULL,
    satuan VARCHAR(20) NOT NULL CHECK (satuan IN ('pcs', 'botol', 'tablet')),
    jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('Obat', 'Alkes', 'BMHP')),
    stok_minimal INTEGER NOT NULL DEFAULT 0,
    lokasi VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for barang updated_at
CREATE TRIGGER update_barang_updated_at 
    BEFORE UPDATE ON barang 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for barang
CREATE INDEX IF NOT EXISTS idx_barang_nama_barang ON barang(nama_barang);
CREATE INDEX IF NOT EXISTS idx_barang_jenis ON barang(jenis);
CREATE INDEX IF NOT EXISTS idx_barang_satuan ON barang(satuan);
CREATE INDEX IF NOT EXISTS idx_barang_lokasi ON barang(lokasi);

-- Create supplier table
CREATE TABLE IF NOT EXISTS supplier (
    id_supplier SERIAL PRIMARY KEY,
    nama_supplier VARCHAR(100) NOT NULL,
    alamat TEXT,
    kontak VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for supplier updated_at
CREATE TRIGGER update_supplier_updated_at 
    BEFORE UPDATE ON supplier 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for supplier
CREATE INDEX IF NOT EXISTS idx_supplier_nama_supplier ON supplier(nama_supplier);
CREATE INDEX IF NOT EXISTS idx_supplier_kontak ON supplier(kontak);

-- Create transaksi_masuk table
CREATE TABLE IF NOT EXISTS transaksi_masuk (
    id_transaksi_masuk SERIAL PRIMARY KEY,
    tanggal_masuk DATE NOT NULL,
    id_supplier INTEGER REFERENCES supplier(id_supplier) ON DELETE SET NULL,
    id_user INTEGER REFERENCES users(id) ON DELETE SET NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for transaksi_masuk updated_at
CREATE TRIGGER update_transaksi_masuk_updated_at 
    BEFORE UPDATE ON transaksi_masuk 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for transaksi_masuk
CREATE INDEX IF NOT EXISTS idx_transaksi_masuk_tanggal ON transaksi_masuk(tanggal_masuk);
CREATE INDEX IF NOT EXISTS idx_transaksi_masuk_supplier ON transaksi_masuk(id_supplier);
CREATE INDEX IF NOT EXISTS idx_transaksi_masuk_user ON transaksi_masuk(id_user);

-- Create detail_transaksi_masuk table
CREATE TABLE IF NOT EXISTS detail_transaksi_masuk (
    id_detail_masuk SERIAL PRIMARY KEY,
    id_transaksi_masuk INTEGER NOT NULL REFERENCES transaksi_masuk(id_transaksi_masuk) ON DELETE CASCADE,
    id_barang INTEGER NOT NULL REFERENCES barang(id_barang) ON DELETE CASCADE,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    harga_satuan DECIMAL(12,2) NOT NULL CHECK (harga_satuan >= 0),
    tanggal_kadaluarsa DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for detail_transaksi_masuk updated_at
CREATE TRIGGER update_detail_transaksi_masuk_updated_at 
    BEFORE UPDATE ON detail_transaksi_masuk 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for detail_transaksi_masuk
CREATE INDEX IF NOT EXISTS idx_detail_transaksi_masuk_transaksi ON detail_transaksi_masuk(id_transaksi_masuk);
CREATE INDEX IF NOT EXISTS idx_detail_transaksi_masuk_barang ON detail_transaksi_masuk(id_barang);
CREATE INDEX IF NOT EXISTS idx_detail_transaksi_masuk_kadaluarsa ON detail_transaksi_masuk(tanggal_kadaluarsa);

-- Create transaksi_keluar table
CREATE TABLE IF NOT EXISTS transaksi_keluar (
    id_transaksi_keluar SERIAL PRIMARY KEY,
    tanggal_keluar DATE NOT NULL,
    tujuan VARCHAR(200) NOT NULL,
    id_user INTEGER REFERENCES users(id) ON DELETE SET NULL,
    keterangan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for transaksi_keluar updated_at
CREATE TRIGGER update_transaksi_keluar_updated_at 
    BEFORE UPDATE ON transaksi_keluar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for transaksi_keluar
CREATE INDEX IF NOT EXISTS idx_transaksi_keluar_tanggal ON transaksi_keluar(tanggal_keluar);
CREATE INDEX IF NOT EXISTS idx_transaksi_keluar_user ON transaksi_keluar(id_user);
CREATE INDEX IF NOT EXISTS idx_transaksi_keluar_tujuan ON transaksi_keluar(tujuan);

-- Create detail_transaksi_keluar table
CREATE TABLE IF NOT EXISTS detail_transaksi_keluar (
    id_detail_keluar SERIAL PRIMARY KEY,
    id_transaksi_keluar INTEGER NOT NULL REFERENCES transaksi_keluar(id_transaksi_keluar) ON DELETE CASCADE,
    id_barang INTEGER NOT NULL REFERENCES barang(id_barang) ON DELETE CASCADE,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for detail_transaksi_keluar updated_at
CREATE TRIGGER update_detail_transaksi_keluar_updated_at 
    BEFORE UPDATE ON detail_transaksi_keluar 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for detail_transaksi_keluar
CREATE INDEX IF NOT EXISTS idx_detail_transaksi_keluar_transaksi ON detail_transaksi_keluar(id_transaksi_keluar);
CREATE INDEX IF NOT EXISTS idx_detail_transaksi_keluar_barang ON detail_transaksi_keluar(id_barang);

-- Create log_activity table
CREATE TABLE IF NOT EXISTS log_activity (
    id_log SERIAL PRIMARY KEY,
    id_user INTEGER REFERENCES users(id) ON DELETE SET NULL,
    waktu TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aksi VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for log_activity
CREATE INDEX IF NOT EXISTS idx_log_activity_user ON log_activity(id_user);
CREATE INDEX IF NOT EXISTS idx_log_activity_waktu ON log_activity(waktu);
CREATE INDEX IF NOT EXISTS idx_log_activity_aksi ON log_activity(aksi);
CREATE INDEX IF NOT EXISTS idx_log_activity_ip ON log_activity(ip_address);

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert sample karyawan data
INSERT INTO karyawan (nama_karyawan, jabatan, nip, no_hp, alamat, status_aktif) VALUES
('Dr. Ahmad Hidayat', 'Dokter Umum', '196501011990011001', '081234567890', 'Jl. Raya Puskesmas No. 1, Jakarta', true),
('Siti Nurhaliza', 'Bidan', '197502021995022002', '081234567891', 'Jl. Merdeka No. 10, Jakarta', true),
('Budi Santoso', 'Perawat', '198503031998033003', '081234567892', 'Jl. Sudirman No. 20, Jakarta', true),
('Dewi Sartika', 'Admin', '199504041999044004', '081234567893', 'Jl. Thamrin No. 30, Jakarta', true),
('Muhammad Rizki', 'Petugas Farmasi', '199605052000055005', '081234567894', 'Jl. Gatot Subroto No. 40, Jakarta', true)
ON CONFLICT (nip) DO NOTHING;

-- Update admin user with karyawan reference
UPDATE users SET id_karyawan = (SELECT id_karyawan FROM karyawan WHERE nip = '196501011990011001' LIMIT 1) 
WHERE username = 'admin' AND id_karyawan IS NULL;

-- Insert additional sample users
INSERT INTO users (username, email, password, role, id_karyawan, is_active) VALUES
('dokter.ahmad', 'ahmad.hidayat@puskesmas.go.id', '$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW', 'user', (SELECT id_karyawan FROM karyawan WHERE nip = '196501011990011001' LIMIT 1), true),
('bidan.siti', 'siti.nurhaliza@puskesmas.go.id', '$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW', 'user', (SELECT id_karyawan FROM karyawan WHERE nip = '197502021995022002' LIMIT 1), true),
('perawat.budi', 'budi.santoso@puskesmas.go.id', '$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW', 'manager', (SELECT id_karyawan FROM karyawan WHERE nip = '198503031998033003' LIMIT 1), true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample barang data
INSERT INTO barang (nama_barang, satuan, jenis, stok_minimal, lokasi) VALUES
('Paracetamol 500mg', 'tablet', 'Obat', 500, 'Gudang A - Rak 1'),
('Amoxicillin 500mg', 'tablet', 'Obat', 300, 'Gudang A - Rak 2'),
('Antasida DOEN', 'tablet', 'Obat', 200, 'Gudang A - Rak 3'),
('Albumin 20%', 'botol', 'Obat', 50, 'Gudang B - Kulkas'),
('Infus NaCl 0.9%', 'botol', 'Obat', 200, 'Gudang B - Rak 4'),
('Masker Bedah', 'pcs', 'Alkes', 1000, 'Gudang C - Rak 5'),
('Sarung Tangan Lateks', 'pcs', 'Alkes', 500, 'Gudang C - Rak 6'),
('Suntik 3ml', 'pcs', 'Alkes', 300, 'Gudang C - Rak 7'),
('Suntik 5ml', 'pcs', 'Alkes', 300, 'Gudang C - Rak 7'),
('Alkohol 70%', 'botol', 'BMHP', 100, 'Gudang D - Rak 8'),
('Betadine', 'botol', 'BMHP', 150, 'Gudang D - Rak 9'),
('Kapas Steril', 'pcs', 'BMHP', 500, 'Gudang D - Rak 10'),
('Kassa Steril', 'pcs', 'BMHP', 300, 'Gudang D - Rak 10')
ON CONFLICT DO NOTHING;

-- Insert sample supplier data
INSERT INTO supplier (nama_supplier, alamat, kontak) VALUES
('PT. Farmasi Sejahtera', 'Jl. Industri No. 100, Jakarta Barat', '021-12345678'),
('CV. Medika Utama', 'Jl. Perdagangan No. 200, Jakarta Utara', '021-87654321'),
('PT. Kesehatan Indonesia', 'Jl. Bisnis No. 300, Jakarta Selatan', '021-11223344'),
('UD. Alat Kesehatan', 'Jl. Pasar No. 400, Jakarta Timur', '021-99887766'),
('PT. Bahan Medis', 'Jl. Distribusi No. 500, Bekasi', '021-55443322')
ON CONFLICT DO NOTHING;

-- Insert sample transaksi masuk
INSERT INTO transaksi_masuk (tanggal_masuk, id_supplier, id_user, keterangan) VALUES
(CURRENT_DATE - INTERVAL '30 days', (SELECT id_supplier FROM supplier WHERE nama_supplier = 'PT. Farmasi Sejahtera' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Pembelian rutin bulanan'),
(CURRENT_DATE - INTERVAL '15 days', (SELECT id_supplier FROM supplier WHERE nama_supplier = 'CV. Medika Utama' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Stock replenishment'),
(CURRENT_DATE - INTERVAL '5 days', (SELECT id_supplier FROM supplier WHERE nama_supplier = 'PT. Kesehatan Indonesia' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Pembelian darurat')
ON CONFLICT DO NOTHING;

-- Insert sample detail transaksi masuk
-- Get transaction IDs using subquery with MIN/MAX to ensure we get the right ones
INSERT INTO detail_transaksi_masuk (id_transaksi_masuk, id_barang, jumlah, harga_satuan, tanggal_kadaluarsa)
SELECT 
  tm.id_transaksi_masuk,
  b.id_barang,
  CASE 
    WHEN b.nama_barang = 'Paracetamol 500mg' THEN 1000
    WHEN b.nama_barang = 'Amoxicillin 500mg' THEN 500
    WHEN b.nama_barang = 'Masker Bedah' THEN 2000
    WHEN b.nama_barang = 'Sarung Tangan Lateks' THEN 1000
    WHEN b.nama_barang = 'Albumin 20%' THEN 20
    WHEN b.nama_barang = 'Infus NaCl 0.9%' THEN 300
    WHEN b.nama_barang = 'Alkohol 70%' THEN 50
  END as jumlah,
  CASE 
    WHEN b.nama_barang = 'Paracetamol 500mg' THEN 500
    WHEN b.nama_barang = 'Amoxicillin 500mg' THEN 750
    WHEN b.nama_barang = 'Masker Bedah' THEN 2000
    WHEN b.nama_barang = 'Sarung Tangan Lateks' THEN 1500
    WHEN b.nama_barang = 'Albumin 20%' THEN 250000
    WHEN b.nama_barang = 'Infus NaCl 0.9%' THEN 15000
    WHEN b.nama_barang = 'Alkohol 70%' THEN 25000
  END as harga_satuan,
  CASE 
    WHEN b.nama_barang = 'Paracetamol 500mg' AND tm.tanggal_masuk = (SELECT MIN(tanggal_masuk) FROM transaksi_masuk) THEN CURRENT_DATE + INTERVAL '2 years'
    WHEN b.nama_barang = 'Amoxicillin 500mg' THEN CURRENT_DATE + INTERVAL '1 year'
    WHEN b.nama_barang = 'Albumin 20%' THEN CURRENT_DATE + INTERVAL '6 months'
    WHEN b.nama_barang = 'Infus NaCl 0.9%' THEN CURRENT_DATE + INTERVAL '1 year'
    WHEN b.nama_barang = 'Alkohol 70%' THEN CURRENT_DATE + INTERVAL '3 years'
    ELSE NULL
  END as tanggal_kadaluarsa
FROM transaksi_masuk tm
CROSS JOIN barang b
WHERE 
  (tm.tanggal_masuk = (SELECT MIN(tanggal_masuk) FROM transaksi_masuk) AND b.nama_barang IN ('Paracetamol 500mg', 'Amoxicillin 500mg'))
  OR (tm.tanggal_masuk = (SELECT tanggal_masuk FROM transaksi_masuk ORDER BY tanggal_masuk OFFSET 1 LIMIT 1) AND b.nama_barang IN ('Masker Bedah', 'Sarung Tangan Lateks'))
  OR (tm.tanggal_masuk = (SELECT MAX(tanggal_masuk) FROM transaksi_masuk) AND b.nama_barang IN ('Albumin 20%', 'Infus NaCl 0.9%', 'Alkohol 70%'))
ON CONFLICT DO NOTHING;

-- Insert sample transaksi keluar
INSERT INTO transaksi_keluar (tanggal_keluar, tujuan, id_user, keterangan) VALUES
(CURRENT_DATE - INTERVAL '20 days', 'Poli Umum', (SELECT id FROM users WHERE username = 'perawat.budi' LIMIT 1), 'Distribusi rutin ke poli'),
(CURRENT_DATE - INTERVAL '10 days', 'Poli KIA', (SELECT id FROM users WHERE username = 'bidan.siti' LIMIT 1), 'Distribusi ke poli KIA'),
(CURRENT_DATE - INTERVAL '3 days', 'UGD', (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Distribusi darurat ke UGD')
ON CONFLICT DO NOTHING;

-- Insert sample detail transaksi keluar
INSERT INTO detail_transaksi_keluar (id_transaksi_keluar, id_barang, jumlah)
SELECT 
  tk.id_transaksi_keluar,
  b.id_barang,
  CASE 
    WHEN b.nama_barang = 'Paracetamol 500mg' THEN 200
    WHEN b.nama_barang = 'Amoxicillin 500mg' THEN 100
    WHEN b.nama_barang = 'Antasida DOEN' THEN 50
    WHEN b.nama_barang = 'Suntik 3ml' THEN 100
    WHEN b.nama_barang = 'Infus NaCl 0.9%' THEN 50
    WHEN b.nama_barang = 'Masker Bedah' THEN 200
    WHEN b.nama_barang = 'Sarung Tangan Lateks' THEN 150
  END as jumlah
FROM transaksi_keluar tk
CROSS JOIN barang b
WHERE 
  (tk.tanggal_keluar = (SELECT MIN(tanggal_keluar) FROM transaksi_keluar) AND b.nama_barang IN ('Paracetamol 500mg', 'Amoxicillin 500mg'))
  OR (tk.tanggal_keluar = (SELECT tanggal_keluar FROM transaksi_keluar ORDER BY tanggal_keluar OFFSET 1 LIMIT 1) AND b.nama_barang IN ('Antasida DOEN', 'Suntik 3ml'))
  OR (tk.tanggal_keluar = (SELECT MAX(tanggal_keluar) FROM transaksi_keluar) AND b.nama_barang IN ('Infus NaCl 0.9%', 'Masker Bedah', 'Sarung Tangan Lateks'))
ON CONFLICT DO NOTHING;

-- Insert sample log activity
INSERT INTO log_activity (id_user, waktu, aksi, deskripsi, ip_address) VALUES
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '1 hour', 'LOGIN', 'User admin berhasil login', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '2 hours', 'INSERT', 'Barang baru ditambahkan: Paracetamol 500mg', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '3 hours', 'INSERT', 'Supplier baru ditambahkan: PT. Farmasi Sejahtera', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'perawat.budi' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '4 hours', 'LOGIN', 'User perawat.budi berhasil login', '192.168.1.100'),
((SELECT id FROM users WHERE username = 'perawat.budi' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '5 hours', 'INSERT', 'Transaksi keluar dibuat untuk Poli Umum', '192.168.1.100'),
((SELECT id FROM users WHERE username = 'bidan.siti' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '6 hours', 'LOGIN', 'User bidan.siti berhasil login', '192.168.1.101'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '7 hours', 'UPDATE', 'Data karyawan diupdate: Dr. Ahmad Hidayat', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '8 hours', 'INSERT', 'Transaksi masuk baru dibuat', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '1 day', 'CETAK', 'Laporan stok barang dicetak', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '2 days', 'INSERT', 'Karyawan baru ditambahkan: Muhammad Rizki', '127.0.0.1')
ON CONFLICT DO NOTHING;
