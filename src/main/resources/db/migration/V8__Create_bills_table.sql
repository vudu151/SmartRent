-- Create bills table
CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
    room_number VARCHAR(50),
    bill_type VARCHAR(50) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    description TEXT,
    due_date DATE,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    payment_date TIMESTAMP,
    payment_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bills_tenant_id ON bills(tenant_id);
CREATE INDEX idx_bills_room_id ON bills(room_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_bill_type ON bills(bill_type);
CREATE INDEX idx_bills_due_date ON bills(due_date);
