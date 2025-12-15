-- เพิ่ม Tables ที่หายไปสำหรับระบบต่างๆ
-- Run this in Supabase SQL Editor

-- Drop existing tables if they exist (to ensure clean structure)
DROP TABLE IF EXISTS backup_history CASCADE;
DROP TABLE IF EXISTS backup_config CASCADE;
DROP TABLE IF EXISTS corporate_clients CASCADE;
DROP TABLE IF EXISTS blackout_dates CASCADE;
DROP TABLE IF EXISTS seasonal_pricing CASCADE;
DROP TABLE IF EXISTS maintenance_schedule CASCADE;
DROP TABLE IF EXISTS demand_pricing_levels CASCADE;

-- 1. Corporate Clients Table
CREATE TABLE corporate_clients (
    id VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    industry VARCHAR(100),
    primary_contact JSONB,
    alternative_contacts JSONB,
    billing_address JSONB,
    contract JSONB,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_room_nights INTEGER DEFAULT 0,
    preferences JSONB,
    status VARCHAR(20) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Backup History Table
CREATE TABLE backup_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    backup_name VARCHAR(255) NOT NULL,
    backup_month VARCHAR(10),
    backup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    files_backed_up JSONB,
    size_bytes BIGINT,
    status VARCHAR(20) DEFAULT 'completed',
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Backup Configuration Table  
CREATE TABLE backup_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN DEFAULT true,
    schedule VARCHAR(20) DEFAULT 'weekly',
    custom_days INTEGER DEFAULT 7,
    backup_time VARCHAR(10) DEFAULT '02:00',
    selected_files JSONB,
    auto_delete BOOLEAN DEFAULT true,
    last_backup TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT single_config CHECK (id = 1)
);

-- Insert default backup config
INSERT INTO backup_config (id, enabled, schedule, selected_files)
VALUES (1, true, 'weekly', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 4. Blackout Dates Table
CREATE TABLE blackout_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    room_ids JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Seasonal Pricing Table  
CREATE TABLE seasonal_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    multiplier DECIMAL(5,2) DEFAULT 1.0,
    room_ids JSONB,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Maintenance Schedule Table
CREATE TABLE maintenance_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id INTEGER REFERENCES rooms(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Demand Pricing Levels Table
CREATE TABLE demand_pricing_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    occupancy_threshold INTEGER NOT NULL,
    price_multiplier DECIMAL(5,2) NOT NULL,
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for all tables
ALTER TABLE corporate_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE backup_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackout_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasonal_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_pricing_levels ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables (allow authenticated users)
CREATE POLICY "Allow authenticated users full access" ON corporate_clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access" ON backup_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access" ON backup_config FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access" ON blackout_dates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access" ON seasonal_pricing FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access" ON maintenance_schedule FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users full access" ON demand_pricing_levels FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create policies for service role (admin)
CREATE POLICY "Allow service role full access" ON corporate_clients FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON backup_history FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON backup_config FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON blackout_dates FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON seasonal_pricing FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON maintenance_schedule FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON demand_pricing_levels FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_corporate_clients_status ON corporate_clients(status);
CREATE INDEX IF NOT EXISTS idx_backup_history_date ON backup_history(backup_date DESC);
CREATE INDEX IF NOT EXISTS idx_blackout_dates_range ON blackout_dates(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_seasonal_pricing_range ON seasonal_pricing(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_room ON maintenance_schedule(room_id);
CREATE INDEX IF NOT EXISTS idx_demand_pricing_active ON demand_pricing_levels(active);

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'corporate_clients', 
    'backup_history', 
    'backup_config', 
    'blackout_dates',
    'seasonal_pricing',
    'maintenance_schedule',
    'demand_pricing_levels'
)
ORDER BY table_name;
