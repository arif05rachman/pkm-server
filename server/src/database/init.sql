-- Create database (run this manually if needed)
-- CREATE DATABASE inventory_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'manager')),
    is_active BOOLEAN DEFAULT true,
    employee_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id);

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

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for refresh_tokens
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Create trigger for refresh_tokens updated_at
CREATE TRIGGER update_refresh_tokens_updated_at 
    BEFORE UPDATE ON refresh_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
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

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    nip VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for employees updated_at
CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for employees
CREATE INDEX IF NOT EXISTS idx_employees_nip ON employees(nip);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position);
CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_name ON employees(name);

-- Add foreign key constraint to users table
ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_employee_id_fkey;

ALTER TABLE users 
ADD CONSTRAINT users_employee_id_fkey 
FOREIGN KEY (employee_id) 
REFERENCES employees(id) 
ON DELETE SET NULL;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for categories updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for categories
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('pcs', 'bottle', 'tablet')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('Medicine', 'Medical Device', 'Medical Material')),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    min_stock INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for products updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for products
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_unit ON products(unit);
CREATE INDEX IF NOT EXISTS idx_products_location ON products(location);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    contact VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for suppliers updated_at
CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for suppliers
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_contact ON suppliers(contact);

-- Create stock_ins table
CREATE TABLE IF NOT EXISTS stock_ins (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for stock_ins updated_at
CREATE TRIGGER update_stock_ins_updated_at 
    BEFORE UPDATE ON stock_ins 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for stock_ins
CREATE INDEX IF NOT EXISTS idx_stock_ins_date ON stock_ins(date);
CREATE INDEX IF NOT EXISTS idx_stock_ins_supplier ON stock_ins(supplier_id);
CREATE INDEX IF NOT EXISTS idx_stock_ins_user ON stock_ins(user_id);

-- Create stock_in_details table
CREATE TABLE IF NOT EXISTS stock_in_details (
    id SERIAL PRIMARY KEY,
    stock_in_id INTEGER NOT NULL REFERENCES stock_ins(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for stock_in_details updated_at
CREATE TRIGGER update_stock_in_details_updated_at 
    BEFORE UPDATE ON stock_in_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for stock_in_details
CREATE INDEX IF NOT EXISTS idx_stock_in_details_stock_in ON stock_in_details(stock_in_id);
CREATE INDEX IF NOT EXISTS idx_stock_in_details_product ON stock_in_details(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_in_details_expiry ON stock_in_details(expiry_date);

-- Create stock_outs table
CREATE TABLE IF NOT EXISTS stock_outs (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    destination VARCHAR(200) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for stock_outs updated_at
CREATE TRIGGER update_stock_outs_updated_at 
    BEFORE UPDATE ON stock_outs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for stock_outs
CREATE INDEX IF NOT EXISTS idx_stock_outs_date ON stock_outs(date);
CREATE INDEX IF NOT EXISTS idx_stock_outs_user ON stock_outs(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_outs_destination ON stock_outs(destination);

-- Create stock_out_details table
CREATE TABLE IF NOT EXISTS stock_out_details (
    id SERIAL PRIMARY KEY,
    stock_out_id INTEGER NOT NULL REFERENCES stock_outs(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger for stock_out_details updated_at
CREATE TRIGGER update_stock_out_details_updated_at 
    BEFORE UPDATE ON stock_out_details 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for stock_out_details
CREATE INDEX IF NOT EXISTS idx_stock_out_details_stock_out ON stock_out_details(stock_out_id);
CREATE INDEX IF NOT EXISTS idx_stock_out_details_product ON stock_out_details(product_id);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);


-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert sample employee data
INSERT INTO employees (name, position, nip, phone, address, is_active) VALUES
('Dr. Ahmad Hidayat', 'General Practitioner', '196501011990011001', '081234567890', 'Jl. Raya Puskesmas No. 1, Jakarta', true),
('Siti Nurhaliza', 'Midwife', '197502021995022002', '081234567891', 'Jl. Merdeka No. 10, Jakarta', true),
('Budi Santoso', 'Nurse', '198503031998033003', '081234567892', 'Jl. Sudirman No. 20, Jakarta', true),
('Dewi Sartika', 'Admin', '199504041999044004', '081234567893', 'Jl. Thamrin No. 30, Jakarta', true),
('Muhammad Rizki', 'Pharmacist', '199605052000055005', '081234567894', 'Jl. Gatot Subroto No. 40, Jakarta', true)
ON CONFLICT (nip) DO NOTHING;

-- Update admin user with employee reference
UPDATE users SET employee_id = (SELECT id FROM employees WHERE nip = '196501011990011001' LIMIT 1) 
WHERE username = 'admin' AND employee_id IS NULL;

-- Insert additional sample users
INSERT INTO users (username, email, password, role, employee_id, is_active) VALUES
('dokter.ahmad', 'ahmad.hidayat@puskesmas.go.id', '$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW', 'user', (SELECT id FROM employees WHERE nip = '196501011990011001' LIMIT 1), true),
('bidan.siti', 'siti.nurhaliza@puskesmas.go.id', '$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW', 'user', (SELECT id FROM employees WHERE nip = '197502021995022002' LIMIT 1), true),
('perawat.budi', 'budi.santoso@puskesmas.go.id', '$2a$12$Re6IXyyQ2Do3Lhj/OwqcU.NP4FkW4EHBxZDsci3CXHTMajq2KOjYW', 'manager', (SELECT id FROM employees WHERE nip = '198503031998033003' LIMIT 1), true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
('Analgesics', 'Pain relieving medications'),
('Antibiotics', 'Medications to treat bacterial infections'),
('Vitamins', 'Dietary supplements and vitamins'),
('Consumables', 'Single-use medical devices and materials'),
('Emergency', 'Critical emergency medical supplies')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products data
INSERT INTO products (name, unit, type, category_id, min_stock, location) VALUES
('Paracetamol 500mg', 'tablet', 'Medicine', (SELECT id FROM categories WHERE name = 'Analgesics' LIMIT 1), 500, 'Warehouse A - Rack 1'),
('Amoxicillin 500mg', 'tablet', 'Medicine', (SELECT id FROM categories WHERE name = 'Antibiotics' LIMIT 1), 300, 'Warehouse A - Rack 2'),
('Antasida DOEN', 'tablet', 'Medicine', (SELECT id FROM categories WHERE name = 'Analgesics' LIMIT 1), 200, 'Warehouse A - Rack 3'),
('Albumin 20%', 'bottle', 'Medicine', (SELECT id FROM categories WHERE name = 'Emergency' LIMIT 1), 50, 'Warehouse B - Fridge'),
('Infus NaCl 0.9%', 'bottle', 'Medicine', (SELECT id FROM categories WHERE name = 'Emergency' LIMIT 1), 200, 'Warehouse B - Rack 4'),
('Surgical Mask', 'pcs', 'Medical Device', (SELECT id FROM categories WHERE name = 'Consumables' LIMIT 1), 1000, 'Warehouse C - Rack 5'),
('Latex Gloves', 'pcs', 'Medical Device', (SELECT id FROM categories WHERE name = 'Consumables' LIMIT 1), 500, 'Warehouse C - Rack 6'),
('Syringe 3ml', 'pcs', 'Medical Device', (SELECT id FROM categories WHERE name = 'Consumables' LIMIT 1), 300, 'Warehouse C - Rack 7'),
('Syringe 5ml', 'pcs', 'Medical Device', (SELECT id FROM categories WHERE name = 'Consumables' LIMIT 1), 300, 'Warehouse C - Rack 7'),
('Alcohol 70%', 'bottle', 'Medical Material', (SELECT id FROM categories WHERE name = 'Consumables' LIMIT 1), 100, 'Warehouse D - Rack 8'),
('Betadine', 'bottle', 'Medical Material', (SELECT id FROM categories WHERE name = 'Consumables' LIMIT 1), 150, 'Warehouse D - Rack 9'),
('Sterile Cotton', 'pcs', 'Medical Material', (SELECT id FROM categories WHERE name = 'Consumables' LIMIT 1), 500, 'Warehouse D - Rack 10'),
('Sterile Gauze', 'pcs', 'Medical Material', (SELECT id FROM categories WHERE name = 'Consumables' LIMIT 1), 300, 'Warehouse D - Rack 10')
ON CONFLICT DO NOTHING;

-- Insert sample suppliers data
INSERT INTO suppliers (name, address, contact) VALUES
('PT. Farmasi Sejahtera', 'Jl. Industri No. 100, Jakarta Barat', '021-12345678'),
('CV. Medika Utama', 'Jl. Perdagangan No. 200, Jakarta Utara', '021-87654321'),
('PT. Kesehatan Indonesia', 'Jl. Bisnis No. 300, Jakarta Selatan', '021-11223344'),
('UD. Alat Kesehatan', 'Jl. Pasar No. 400, Jakarta Timur', '021-99887766'),
('PT. Bahan Medis', 'Jl. Distribusi No. 500, Bekasi', '021-55443322')
ON CONFLICT DO NOTHING;

-- Insert sample stock_ins
INSERT INTO stock_ins (date, supplier_id, user_id, description) VALUES
(CURRENT_DATE - INTERVAL '30 days', (SELECT id FROM suppliers WHERE name = 'PT. Farmasi Sejahtera' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Regular monthly purchase'),
(CURRENT_DATE - INTERVAL '15 days', (SELECT id FROM suppliers WHERE name = 'CV. Medika Utama' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Stock replenishment'),
(CURRENT_DATE - INTERVAL '5 days', (SELECT id FROM suppliers WHERE name = 'PT. Kesehatan Indonesia' LIMIT 1), (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Emergency purchase')
ON CONFLICT DO NOTHING;

-- Insert sample stock_in_details
INSERT INTO stock_in_details (stock_in_id, product_id, quantity, unit_price, expiry_date)
SELECT 
  si.id,
  p.id,
  CASE 
    WHEN p.name = 'Paracetamol 500mg' THEN 1000
    WHEN p.name = 'Amoxicillin 500mg' THEN 500
    WHEN p.name = 'Surgical Mask' THEN 2000
    WHEN p.name = 'Latex Gloves' THEN 1000
    WHEN p.name = 'Albumin 20%' THEN 20
    WHEN p.name = 'Infus NaCl 0.9%' THEN 300
    WHEN p.name = 'Alcohol 70%' THEN 50
  END as quantity,
  CASE 
    WHEN p.name = 'Paracetamol 500mg' THEN 500
    WHEN p.name = 'Amoxicillin 500mg' THEN 750
    WHEN p.name = 'Surgical Mask' THEN 2000
    WHEN p.name = 'Latex Gloves' THEN 1500
    WHEN p.name = 'Albumin 20%' THEN 250000
    WHEN p.name = 'Infus NaCl 0.9%' THEN 15000
    WHEN p.name = 'Alcohol 70%' THEN 25000
  END as unit_price,
  CASE 
    WHEN p.name = 'Paracetamol 500mg' AND si.date = (SELECT MIN(date) FROM stock_ins) THEN CURRENT_DATE + INTERVAL '2 years'
    WHEN p.name = 'Amoxicillin 500mg' THEN CURRENT_DATE + INTERVAL '1 year'
    WHEN p.name = 'Albumin 20%' THEN CURRENT_DATE + INTERVAL '6 months'
    WHEN p.name = 'Infus NaCl 0.9%' THEN CURRENT_DATE + INTERVAL '1 year'
    WHEN p.name = 'Alcohol 70%' THEN CURRENT_DATE + INTERVAL '3 years'
    ELSE NULL
  END as expiry_date
FROM stock_ins si
CROSS JOIN products p
WHERE 
  (si.date = (SELECT MIN(date) FROM stock_ins) AND p.name IN ('Paracetamol 500mg', 'Amoxicillin 500mg'))
  OR (si.date = (SELECT date FROM stock_ins ORDER BY date OFFSET 1 LIMIT 1) AND p.name IN ('Surgical Mask', 'Latex Gloves'))
  OR (si.date = (SELECT MAX(date) FROM stock_ins) AND p.name IN ('Albumin 20%', 'Infus NaCl 0.9%', 'Alcohol 70%'))
ON CONFLICT DO NOTHING;

-- Insert sample stock_outs
INSERT INTO stock_outs (date, destination, user_id, description) VALUES
(CURRENT_DATE - INTERVAL '20 days', 'General Clinic', (SELECT id FROM users WHERE username = 'perawat.budi' LIMIT 1), 'Regular distribution to clinic'),
(CURRENT_DATE - INTERVAL '10 days', 'MCH Clinic', (SELECT id FROM users WHERE username = 'bidan.siti' LIMIT 1), 'Distribution to MCH clinic'),
(CURRENT_DATE - INTERVAL '3 days', 'Emergency Room', (SELECT id FROM users WHERE username = 'admin' LIMIT 1), 'Emergency distribution to ER')
ON CONFLICT DO NOTHING;

-- Insert sample stock_out_details
INSERT INTO stock_out_details (stock_out_id, product_id, quantity)
SELECT 
  so.id,
  p.id,
  CASE 
    WHEN p.name = 'Paracetamol 500mg' THEN 200
    WHEN p.name = 'Amoxicillin 500mg' THEN 100
    WHEN p.name = 'Antasida DOEN' THEN 50
    WHEN p.name = 'Syringe 3ml' THEN 100
    WHEN p.name = 'Infus NaCl 0.9%' THEN 50
    WHEN p.name = 'Surgical Mask' THEN 200
    WHEN p.name = 'Latex Gloves' THEN 150
  END as quantity
FROM stock_outs so
CROSS JOIN products p
WHERE 
  (so.date = (SELECT MIN(date) FROM stock_outs) AND p.name IN ('Paracetamol 500mg', 'Amoxicillin 500mg'))
  OR (so.date = (SELECT date FROM stock_outs ORDER BY date OFFSET 1 LIMIT 1) AND p.name IN ('Antasida DOEN', 'Syringe 3ml'))
  OR (so.date = (SELECT MAX(date) FROM stock_outs) AND p.name IN ('Infus NaCl 0.9%', 'Surgical Mask', 'Latex Gloves'))
ON CONFLICT DO NOTHING;

-- Insert sample activity logs
INSERT INTO activity_logs (user_id, timestamp, action, description, ip_address) VALUES
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '1 hour', 'LOGIN', 'Admin user successfully logged in', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '2 hours', 'INSERT', 'New product added: Paracetamol 500mg', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '3 hours', 'INSERT', 'New supplier added: PT. Farmasi Sejahtera', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'perawat.budi' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '4 hours', 'LOGIN', 'User perawat.budi successfully logged in', '192.168.1.100'),
((SELECT id FROM users WHERE username = 'perawat.budi' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '5 hours', 'INSERT', 'Stock out created for General Clinic', '192.168.1.100'),
((SELECT id FROM users WHERE username = 'bidan.siti' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '6 hours', 'LOGIN', 'User bidan.siti successfully logged in', '192.168.1.101'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '7 hours', 'UPDATE', 'Employee data updated: Dr. Ahmad Hidayat', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '8 hours', 'INSERT', 'New stock in created', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '1 day', 'PRINT', 'Stock report printed', '127.0.0.1'),
((SELECT id FROM users WHERE username = 'admin' LIMIT 1), CURRENT_TIMESTAMP - INTERVAL '2 days', 'INSERT', 'New employee added: Muhammad Rizki', '127.0.0.1')
ON CONFLICT DO NOTHING;
