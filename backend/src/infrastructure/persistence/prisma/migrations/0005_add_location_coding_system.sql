-- Migration: Add Location Coding (LC) System
-- Description: Add LC codes and LC components to all warehouse tables
-- Version: 0005
-- Created: 2025-09-13
-- Location Coding Structure: WWZZAARRLLMM (12 digits)
-- WW=Warehouse, ZZ=Zone, AA=Aisle, RR=Rack, LL=Level, MM=Location

-- Set search path to include warehouse schema
SET search_path TO warehouse, public;

-- =========================================
-- Update warehouses table with LC structure
-- =========================================
ALTER TABLE warehouse.warehouses
ADD COLUMN lc_warehouse_code CHAR(2) UNIQUE,
ADD COLUMN lc_full_code VARCHAR(15); -- Format: LC-WW

-- Create function to generate warehouse LC code
CREATE OR REPLACE FUNCTION warehouse.generate_warehouse_lc_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate LC code in format LC-WW
    IF NEW.lc_warehouse_code IS NOT NULL THEN
        NEW.lc_full_code = 'LC-' || NEW.lc_warehouse_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for warehouses LC code generation
CREATE TRIGGER trigger_warehouse_lc_code
    BEFORE INSERT OR UPDATE ON warehouse.warehouses
    FOR EACH ROW
    EXECUTE FUNCTION warehouse.generate_warehouse_lc_code();

-- =========================================
-- Update zones table with LC structure
-- =========================================
ALTER TABLE warehouse.zones
ADD COLUMN lc_warehouse_code CHAR(2),
ADD COLUMN lc_zone_code CHAR(2),
ADD COLUMN lc_full_code VARCHAR(15); -- Format: LC-WW-ZZ

-- Create function to generate zone LC code
CREATE OR REPLACE FUNCTION warehouse.generate_zone_lc_code()
RETURNS TRIGGER AS $$
DECLARE
    warehouse_lc CHAR(2);
BEGIN
    -- Get warehouse LC code
    SELECT lc_warehouse_code INTO warehouse_lc
    FROM warehouse.warehouses
    WHERE warehouse_id = NEW.warehouse_id;

    NEW.lc_warehouse_code = warehouse_lc;

    -- Generate LC code in format LC-WW-ZZ
    IF NEW.lc_zone_code IS NOT NULL AND warehouse_lc IS NOT NULL THEN
        NEW.lc_full_code = 'LC-' || warehouse_lc || '-' || NEW.lc_zone_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for zones LC code generation
CREATE TRIGGER trigger_zone_lc_code
    BEFORE INSERT OR UPDATE ON warehouse.zones
    FOR EACH ROW
    EXECUTE FUNCTION warehouse.generate_zone_lc_code();

-- =========================================
-- Update aisles table with LC structure
-- =========================================
ALTER TABLE warehouse.aisles
ADD COLUMN lc_warehouse_code CHAR(2),
ADD COLUMN lc_zone_code CHAR(2),
ADD COLUMN lc_aisle_code CHAR(2),
ADD COLUMN lc_full_code VARCHAR(15); -- Format: LC-WW-ZZ-AA

-- Create function to generate aisle LC code
CREATE OR REPLACE FUNCTION warehouse.generate_aisle_lc_code()
RETURNS TRIGGER AS $$
DECLARE
    warehouse_lc CHAR(2);
    zone_lc CHAR(2);
BEGIN
    -- Get warehouse and zone LC codes
    SELECT w.lc_warehouse_code, z.lc_zone_code
    INTO warehouse_lc, zone_lc
    FROM warehouse.zones z
    JOIN warehouse.warehouses w ON z.warehouse_id = w.warehouse_id
    WHERE z.zone_id = NEW.zone_id;

    NEW.lc_warehouse_code = warehouse_lc;
    NEW.lc_zone_code = zone_lc;

    -- Generate LC code in format LC-WW-ZZ-AA
    IF NEW.lc_aisle_code IS NOT NULL AND warehouse_lc IS NOT NULL AND zone_lc IS NOT NULL THEN
        NEW.lc_full_code = 'LC-' || warehouse_lc || '-' || zone_lc || '-' || NEW.lc_aisle_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for aisles LC code generation
