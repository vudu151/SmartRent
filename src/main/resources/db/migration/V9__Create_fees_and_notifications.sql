-- Create room fee units table (fee configuration per tenant)
CREATE TABLE room_fee_units (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    rent_per_sqm DECIMAL(15, 2) DEFAULT 0,
    service_per_sqm DECIMAL(15, 2) DEFAULT 0,
    parking_fee DECIMAL(15, 2) DEFAULT 0,
    water_per_unit DECIMAL(15, 2) DEFAULT 0,
    electricity_per_unit DECIMAL(15, 2) DEFAULT 0,
    internet_fee DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id)
);

-- Create notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    type VARCHAR(50) DEFAULT 'GENERAL',
    target_type VARCHAR(50) DEFAULT 'ALL',
    sender_id BIGINT REFERENCES users(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_tenant_id ON notifications(tenant_id);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Junction table for notification recipients
CREATE TABLE notification_recipients (
    notification_id BIGINT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    resident_id BIGINT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    PRIMARY KEY (notification_id, resident_id)
);
