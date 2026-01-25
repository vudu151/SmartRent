-- Create roles table
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions junction table
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('SUPER_ADMIN', 'Super Administrator - Full system access'),
('TENANT_ADMIN', 'Tenant Administrator - Full tenant access'),
('TENANT_MANAGER', 'Tenant Manager - Manage properties and contracts'),
('TENANT_STAFF', 'Tenant Staff - Basic operations'),
('TENANT', 'Tenant - View own information');

-- Insert default permissions
INSERT INTO permissions (name, resource, action) VALUES
-- Room permissions
('ROOM:READ', 'ROOM', 'READ'),
('ROOM:WRITE', 'ROOM', 'WRITE'),
('ROOM:DELETE', 'ROOM', 'DELETE'),
-- Contract permissions
('CONTRACT:READ', 'CONTRACT', 'READ'),
('CONTRACT:WRITE', 'CONTRACT', 'WRITE'),
('CONTRACT:DELETE', 'CONTRACT', 'DELETE'),
-- Invoice permissions
('INVOICE:READ', 'INVOICE', 'READ'),
('INVOICE:WRITE', 'INVOICE', 'WRITE'),
('INVOICE:DELETE', 'INVOICE', 'DELETE'),
-- Payment permissions
('PAYMENT:READ', 'PAYMENT', 'READ'),
('PAYMENT:WRITE', 'PAYMENT', 'WRITE'),
-- User permissions
('USER:READ', 'USER', 'READ'),
('USER:WRITE', 'USER', 'WRITE'),
('USER:DELETE', 'USER', 'DELETE'),
-- Tenant permissions
('TENANT:READ', 'TENANT', 'READ'),
('TENANT:WRITE', 'TENANT', 'WRITE'),
-- Report permissions
('REPORT:READ', 'REPORT', 'READ');

-- Assign permissions to SUPER_ADMIN (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Assign permissions to TENANT_ADMIN (most permissions except system-level)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE resource != 'TENANT' OR action != 'WRITE';

-- Assign permissions to TENANT_MANAGER
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE resource IN ('ROOM', 'CONTRACT', 'INVOICE', 'PAYMENT', 'USER') 
AND action IN ('READ', 'WRITE');

-- Assign permissions to TENANT_STAFF
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions 
WHERE resource IN ('ROOM', 'CONTRACT', 'INVOICE', 'PAYMENT') 
AND action = 'READ';

-- Assign permissions to TENANT (read-only for own data)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions 
WHERE resource IN ('CONTRACT', 'INVOICE', 'PAYMENT') 
AND action = 'READ';
