UPDATE users SET username = 'admin@gmail.com', email = 'admin@gmail.com' WHERE role = 'SUPER_ADMIN' AND username IN ('admin', 'tenant');
UPDATE users SET username = 'tenant@gmail.com', email = 'tenant@gmail.com' WHERE role = 'TENANT' AND username = 'tenant';
UPDATE users SET username = 'resident@gmail.com', email = 'resident@gmail.com' WHERE role = 'RESIDENT' AND username = 'resident';
UPDATE users SET username = 'guard@gmail.com', email = 'guard@gmail.com' WHERE role = 'GUARD' AND username = 'guard';
