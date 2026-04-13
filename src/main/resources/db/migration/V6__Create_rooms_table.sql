-- Create rooms table (apartment/room management)
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    floor INTEGER,
    area DECIMAL(10, 2),
    status VARCHAR(30) NOT NULL DEFAULT 'VACANT',
    type VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    description TEXT,
    price DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, room_number)
);

CREATE INDEX idx_rooms_tenant_id ON rooms(tenant_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_floor ON rooms(floor);
CREATE INDEX idx_rooms_type ON rooms(type);
