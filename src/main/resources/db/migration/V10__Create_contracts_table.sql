-- Create contracts table
CREATE TABLE contracts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id BIGINT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    resident_id BIGINT NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    contract_number VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(15, 2) NOT NULL,
    deposit_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'ACTIVE' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, contract_number)
);

CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_room_id ON contracts(room_id);
CREATE INDEX idx_contracts_resident_id ON contracts(resident_id);
CREATE INDEX idx_contracts_status ON contracts(status);
