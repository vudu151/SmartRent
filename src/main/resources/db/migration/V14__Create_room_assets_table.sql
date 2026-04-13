CREATE TABLE IF NOT EXISTS room_assets (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    tenant_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER DEFAULT 1,
    condition VARCHAR(255),
    compensation_value DECIMAL(15, 2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_assets_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_assets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_room_assets_room_id ON room_assets(room_id);
CREATE INDEX IF NOT EXISTS idx_room_assets_tenant_id ON room_assets(tenant_id);
