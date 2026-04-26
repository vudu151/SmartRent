-- Create buildings table
CREATE TABLE buildings (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    electricity_price NUMERIC(15,2) DEFAULT 0,
    water_price NUMERIC(15,2) DEFAULT 0,
    service_price NUMERIC(15,2) DEFAULT 0,
    internet_price NUMERIC(15,2) DEFAULT 0,
    parking_price NUMERIC(15,2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_buildings_tenant_id ON buildings(tenant_id);

-- Add building_id to rooms
ALTER TABLE rooms ADD COLUMN building_id BIGINT REFERENCES buildings(id);

-- Migrate data from room_fee_units to buildings
-- We create one default building ("Khu Mặc Định") for each tenant that has a room_fee_unit
INSERT INTO buildings (tenant_id, name, electricity_price, water_price, service_price, internet_price, parking_price)
SELECT tenant_id, 'Khu Trọ Cơ Sở 1', electricity_per_unit, water_per_unit, service_per_sqm, internet_fee, parking_fee
FROM room_fee_units;

-- Ensure every tenant has at least one building (even if they didn't have room_fee_units)
INSERT INTO buildings (tenant_id, name)
SELECT id, 'Khu Trọ Cơ Sở 1' FROM tenants t
WHERE NOT EXISTS (SELECT 1 FROM buildings b WHERE b.tenant_id = t.id);

-- Assign all existing rooms to their tenant's first building
UPDATE rooms r 
SET building_id = (
    SELECT b.id FROM buildings b 
    WHERE b.tenant_id = r.tenant_id 
    ORDER BY b.id ASC LIMIT 1
);

-- Drop old table
DROP TABLE room_fee_units;