CREATE TRIGGER trigger_aisle_lc_code
    BEFORE INSERT OR UPDATE ON warehouse.aisles
    FOR EACH ROW
    EXECUTE FUNCTION warehouse.generate_aisle_lc_code();

-- =========================================
-- Update racks table with LC structure
-- =========================================
ALTER TABLE warehouse.racks
ADD COLUMN lc_warehouse_code CHAR(2),
ADD COLUMN lc_zone_code CHAR(2),
ADD COLUMN lc_aisle_code CHAR(2),
ADD COLUMN lc_rack_code CHAR(2),
ADD COLUMN lc_full_code VARCHAR(15); -- Format: LC-WW-ZZ-AA-RR

-- Create function to generate rack LC code
CREATE OR REPLACE FUNCTION warehouse.generate_rack_lc_code()
RETURNS TRIGGER AS $$
DECLARE
    warehouse_lc CHAR(2);
    zone_lc CHAR(2);
    aisle_lc CHAR(2);
BEGIN
    -- Get warehouse, zone, and aisle LC codes
    SELECT w.lc_warehouse_code, z.lc_zone_code, a.lc_aisle_code
    INTO warehouse_lc, zone_lc, aisle_lc
    FROM warehouse.aisles a
    JOIN warehouse.zones z ON a.zone_id = z.zone_id
    JOIN warehouse.warehouses w ON z.warehouse_id = w.warehouse_id
    WHERE a.aisle_id = NEW.aisle_id;

    NEW.lc_warehouse_code = warehouse_lc;
    NEW.lc_zone_code = zone_lc;
    NEW.lc_aisle_code = aisle_lc;

    -- Generate LC code in format LC-WW-ZZ-AA-RR
    IF NEW.lc_rack_code IS NOT NULL AND warehouse_lc IS NOT NULL AND zone_lc IS NOT NULL AND aisle_lc IS NOT NULL THEN
        NEW.lc_full_code = 'LC-' || warehouse_lc || '-' || zone_lc || '-' || aisle_lc || '-' || NEW.lc_rack_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for racks LC code generation
CREATE TRIGGER trigger_rack_lc_code
    BEFORE INSERT OR UPDATE ON warehouse.racks
    FOR EACH ROW
    EXECUTE FUNCTION warehouse.generate_rack_lc_code();

-- =========================================
-- Update levels table with LC structure
-- =========================================
ALTER TABLE warehouse.levels
ADD COLUMN lc_warehouse_code CHAR(2),
ADD COLUMN lc_zone_code CHAR(2),
ADD COLUMN lc_aisle_code CHAR(2),
ADD COLUMN lc_rack_code CHAR(2),
ADD COLUMN lc_level_code CHAR(2),
ADD COLUMN lc_full_code VARCHAR(15); -- Format: LC-WW-ZZ-AA-RR-LL

-- Create function to generate level LC code
CREATE OR REPLACE FUNCTION warehouse.generate_level_lc_code()
RETURNS TRIGGER AS $$
DECLARE
    warehouse_lc CHAR(2);
    zone_lc CHAR(2);
    aisle_lc CHAR(2);
    rack_lc CHAR(2);
BEGIN
    -- Get warehouse, zone, aisle, and rack LC codes
    SELECT w.lc_warehouse_code, z.lc_zone_code, a.lc_aisle_code, r.lc_rack_code
    INTO warehouse_lc, zone_lc, aisle_lc, rack_lc
    FROM warehouse.racks r
    JOIN warehouse.aisles a ON r.aisle_id = a.aisle_id
    JOIN warehouse.zones z ON a.zone_id = z.zone_id
    JOIN warehouse.warehouses w ON z.warehouse_id = w.warehouse_id
    WHERE r.rack_id = NEW.rack_id;

    NEW.lc_warehouse_code = warehouse_lc;
    NEW.lc_zone_code = zone_lc;
    NEW.lc_aisle_code = aisle_lc;
    NEW.lc_rack_code = rack_lc;

    -- Generate LC code in format LC-WW-ZZ-AA-RR-LL
    IF NEW.lc_level_code IS NOT NULL AND warehouse_lc IS NOT NULL AND zone_lc IS NOT NULL AND aisle_lc IS NOT NULL AND rack_lc IS NOT NULL THEN
        NEW.lc_full_code = 'LC-' || warehouse_lc || '-' || zone_lc || '-' || aisle_lc || '-' || rack_lc || '-' || NEW.lc_level_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for levels LC code generation
