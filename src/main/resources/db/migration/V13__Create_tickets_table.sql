-- V13__Create_tickets_table.sql

CREATE TABLE tickets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    room_id BIGINT NOT NULL,
    resident_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    priority VARCHAR(50) NOT NULL DEFAULT 'MEDIUM',
    category VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    resolved_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tickets_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
    CONSTRAINT fk_tickets_room FOREIGN KEY (room_id) REFERENCES rooms(id),
    CONSTRAINT fk_tickets_resident FOREIGN KEY (resident_id) REFERENCES residents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tickets_tenant_id ON tickets(tenant_id);
CREATE INDEX idx_tickets_room_id ON tickets(room_id);
CREATE INDEX idx_tickets_status ON tickets(status);
