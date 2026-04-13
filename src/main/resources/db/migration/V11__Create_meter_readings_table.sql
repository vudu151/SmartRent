-- Create meter readings table
CREATE TABLE meter_readings (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- ELECTRICITY, WATER
    reading_month INT NOT NULL,
    reading_year INT NOT NULL,
    old_index DECIMAL(15, 2) NOT NULL DEFAULT 0,
    new_index DECIMAL(15, 2) NOT NULL DEFAULT 0,
    reading_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(room_id, type, reading_month, reading_year)
);

CREATE INDEX idx_meter_readings_tenant_id ON meter_readings(tenant_id);
CREATE INDEX idx_meter_readings_room_id ON meter_readings(room_id);
CREATE INDEX idx_meter_readings_type ON meter_readings(type);
CREATE INDEX idx_meter_readings_period ON meter_readings(reading_month, reading_year);