CREATE TRIGGER trigger_level_lc_code
    BEFORE INSERT OR UPDATE ON warehouse.levels
    FOR EACH ROW
    EXECUTE FUNCTION warehouse.generate_level_lc_code();

-- =========================================
-- Update locations table with LC structure
-- =========================================
ALTER TABLE warehouse.locations
ADD COLUMN lc_warehouse_code CHAR(2),
ADD COLUMN lc_zone_code CHAR(2),
ADD COLUMN lc_aisle_code CHAR(2),
ADD COLUMN lc_rack_code CHAR(2),
ADD COLUMN lc_level_code CHAR(2),
ADD COLUMN lc_location_code CHAR(2),
ADD COLUMN lc_full_code VARCHAR(15), -- Format: LC-WW-ZZ-AA-RR-LL-MM
ADD COLUMN lc_numeric_code CHAR(12); -- Format: WWZZAARRLLMM (pure numeric)

-- Create function to generate location LC code
CREATE OR REPLACE FUNCTION warehouse.generate_location_lc_code()
RETURNS TRIGGER AS $$
DECLARE
    warehouse_lc CHAR(2);
    zone_lc CHAR(2);
    aisle_lc CHAR(2);
    rack_lc CHAR(2);
    level_lc CHAR(2);
BEGIN
    -- Get all parent LC codes
    SELECT w.lc_warehouse_code, z.lc_zone_code, a.lc_aisle_code, r.lc_rack_code, l.lc_level_code
    INTO warehouse_lc, zone_lc, aisle_lc, rack_lc, level_lc
    FROM warehouse.levels l
    JOIN warehouse.racks r ON l.rack_id = r.rack_id
    JOIN warehouse.aisles a ON r.aisle_id = a.aisle_id
    JOIN warehouse.zones z ON a.zone_id = z.zone_id
    JOIN warehouse.warehouses w ON z.warehouse_id = w.warehouse_id
    WHERE l.level_id = NEW.level_id;

    NEW.lc_warehouse_code = warehouse_lc;
    NEW.lc_zone_code = zone_lc;
    NEW.lc_aisle_code = aisle_lc;
    NEW.lc_rack_code = rack_lc;
    NEW.lc_level_code = level_lc;

    -- Generate LC codes
    IF NEW.lc_location_code IS NOT NULL AND warehouse_lc IS NOT NULL AND zone_lc IS NOT NULL
       AND aisle_lc IS NOT NULL AND rack_lc IS NOT NULL AND level_lc IS NOT NULL THEN
        -- Format: LC-WW-ZZ-AA-RR-LL-MM
        NEW.lc_full_code = 'LC-' || warehouse_lc || '-' || zone_lc || '-' || aisle_lc || '-' ||
                          rack_lc || '-' || level_lc || '-' || NEW.lc_location_code;
        -- Format: WWZZAARRLLMM (pure numeric)
        NEW.lc_numeric_code = warehouse_lc || zone_lc || aisle_lc || rack_lc || level_lc || NEW.lc_location_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for locations LC code generation
CREATE TRIGGER trigger_location_lc_code
    BEFORE INSERT OR UPDATE ON warehouse.locations
    FOR EACH ROW
    EXECUTE FUNCTION warehouse.generate_location_lc_code();

-- =========================================
-- Create indexes for LC codes
-- =========================================
CREATE UNIQUE INDEX idx_warehouses_lc_warehouse_code ON warehouse.warehouses(lc_warehouse_code) WHERE lc_warehouse_code IS NOT NULL;
CREATE UNIQUE INDEX idx_warehouses_lc_full_code ON warehouse.warehouses(lc_full_code) WHERE lc_full_code IS NOT NULL;

