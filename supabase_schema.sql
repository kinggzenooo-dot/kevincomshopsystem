-- =========================================================================
-- VENS COMSHOP CYBER GAMING SYSTEM — COMPLETE SUPABASE DATABASE SCHEMA
-- Instructions: Copy and paste this script directly into Supabase SQL Editor
-- (https://supabase.com/dashboard/project/uiingbpzfgxmxlwtwfzy/sql)
-- and click "RUN".
-- =========================================================================

-- 1. STATIONS TABLE (PC Station Rigs, Status, Live Sessions, Specs)
CREATE TABLE IF NOT EXISTS public.stations (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    number INTEGER NOT NULL,
    zone TEXT NOT NULL,
    rate_per_hour NUMERIC NOT NULL DEFAULT 25,
    status TEXT NOT NULL DEFAULT 'idle', -- 'idle', 'active', 'reserved', 'maintenance'
    specs JSONB DEFAULT '{}'::jsonb,
    active_session JSONB DEFAULT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE (Food, Drinks, Gaming Gear Inventory)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'food', 'drinks', 'accessories'
    price NUMERIC NOT NULL DEFAULT 0,
    cost NUMERIC NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    image TEXT DEFAULT '🎮',
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PACKAGES TABLE (Gaming Passes, Hourly Rates, Promos)
CREATE TABLE IF NOT EXISTS public.packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    badge TEXT,
    price NUMERIC NOT NULL,
    savings TEXT,
    hours NUMERIC NOT NULL,
    zone TEXT NOT NULL,
    features JSONB DEFAULT '[]'::jsonb,
    recommended BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RESERVATIONS TABLE (Online PC Bookings)
CREATE TABLE IF NOT EXISTS public.reservations (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    pc_code TEXT NOT NULL,
    zone TEXT NOT NULL,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    duration_hours NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
    payment_status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS TABLE (In-Seat Food & Drinks Ordering)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_no TEXT NOT NULL UNIQUE,
    station_code TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'preparing', 'delivering', 'delivered', 'cancelled'
    payment_method TEXT DEFAULT 'Cash',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTIONS TABLE (POS Financial Ledger)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    tx_no TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL, -- 'PC Session', 'Food & Drinks', 'Account Top-Up', 'Hardware Accessory'
    details TEXT,
    amount NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'Cash',
    cashier TEXT DEFAULT 'System',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CUSTOMERS TABLE (Registered Gamers, Balances, VIP Ranks)
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    password TEXT,
    rank TEXT DEFAULT 'Standard', -- 'Standard', 'Silver', 'Gold', 'Cyber VIP'
    balance NUMERIC DEFAULT 0,
    points INTEGER DEFAULT 0,
    total_hours NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. STAFF TABLE (Administrators, Cashiers, Floor Technicians)
CREATE TABLE IF NOT EXISTS public.staff (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'Administrator', 'Head Cashier', 'Floor Technician'
    shift TEXT,
    pin TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SHOP INFO TABLE (Global Settings & Metadata)
CREATE TABLE IF NOT EXISTS public.shop_info (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS and grant read/write access to anon and authenticated roles
-- =========================================================================
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_info ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access stations" ON public.stations;
CREATE POLICY "Public access stations" ON public.stations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access products" ON public.products;
CREATE POLICY "Public access products" ON public.products FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access packages" ON public.packages;
CREATE POLICY "Public access packages" ON public.packages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access reservations" ON public.reservations;
CREATE POLICY "Public access reservations" ON public.reservations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access orders" ON public.orders;
CREATE POLICY "Public access orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access transactions" ON public.transactions;
CREATE POLICY "Public access transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access customers" ON public.customers;
CREATE POLICY "Public access customers" ON public.customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access staff" ON public.staff;
CREATE POLICY "Public access staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access shop_info" ON public.shop_info;
CREATE POLICY "Public access shop_info" ON public.shop_info FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- INITIAL SEED DATA
-- =========================================================================

-- Staff Accounts (Admin, Cashier, Floor Tech)
INSERT INTO public.staff (id, username, name, role, shift, pin)
VALUES
    ('stf-1', 'admin', 'Kevin Vens (Owner)', 'Administrator', 'Morning / Full', '1234'),
    ('stf-2', 'cashier1', 'Cyber Cashier (Rhea)', 'Head Cashier', 'Day Shift (8AM-4PM)', '5555'),
    ('stf-3', 'tech1', 'Sam Vance', 'Floor Technician', 'Night Shift (4PM-12AM)', '9999')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, pin = EXCLUDED.pin;

-- Customers (Gamers)
INSERT INTO public.customers (id, user_id, name, email, phone, password, rank, balance, points, total_hours)
VALUES
    ('cust-1', 'USR-9001', 'Alex Mercer', 'alex.mercer@cybernet.io', '+63 917 555 1010', 'gamer123', 'Cyber VIP', 450, 1250, 142),
    ('cust-2', 'USR-9003', 'CyberGhost_99', 'ghost99@esports.ph', '+63 918 666 2020', 'gamer123', 'Gold', 280, 840, 98),
    ('cust-3', 'USR-9005', 'Viper_Zero', 'viper.zero@val.gg', '+63 919 777 3030', 'gamer123', 'Silver', 120, 390, 45),
    ('cust-4', 'USR-9008', 'Kaelen Voss', 'kaelen.voss@tech.org', '+63 920 888 4040', 'gamer123', 'Cyber VIP', 610, 2100, 210)
ON CONFLICT (id) DO UPDATE SET balance = EXCLUDED.balance, points = EXCLUDED.points;

-- Packages
INSERT INTO public.packages (id, name, badge, price, savings, hours, zone, features, recommended)
VALUES
    ('pkg-1', 'Hourly Flex Pass', 'Standard', 25, 'Standard Rate', 1, 'Standard Zone', '["RTX 4060 Ti / Core i5 14400F", "240Hz Gaming Display", "Mechanical Keyboard & Gaming Mouse", "Standard High-Speed Fiber Access"]'::jsonb, false),
    ('pkg-2', '3-Hour Cyber Blast', 'Popular', 65, 'Save ₱10', 3, 'Standard / VIP', '["3 Hours Continuous High-FPS Gaming", "Choice of Standard or VIP Rig", "Free Refillable Cyber Iced Tea", "Priority Matchmaking Line"]'::jsonb, true),
    ('pkg-3', '5-Hour Grinder Pack', 'Best Value', 110, 'Save ₱25 + Free Drink', 5, 'VIP Cyber Lounge', '["5 Hours VIP Station Access", "Free Monster Energy Drink or Iced Coffee", "RTX 4080 Super / 360Hz OLED", "Secretlab Ergonomic Chair"]'::jsonb, false),
    ('pkg-4', 'Night Owl Overnight', '10 PM - 6 AM', 180, '8 Hours Unlimited', 8, 'All Zones Available', '["8 Hours Overnight Gaming Pass", "Free Hot Cyber Ramen & Drink", "Uninterrupted Gigabit Fiber Connection", "Dimmed Ambient Cyber Lighting Mode"]'::jsonb, false),
    ('pkg-5', 'VIP Streaming Booth', 'Creator Pro', 240, '4 Hours Studio Pass', 4, 'Streaming Booth', '["Private Acoustic Soundproof Booth", "RTX 4090 24GB + Dual 4K Monitors", "Shure SM7B Mic + Elgato Stream Deck", "OBS Pro Setup pre-configured"]'::jsonb, false),
    ('pkg-6', 'Student Power Pass', 'Student Promo', 35, '2 Hours for ₱35', 2, 'Standard Zone', '["Valid Student ID Required", "2 Hours High-Performance PC Time", "Free Printing up to 5 pages", "Mon - Fri (10 AM - 5 PM)"]'::jsonb, false)
ON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price;

-- Products (Food, Drinks, Accessories)
INSERT INTO public.products (id, name, category, price, cost, stock, image, description)
VALUES
    ('prod-1', 'Spicy Cyber Ramen Bowl', 'food', 85, 40, 45, '🍲', 'Rich tonkotsu broth with spicy chili oil, soft-boiled egg, and chashu pork.'),
    ('prod-2', 'Artisan Cyber Cheeseburger', 'food', 120, 55, 30, '🍔', 'Double smashed beef patties, cheddar cheese, special sauce on brioche bun.'),
    ('prod-3', 'Loaded Cheesy Bacon Fries', 'food', 75, 30, 50, '🍟', 'Crispy skin-on fries smothered in hot cheese sauce and real bacon bits.'),
    ('prod-4', 'Steamed Pork Dimsum (6pcs)', 'food', 65, 25, 40, '🥟', 'Steamed pork & shrimp siomai served with chili garlic dip and calamansi.'),
    ('prod-5', 'Crispy Chicken Tenders & Dip', 'food', 95, 45, 25, '🍗', 'Golden fried chicken breast strips served with honey mustard sauce.'),
    ('prod-6', 'Monster Energy Drink 500ml', 'drinks', 95, 60, 60, '⚡', 'Original high-octane energy booster to keep your reaction time lightning fast.'),
    ('prod-7', 'Red Bull Cyber Edition 250ml', 'drinks', 85, 50, 48, '🐂', 'Vitalizes body and mind during intense gaming sessions.'),
    ('prod-8', 'Iced Caramel Macchiato', 'drinks', 70, 30, 40, '☕', 'Freshly brewed espresso shots, cold milk, and rich caramel drizzle.'),
    ('prod-9', 'Mountain Dew Cyber Blast 1.5L', 'drinks', 60, 35, 35, '🥤', 'Cold citrus soda to share with your squad during LAN matches.'),
    ('prod-10', 'Mineral Water 1000ml', 'drinks', 25, 10, 120, '💧', 'Purified chilled drinking water for crisp hydration.'),
    ('prod-11', 'RGB XXL Gaming Desk Mat', 'accessories', 450, 250, 12, '🟫', '900x400mm waterproof micro-weave surface with 14-mode RGB lighting.'),
    ('prod-12', 'Custom Mechanical Switches (10-pack)', 'accessories', 220, 120, 20, '⌨️', 'Pre-lubed linear switches for custom mechanical keyboards.'),
    ('prod-13', 'Type-C Braided Fast Cable 2M', 'accessories', 180, 80, 18, '🔌', 'Heavy-duty nylon braided fast-charging cable with LED indicator.'),
    ('prod-14', 'Cyber In-Ear Gaming Earphones', 'accessories', 590, 300, 8, '🎧', 'Dual dynamic driver gaming earbuds with detachable boom mic.'),
    ('prod-15', 'High-Speed USB 3.2 Flash Drive 64GB', 'accessories', 320, 180, 15, '💾', 'Super-fast 200MB/s read speed for transferring game highlights.')
ON CONFLICT (id) DO UPDATE SET stock = EXCLUDED.stock, price = EXCLUDED.price;

-- Stations 1 through 30
INSERT INTO public.stations (id, code, number, zone, rate_per_hour, status, specs, active_session)
VALUES
    ('st-1', 'PC-01', 1, 'VIP Cyber Lounge', 45, 'active', '{"gpu": "RTX 4080 Super 16GB", "cpu": "Core i7 14700K", "ram": "32GB DDR5 6000MHz", "monitor": "27\" 360Hz QD-OLED"}'::jsonb, '{"customerName": "Alex Mercer", "userId": "USR-9001", "durationMinutes": 180, "remainingSeconds": 6900, "totalPaid": 135, "packageName": "3-Hour Cyber Blast"}'::jsonb),
    ('st-2', 'PC-02', 2, 'VIP Cyber Lounge', 45, 'idle', '{"gpu": "RTX 4080 Super 16GB", "cpu": "Core i7 14700K", "ram": "32GB DDR5 6000MHz", "monitor": "27\" 360Hz QD-OLED"}'::jsonb, NULL),
    ('st-3', 'PC-03', 3, 'VIP Cyber Lounge', 45, 'active', '{"gpu": "RTX 4080 Super 16GB", "cpu": "Core i7 14700K", "ram": "32GB DDR5 6000MHz", "monitor": "27\" 360Hz QD-OLED"}'::jsonb, '{"customerName": "CyberGhost_99", "userId": "USR-9003", "durationMinutes": 120, "remainingSeconds": 2520, "totalPaid": 90, "packageName": "Flex Hourly"}'::jsonb),
    ('st-4', 'PC-04', 4, 'VIP Cyber Lounge', 45, 'reserved', '{"gpu": "RTX 4080 Super 16GB", "cpu": "Core i7 14700K", "ram": "32GB DDR5 6000MHz", "monitor": "27\" 360Hz QD-OLED"}'::jsonb, NULL),
    ('st-5', 'PC-05', 5, 'VIP Cyber Lounge', 45, 'active', '{"gpu": "RTX 4080 Super 16GB", "cpu": "Core i7 14700K", "ram": "32GB DDR5 6000MHz", "monitor": "27\" 360Hz QD-OLED"}'::jsonb, '{"customerName": "Viper_Zero", "userId": "USR-9005", "durationMinutes": 60, "remainingSeconds": 1080, "totalPaid": 45, "packageName": "Flex Hourly"}'::jsonb),
    ('st-6', 'PC-06', 6, 'VIP Cyber Lounge', 45, 'idle', '{"gpu": "RTX 4080 Super 16GB", "cpu": "Core i7 14700K", "ram": "32GB DDR5 6000MHz", "monitor": "27\" 360Hz QD-OLED"}'::jsonb, NULL),
    ('st-7', 'PC-07', 7, 'VIP Cyber Lounge', 45, 'idle', '{"gpu": "RTX 4080 Super 16GB", "cpu": "Core i7 14700K", "ram": "32GB DDR5 6000MHz", "monitor": "27\" 360Hz QD-OLED"}'::jsonb, NULL),
    ('st-8', 'PC-08', 8, 'VIP Cyber Lounge', 45, 'active', '{"gpu": "RTX 4080 Super 16GB", "cpu": "Core i7 14700K", "ram": "32GB DDR5 6000MHz", "monitor": "27\" 360Hz QD-OLED"}'::jsonb, '{"customerName": "Kaelen Voss", "userId": "USR-9008", "durationMinutes": 300, "remainingSeconds": 11400, "totalPaid": 225, "packageName": "5-Hour Grinder"}'::jsonb),
    ('st-9', 'PC-09', 9, 'Tournament Arena', 40, 'idle', '{"gpu": "RTX 4070 Ti Super", "cpu": "Ryzen 7 7800X3D", "ram": "32GB DDR5 6400MHz", "monitor": "25\" 360Hz Esports Display"}'::jsonb, NULL),
    ('st-10', 'PC-10', 10, 'Tournament Arena', 40, 'idle', '{"gpu": "RTX 4070 Ti Super", "cpu": "Ryzen 7 7800X3D", "ram": "32GB DDR5 6400MHz", "monitor": "25\" 360Hz Esports Display"}'::jsonb, NULL),
    ('st-11', 'PC-11', 11, 'Tournament Arena', 40, 'idle', '{"gpu": "RTX 4070 Ti Super", "cpu": "Ryzen 7 7800X3D", "ram": "32GB DDR5 6400MHz", "monitor": "25\" 360Hz Esports Display"}'::jsonb, NULL),
    ('st-12', 'PC-12', 12, 'Tournament Arena', 40, 'active', '{"gpu": "RTX 4070 Ti Super", "cpu": "Ryzen 7 7800X3D", "ram": "32GB DDR5 6400MHz", "monitor": "25\" 360Hz Esports Display"}'::jsonb, '{"customerName": "SovereignX", "userId": "USR-9012", "durationMinutes": 240, "remainingSeconds": 5100, "totalPaid": 160, "packageName": "3-Hour Cyber Blast"}'::jsonb),
    ('st-13', 'PC-13', 13, 'Tournament Arena', 40, 'idle', '{"gpu": "RTX 4070 Ti Super", "cpu": "Ryzen 7 7800X3D", "ram": "32GB DDR5 6400MHz", "monitor": "25\" 360Hz Esports Display"}'::jsonb, NULL),
    ('st-14', 'PC-14', 14, 'Tournament Arena', 40, 'active', '{"gpu": "RTX 4070 Ti Super", "cpu": "Ryzen 7 7800X3D", "ram": "32GB DDR5 6400MHz", "monitor": "25\" 360Hz Esports Display"}'::jsonb, '{"customerName": "Luna_Byte", "userId": "USR-9014", "durationMinutes": 90, "remainingSeconds": 1800, "totalPaid": 60, "packageName": "Flex Hourly"}'::jsonb),
    ('st-15', 'PC-15', 15, 'Tournament Arena', 40, 'reserved', '{"gpu": "RTX 4070 Ti Super", "cpu": "Ryzen 7 7800X3D", "ram": "32GB DDR5 6400MHz", "monitor": "25\" 360Hz Esports Display"}'::jsonb, NULL),
    ('st-16', 'PC-16', 16, 'Tournament Arena', 40, 'idle', '{"gpu": "RTX 4070 Ti Super", "cpu": "Ryzen 7 7800X3D", "ram": "32GB DDR5 6400MHz", "monitor": "25\" 360Hz Esports Display"}'::jsonb, NULL),
    ('st-17', 'PC-17', 17, 'Streaming Booth', 60, 'idle', '{"gpu": "RTX 4090 24GB", "cpu": "Core i9 14900K", "ram": "64GB DDR5 RGB", "monitor": "Dual 27\" 4K 240Hz OLED"}'::jsonb, NULL),
    ('st-18', 'PC-18', 18, 'Streaming Booth', 60, 'active', '{"gpu": "RTX 4090 24GB", "cpu": "Core i9 14900K", "ram": "64GB DDR5 RGB", "monitor": "Dual 27\" 4K 240Hz OLED"}'::jsonb, '{"customerName": "RivenMain", "userId": "USR-9018", "durationMinutes": 180, "remainingSeconds": 8400, "totalPaid": 180, "packageName": "VIP Streaming Pass"}'::jsonb),
    ('st-19', 'PC-19', 19, 'Streaming Booth', 60, 'idle', '{"gpu": "RTX 4090 24GB", "cpu": "Core i9 14900K", "ram": "64GB DDR5 RGB", "monitor": "Dual 27\" 4K 240Hz OLED"}'::jsonb, NULL),
    ('st-20', 'PC-20', 20, 'Streaming Booth', 60, 'reserved', '{"gpu": "RTX 4090 24GB", "cpu": "Core i9 14900K", "ram": "64GB DDR5 RGB", "monitor": "Dual 27\" 4K 240Hz OLED"}'::jsonb, NULL),
    ('st-21', 'PC-21', 21, 'Standard Zone', 25, 'idle', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, NULL),
    ('st-22', 'PC-22', 22, 'Standard Zone', 25, 'active', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, '{"customerName": "ShadowStrike", "userId": "USR-9022", "durationMinutes": 150, "remainingSeconds": 5700, "totalPaid": 65, "packageName": "Flex Hourly"}'::jsonb),
    ('st-23', 'PC-23', 23, 'Standard Zone', 25, 'idle', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, NULL),
    ('st-24', 'PC-24', 24, 'Standard Zone', 25, 'idle', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, NULL),
    ('st-25', 'PC-25', 25, 'Standard Zone', 25, 'active', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, '{"customerName": "NeonPhoenix", "userId": "USR-9025", "durationMinutes": 45, "remainingSeconds": 720, "totalPaid": 25, "packageName": "Flex Hourly"}'::jsonb),
    ('st-26', 'PC-26', 26, 'Standard Zone', 25, 'idle', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, NULL),
    ('st-27', 'PC-27', 27, 'Standard Zone', 25, 'idle', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, NULL),
    ('st-28', 'PC-28', 28, 'Standard Zone', 25, 'active', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, '{"customerName": "GamerX_PH", "userId": "USR-9028", "durationMinutes": 210, "remainingSeconds": 9600, "totalPaid": 90, "packageName": "3-Hour Cyber Blast"}'::jsonb),
    ('st-29', 'PC-29', 29, 'Standard Zone', 25, 'idle', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, NULL),
    ('st-30', 'PC-30', 30, 'Standard Zone', 25, 'maintenance', '{"gpu": "RTX 4060 Ti 16GB", "cpu": "Core i5 14400F", "ram": "32GB DDR5", "monitor": "24\" 240Hz IPS"}'::jsonb, NULL)
ON CONFLICT (id) DO NOTHING;

-- Initial Orders
INSERT INTO public.orders (id, order_no, station_code, customer_name, items, total, status, payment_method)
VALUES
    ('ord-1001', 'ORD-9021', 'PC-08', 'Kaelen Voss', '[{"productId": "prod-1", "name": "Spicy Cyber Ramen Bowl", "price": 85, "qty": 1}, {"productId": "prod-6", "name": "Monster Energy Drink 500ml", "price": 95, "qty": 1}]'::jsonb, 180, 'delivering', 'GCash'),
    ('ord-1002', 'ORD-9022', 'PC-01', 'Alex Mercer', '[{"productId": "prod-2", "name": "Artisan Cyber Cheeseburger", "price": 120, "qty": 1}, {"productId": "prod-3", "name": "Loaded Cheesy Bacon Fries", "price": 75, "qty": 1}]'::jsonb, 195, 'preparing', 'Cash'),
    ('ord-1003', 'ORD-9023', 'PC-25', 'NeonPhoenix', '[{"productId": "prod-8", "name": "Iced Caramel Macchiato", "price": 70, "qty": 2}]'::jsonb, 140, 'delivered', 'Maya')
ON CONFLICT (id) DO NOTHING;

-- Initial Reservations
INSERT INTO public.reservations (id, code, customer_name, customer_phone, pc_code, zone, date, start_time, duration_hours, total_amount, status, payment_status)
VALUES
    ('res-101', 'RES-8810', 'Marcus Vance', '+63 917 111 2233', 'PC-04', 'VIP Cyber Lounge', CURRENT_DATE::text, '18:00', 3, 135, 'confirmed', 'paid'),
    ('res-102', 'RES-8812', 'Elena Rostova', '+63 918 222 3344', 'PC-15', 'Tournament Arena', CURRENT_DATE::text, '20:00', 4, 160, 'confirmed', 'paid'),
    ('res-103', 'RES-8815', 'David Kim', '+63 919 333 4455', 'PC-20', 'Streaming Booth', CURRENT_DATE::text, '21:00', 4, 240, 'pending', 'unpaid')
ON CONFLICT (id) DO NOTHING;

-- Initial Transactions
INSERT INTO public.transactions (id, tx_no, type, details, amount, payment_method, cashier)
VALUES
    ('tx-501', 'TX-3091', 'PC Session', 'PC-08 (VIP) — 5 Hours Grinder Pack', 110, 'GCash', 'CyberCashier'),
    ('tx-502', 'TX-3092', 'Food & Drinks', 'Order #ORD-9023 (PC-25)', 140, 'Maya', 'CyberCashier'),
    ('tx-503', 'TX-3093', 'PC Session', 'PC-01 (VIP) — 3-Hour Cyber Blast', 65, 'Cash', 'CyberCashier'),
    ('tx-504', 'TX-3094', 'Account Top-Up', 'Customer Top-Up (User: CyberGhost_99)', 300, 'Cash', 'CyberCashier'),
    ('tx-505', 'TX-3095', 'Hardware Accessory', 'Type-C Braided Fast Cable 2M x1', 180, 'Cash', 'CyberCashier')
ON CONFLICT (id) DO NOTHING;

-- Initial Shop Info
INSERT INTO public.shop_info (id, data)
VALUES
    ('shop-1', '{"name": "Vens ComShop", "tagline": "Ultra-Fast Cyber Gaming & Esports Lounge", "address": "777 Cyber Matrix Plaza, Tech Boulevard, Sector 7", "phone": "+63 917 888 8888", "hours": "24 Hours / 7 Days a Week", "activePcs": 30}'::jsonb)
ON CONFLICT (id) DO NOTHING;
