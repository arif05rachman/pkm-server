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