CREATE INDEX idx_zones_lc_codes ON warehouse.zones(lc_warehouse_code, lc_zone_code);
CREATE UNIQUE INDEX idx_zones_lc_full_code ON warehouse.zones(lc_full_code) WHERE lc_full_code IS NOT NULL;

CREATE INDEX idx_aisles_lc_codes ON warehouse.aisles(lc_warehouse_code, lc_zone_code, lc_aisle_code);
CREATE UNIQUE INDEX idx_aisles_lc_full_code ON warehouse.aisles(lc_full_code) WHERE lc_full_code IS NOT NULL;

CREATE INDEX idx_racks_lc_codes ON warehouse.racks(lc_warehouse_code, lc_zone_code, lc_aisle_code, lc_rack_code);
CREATE UNIQUE INDEX idx_racks_lc_full_code ON warehouse.racks(lc_full_code) WHERE lc_full_code IS NOT NULL;

CREATE INDEX idx_levels_lc_codes ON warehouse.levels(lc_warehouse_code, lc_zone_code, lc_aisle_code, lc_rack_code, lc_level_code);
CREATE UNIQUE INDEX idx_levels_lc_full_code ON warehouse.levels(lc_full_code) WHERE lc_full_code IS NOT NULL;

CREATE INDEX idx_locations_lc_codes ON warehouse.locations(lc_warehouse_code, lc_zone_code, lc_aisle_code, lc_rack_code, lc_level_code, lc_location_code);
CREATE UNIQUE INDEX idx_locations_lc_full_code ON warehouse.locations(lc_full_code) WHERE lc_full_code IS NOT NULL;
CREATE UNIQUE INDEX idx_locations_lc_numeric_code ON warehouse.locations(lc_numeric_code) WHERE lc_numeric_code IS NOT NULL;

-- =========================================
-- Create helper functions for LC operations
-- =========================================

-- Function to parse LC code and return components
CREATE OR REPLACE FUNCTION warehouse.parse_lc_code(lc_code VARCHAR)
RETURNS TABLE(
    warehouse_code CHAR(2),
    zone_code CHAR(2),
    aisle_code CHAR(2),
    rack_code CHAR(2),
    level_code CHAR(2),
    location_code CHAR(2)
) AS $$
BEGIN
    -- Remove LC- prefix and parse numeric code
    IF length(lc_code) = 12 THEN
        -- Pure numeric format: WWZZAARRLLMM
        RETURN QUERY SELECT
            substring(lc_code, 1, 2)::CHAR(2),
            substring(lc_code, 3, 2)::CHAR(2),
            substring(lc_code, 5, 2)::CHAR(2),
            substring(lc_code, 7, 2)::CHAR(2),
            substring(lc_code, 9, 2)::CHAR(2),
            substring(lc_code, 11, 2)::CHAR(2);
    ELSIF lc_code LIKE 'LC-%' THEN
        -- Formatted code: LC-WW-ZZ-AA-RR-LL-MM
        DECLARE
            clean_code TEXT;
        BEGIN
            clean_code = replace(lc_code, 'LC-', '');
            clean_code = replace(clean_code, '-', '');
            IF length(clean_code) = 12 THEN
                RETURN QUERY SELECT
                    substring(clean_code, 1, 2)::CHAR(2),
                    substring(clean_code, 3, 2)::CHAR(2),
                    substring(clean_code, 5, 2)::CHAR(2),
                    substring(clean_code, 7, 2)::CHAR(2),
                    substring(clean_code, 9, 2)::CHAR(2),
                    substring(clean_code, 11, 2)::CHAR(2);
            END IF;
        END;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to validate LC code format
