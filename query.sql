SELECT t.id as tenant_id, u.email, u.role FROM users u LEFT JOIN tenants t ON u.tenant_id = t.id WHERE u.email = 'tenant@gmail.com';
