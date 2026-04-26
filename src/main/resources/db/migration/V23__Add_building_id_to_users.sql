-- Add building_id to users to map GUARD and RESIDENT users to a specific building
ALTER TABLE users ADD COLUMN building_id BIGINT;
ALTER TABLE users ADD CONSTRAINT fk_users_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL;
CREATE INDEX idx_users_building_id ON users(building_id);