CREATE OR REPLACE FUNCTION warehouse.validate_lc_code(lc_code VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check for pure numeric format (12 digits)
    IF lc_code ~ '^[0-9]{12}$' THEN
        RETURN TRUE;
    END IF;

    -- Check for formatted code (LC-XX-XX-XX-XX-XX-XX)
    IF lc_code ~ '^LC-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}-[0-9]{2}$' THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to find location by LC code
CREATE OR REPLACE FUNCTION warehouse.find_location_by_lc(lc_code VARCHAR)
RETURNS TABLE(
    location_id VARCHAR(35),
    location_name VARCHAR(50),
    lc_full_code VARCHAR(15),
    lc_numeric_code CHAR(12)
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.location_id, l.location_name, l.lc_full_code, l.lc_numeric_code
    FROM warehouse.locations l
    WHERE l.lc_full_code = lc_code
       OR l.lc_numeric_code = lc_code
       OR l.lc_numeric_code = replace(replace(lc_code, 'LC-', ''), '-', '');
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- Add comments for LC system
-- =========================================
COMMENT ON COLUMN warehouse.warehouses.lc_warehouse_code IS 'Location Coding warehouse component (2 digits)';
COMMENT ON COLUMN warehouse.warehouses.lc_full_code IS 'Full LC code in format LC-WW';

COMMENT ON COLUMN warehouse.zones.lc_warehouse_code IS 'Location Coding warehouse component (2 digits)';
COMMENT ON COLUMN warehouse.zones.lc_zone_code IS 'Location Coding zone component (2 digits)';
COMMENT ON COLUMN warehouse.zones.lc_full_code IS 'Full LC code in format LC-WW-ZZ';

COMMENT ON COLUMN warehouse.aisles.lc_warehouse_code IS 'Location Coding warehouse component (2 digits)';
COMMENT ON COLUMN warehouse.aisles.lc_zone_code IS 'Location Coding zone component (2 digits)';
COMMENT ON COLUMN warehouse.aisles.lc_aisle_code IS 'Location Coding aisle component (2 digits)';
COMMENT ON COLUMN warehouse.aisles.lc_full_code IS 'Full LC code in format LC-WW-ZZ-AA';

COMMENT ON COLUMN warehouse.racks.lc_warehouse_code IS 'Location Coding warehouse component (2 digits)';
COMMENT ON COLUMN warehouse.racks.lc_zone_code IS 'Location Coding zone component (2 digits)';
COMMENT ON COLUMN warehouse.racks.lc_aisle_code IS 'Location Coding aisle component (2 digits)';
COMMENT ON COLUMN warehouse.racks.lc_rack_code IS 'Location Coding rack component (2 digits)';
COMMENT ON COLUMN warehouse.racks.lc_full_code IS 'Full LC code in format LC-WW-ZZ-AA-RR';

COMMENT ON COLUMN warehouse.levels.lc_warehouse_code IS 'Location Coding warehouse component (2 digits)';
COMMENT ON COLUMN warehouse.levels.lc_zone_code IS 'Location Coding zone component (2 digits)';
COMMENT ON COLUMN warehouse.levels.lc_aisle_code IS 'Location Coding aisle component (2 digits)';
COMMENT ON COLUMN warehouse.levels.lc_rack_code IS 'Location Coding rack component (2 digits)';
COMMENT ON COLUMN warehouse.levels.lc_level_code IS 'Location Coding level component (2 digits)';
COMMENT ON COLUMN warehouse.levels.lc_full_code IS 'Full LC code in format LC-WW-ZZ-AA-RR-LL';

COMMENT ON COLUMN warehouse.locations.lc_warehouse_code IS 'Location Coding warehouse component (2 digits)';
COMMENT ON COLUMN warehouse.locations.lc_zone_code IS 'Location Coding zone component (2 digits)';
COMMENT ON COLUMN warehouse.locations.lc_aisle_code IS 'Location Coding aisle component (2 digits)';
COMMENT ON COLUMN warehouse.locations.lc_rack_code IS 'Location Coding rack component (2 digits)';
COMMENT ON COLUMN warehouse.locations.lc_level_code IS 'Location Coding level component (2 digits)';
COMMENT ON COLUMN warehouse.locations.lc_location_code IS 'Location Coding location component (2 digits)';
COMMENT ON COLUMN warehouse.locations.lc_full_code IS 'Full LC code in format LC-WW-ZZ-AA-RR-LL-MM';
COMMENT ON COLUMN warehouse.locations.lc_numeric_code IS 'Numeric LC code in format WWZZAARRLLMM (12 digits)';