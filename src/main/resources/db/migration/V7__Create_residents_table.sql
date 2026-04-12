-- Create residents table (tenant info / occupant management)
CREATE TABLE residents (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    id_card VARCHAR(50),
    date_of_birth DATE,
    gender VARCHAR(10),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_residents_tenant_id ON residents(tenant_id);
CREATE INDEX idx_residents_user_id ON residents(user_id);
CREATE INDEX idx_residents_status ON residents(status);

-- Junction table for many-to-many: residents <-> rooms
CREATE TABLE resident_rooms (
    resident_id BIGINT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    move_in_date DATE DEFAULT CURRENT_DATE,
    move_out_date DATE,
    is_primary BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (resident_id, room_id)
);

CREATE INDEX idx_resident_rooms_room_id ON resident_rooms(room_id);
