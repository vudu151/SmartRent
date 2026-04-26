INSERT INTO buildings (tenant_id, name, address, electricity_price, water_price, service_price, internet_price, parking_price)
SELECT t.id, 'Khu A của Tenant GMail', 'Địa chỉ GMail', 3500, 25000, 100000, 100000, 120000
FROM tenants t JOIN users u ON t.id = u.tenant_id
WHERE u.email = 'tenant@gmail.com' AND NOT EXISTS (
    SELECT 1 FROM buildings b WHERE b.tenant_id = t.id AND b.name = 'Khu A của Tenant GMail'
);
