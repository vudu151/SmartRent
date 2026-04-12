-- V12__Add_portal_token_and_bank.sql

-- 1. Add banking info to tenants table
ALTER TABLE tenants 
ADD COLUMN bank_name VARCHAR(100),
ADD COLUMN bank_account VARCHAR(50),
ADD COLUMN bank_owner VARCHAR(100);

-- 2. Add portal token to contracts table for magic link access
ALTER TABLE contracts 
ADD COLUMN portal_token VARCHAR(255);

-- 3. Add an index to speed up magic link lookups
CREATE INDEX idx_contracts_portal_token ON contracts(portal_token);

-- 4. Auto-generate a portal_token for existing contracts
UPDATE contracts SET portal_token = UUID() WHERE portal_token IS NULL;

-- 5. Force the token to be NOT NULL after population to assure security
ALTER TABLE contracts MODIFY COLUMN portal_token VARCHAR(255) NOT NULL;
