-- Migration: Create Warehouse Schema
-- Description: Create the warehouse management schema with all necessary tables
-- Version: 0002
-- Created: 2025-09-13

-- Create warehouse schema to organize warehouse-related tables
CREATE SCHEMA IF NOT EXISTS warehouse;

-- Set search path to include new schema
SET search_path TO warehouse, public;

-- =========================================
-- Create warehouses table
-- =========================================
CREATE TABLE warehouse.warehouses (
    -- Primary identification
    warehouse_id VARCHAR(10) PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    warehouse_code VARCHAR(20) UNIQUE,

    -- Address information
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    country VARCHAR(50),
    postal_code VARCHAR(20),

    -- Contact information
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    secondary_contact_phone VARCHAR(20),

    -- Technical specifications
    total_area DECIMAL(10,2),
    area_unit VARCHAR(10),
    storage_capacity INTEGER,
    warehouse_type VARCHAR(50),
    temperature_controlled BOOLEAN DEFAULT FALSE,
    min_temperature DECIMAL(5,2),
    max_temperature DECIMAL(5,2),
    temperature_unit VARCHAR(10),

    -- Status and audit
    is_active BOOLEAN DEFAULT TRUE,
    operational_status VARCHAR(20) DEFAULT 'operational' CHECK (operational_status IN ('operational', 'maintenance', 'closed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Additional settings
    timezone VARCHAR(50),
    operating_hours JSONB,
    custom_attributes JSONB
);

-- =========================================
-- Create zones table
-- =========================================
CREATE TABLE warehouse.zones (
    -- Primary identification
    zone_id VARCHAR(15) PRIMARY KEY,
    warehouse_id VARCHAR(10) NOT NULL,
    zone_name VARCHAR(100) NOT NULL,
    zone_code VARCHAR(20) UNIQUE,

    -- Properties
    zone_type VARCHAR(50) NOT NULL CHECK (zone_type IN ('receiving', 'shipping', 'storage', 'picking', 'packing', 'staging')),
    description TEXT,
    area DECIMAL(10,2),
    area_unit VARCHAR(10),
    capacity INTEGER,
    priority INTEGER DEFAULT 0,

    -- Coordinates
    center_x DOUBLE PRECISION NOT NULL,
    center_y DOUBLE PRECISION NOT NULL,
    coordinate_unit VARCHAR(10),

    -- Environmental control
    temperature_controlled BOOLEAN DEFAULT FALSE,
    min_temperature DECIMAL(5,2),
    max_temperature DECIMAL(5,2),
    temperature_unit VARCHAR(10),

    -- Status and audit
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Additional settings
    custom_attributes JSONB,

    -- Foreign keys
    CONSTRAINT fk_zones_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse.warehouses(warehouse_id)
);

-- =========================================
-- Create aisles table
-- =========================================
CREATE TABLE warehouse.aisles (
    -- Primary identification
    aisle_id VARCHAR(20) PRIMARY KEY,
    zone_id VARCHAR(15) NOT NULL,
    aisle_name VARCHAR(50) NOT NULL,
    aisle_code VARCHAR(20) UNIQUE,

    -- Properties
    description TEXT,
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    dimension_unit VARCHAR(10),
    capacity INTEGER,
    aisle_direction VARCHAR(20),

    -- Status and audit
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Coordinates
    start_x DOUBLE PRECISION NOT NULL,
    start_y DOUBLE PRECISION NOT NULL,
    end_x DOUBLE PRECISION NOT NULL,
    end_y DOUBLE PRECISION NOT NULL,
    center_x DOUBLE PRECISION,
    center_y DOUBLE PRECISION,
    coordinate_unit VARCHAR(10),

    -- Additional settings
    custom_attributes JSONB,

    -- Foreign keys
    CONSTRAINT fk_aisles_zone FOREIGN KEY (zone_id) REFERENCES warehouse.zones(zone_id)
);

-- =========================================
-- Create racks table
-- =========================================
CREATE TABLE warehouse.racks (
    -- Primary identification
    rack_id VARCHAR(25) PRIMARY KEY,
    aisle_id VARCHAR(20) NOT NULL,
    rack_name VARCHAR(50) NOT NULL,
    rack_code VARCHAR(20) UNIQUE,

    -- Properties
    rack_type VARCHAR(50) CHECK (rack_type IN ('pallet', 'shelving', 'cantilever', 'drive-in')),
    description TEXT,
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    dimension_unit VARCHAR(10),
    max_weight DECIMAL(10,2),
    weight_unit VARCHAR(10),
    capacity INTEGER,
    rack_system VARCHAR(50),
    total_levels INTEGER,

    -- Coordinates
    center_x DOUBLE PRECISION NOT NULL,
    center_y DOUBLE PRECISION NOT NULL,
    coordinate_unit VARCHAR(10),

    -- Status and audit
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Additional settings
    custom_attributes JSONB,

    -- Foreign keys
    CONSTRAINT fk_racks_aisle FOREIGN KEY (aisle_id) REFERENCES warehouse.aisles(aisle_id)
);

-- =========================================
-- Create levels table
-- =========================================
CREATE TABLE warehouse.levels (
    -- Primary identification
    level_id VARCHAR(30) PRIMARY KEY,
    rack_id VARCHAR(25) NOT NULL,
    level_name VARCHAR(50) NOT NULL,
    level_code VARCHAR(20) UNIQUE,

    -- Properties
    level_number INT NOT NULL,
    height DECIMAL(10,2),
    height_unit VARCHAR(10),
    max_weight DECIMAL(10,2),
    weight_unit VARCHAR(10),
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    dimension_unit VARCHAR(10),
    capacity INTEGER,

    -- Coordinates
    relative_x DOUBLE PRECISION,
    relative_y DOUBLE PRECISION,
    z_position DOUBLE PRECISION,
    coordinate_unit VARCHAR(10),

    -- Status and audit
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'operational' CHECK (status IN ('operational', 'blocked')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Additional settings
    custom_attributes JSONB,

    -- Foreign keys
    CONSTRAINT fk_levels_rack FOREIGN KEY (rack_id) REFERENCES warehouse.racks(rack_id)
);

-- =========================================
-- Create locations table
-- =========================================
CREATE TABLE warehouse.locations (
    -- Primary identification
    location_id VARCHAR(35) PRIMARY KEY,
    level_id VARCHAR(30) NOT NULL,
    location_name VARCHAR(50) NOT NULL,
    location_code VARCHAR(20) UNIQUE,

    -- Properties
    location_type VARCHAR(50) CHECK (location_type IN ('picking', 'storage', 'bulk', 'returns')),
    position INT,
    barcode VARCHAR(50) UNIQUE,
    location_priority VARCHAR(50) CHECK (location_priority IN ('HIGH', 'MEDIUM', 'LOW')),

    -- Bin properties (if not using separate bins table)
    bin_type VARCHAR(20),
    bin_volume DECIMAL(10,2),
    bin_max_weight DECIMAL(10,2),

    -- Measurements
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    dimension_unit VARCHAR(10),
    volume DECIMAL(10,2),
    volume_unit VARCHAR(10),
    max_weight DECIMAL(10,2),
    weight_unit VARCHAR(10),

    -- Coordinates
    relative_x DOUBLE PRECISION,
    relative_y DOUBLE PRECISION,
    z_position DOUBLE PRECISION,
    coordinate_unit VARCHAR(10),

    -- Status and audit
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'blocked')),
    last_occupied_at TIMESTAMP,
    last_vacated_at TIMESTAMP,
    last_inventory_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Additional settings
    custom_attributes JSONB,

    -- Foreign keys
    CONSTRAINT fk_locations_level FOREIGN KEY (level_id) REFERENCES warehouse.levels(level_id)
);

-- =========================================
-- Create indexes for better performance
-- =========================================

-- Warehouses indexes
CREATE INDEX idx_warehouses_is_active ON warehouse.warehouses(is_active, deleted_at);
CREATE INDEX idx_warehouses_operational_status ON warehouse.warehouses(operational_status, is_active);

-- Zones indexes
CREATE INDEX idx_zones_warehouse_id ON warehouse.zones(warehouse_id, is_active);
CREATE INDEX idx_zones_type_status ON warehouse.zones(zone_type, status);

-- Aisles indexes
CREATE INDEX idx_aisles_zone_id ON warehouse.aisles(zone_id, is_active);
CREATE INDEX idx_aisles_status ON warehouse.aisles(status, is_active);

-- Racks indexes
CREATE INDEX idx_racks_aisle_id ON warehouse.racks(aisle_id, is_active);
CREATE INDEX idx_racks_type_status ON warehouse.racks(rack_type, status);

-- Levels indexes
CREATE INDEX idx_levels_rack_id ON warehouse.levels(rack_id, is_active);
CREATE INDEX idx_levels_number ON warehouse.levels(level_number, is_active);

-- Locations indexes
CREATE INDEX idx_locations_level_id ON warehouse.locations(level_id, is_active);
CREATE INDEX idx_locations_status ON warehouse.locations(status, is_active);
CREATE INDEX idx_locations_type ON warehouse.locations(location_type, status);
CREATE INDEX idx_locations_barcode ON warehouse.locations(barcode) WHERE barcode IS NOT NULL;

-- =========================================
-- Add comments to tables
-- =========================================
COMMENT ON SCHEMA warehouse IS 'Warehouse management schema containing all warehouse-related tables';
COMMENT ON TABLE warehouse.warehouses IS 'Main warehouse facilities and their properties';
COMMENT ON TABLE warehouse.zones IS 'Warehouse zones for different operational areas';
COMMENT ON TABLE warehouse.aisles IS 'Storage aisles within zones';
COMMENT ON TABLE warehouse.racks IS 'Storage racks within aisles';
COMMENT ON TABLE warehouse.levels IS 'Storage levels within racks';
COMMENT ON TABLE warehouse.locations IS 'Individual storage locations within levels';