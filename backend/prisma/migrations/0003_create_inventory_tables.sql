-- Migration: Create Inventory Management Tables
-- Description: Create inventory, movements, counts, reservations and bin management tables
-- Version: 0003
-- Created: 2025-09-13

-- Set search path to include warehouse schema
SET search_path TO warehouse, public;

-- =========================================
-- Create inventory table
-- =========================================
CREATE TABLE warehouse.inventory (
    -- Primary keys and identifiers
    inventory_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(20) NOT NULL,
    location_id VARCHAR(35) NOT NULL,

    -- Quantity and measurement information
    quantity DECIMAL(10,2) NOT NULL,
    uom_id VARCHAR(10) NOT NULL,
    min_stock_level DECIMAL(10,2),
    max_stock_level DECIMAL(10,2),
    reorder_point DECIMAL(10,2),

    -- Tracking information
    lot_number VARCHAR(50),
    serial_number VARCHAR(50),

    -- Date information
    production_date DATE,
    expiry_date DATE,
    last_movement_date TIMESTAMP,

    -- Inventory status
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'damaged', 'expired', 'quarantine')),
    is_active BOOLEAN DEFAULT TRUE,
    quality_status VARCHAR(20),

    -- Storage information
    temperature_zone VARCHAR(20),
    weight DECIMAL(10,2),
    dimensions VARCHAR(50),
    hazard_class VARCHAR(20),

    -- Ownership and supplier information
    owner_id VARCHAR(36),
    supplier_id VARCHAR(36),

    -- Customs information
    customs_info TEXT,

    -- Identification
    barcode VARCHAR(50),
    rfid_tag VARCHAR(50),

    -- Audit and approval information
    last_audit_date DATE,
    audit_notes TEXT,
    approval_date TIMESTAMP,
    approved_by VARCHAR(36),

    -- Record timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign keys for audit
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Foreign key constraints
    CONSTRAINT fk_inventory_location FOREIGN KEY (location_id) REFERENCES warehouse.locations(location_id)
);

-- =========================================
-- Create inventory_movements table
-- =========================================
CREATE TABLE warehouse.inventory_movements (
    -- Primary keys and identifiers
    movement_id VARCHAR(36) PRIMARY KEY,
    inventory_id VARCHAR(36) NOT NULL,

    -- Location information
    source_location_id VARCHAR(35),
    destination_location_id VARCHAR(35),

    -- Movement quantities and transfer
    quantity DECIMAL(10,2) NOT NULL,
    uom_id VARCHAR(10) NOT NULL,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('inbound', 'outbound', 'transfer', 'adjustment', 'cycle_count')),
    movement_reason VARCHAR(50),

    -- Reference information
    reference_id VARCHAR(36),
    reference_type VARCHAR(20),
    batch_number VARCHAR(50),

    -- Execution information
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    performed_by VARCHAR(36),
    system_generated BOOLEAN DEFAULT FALSE,

    -- Approval information
    approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approval_date TIMESTAMP,
    approved_by VARCHAR(36),

    -- Financial information
    transaction_value DECIMAL(12,2),
    currency VARCHAR(3),
    movement_cost DECIMAL(10,2),

    -- Transport and shipping information
    transport_mode VARCHAR(20),
    carrier_id VARCHAR(36),
    tracking_number VARCHAR(50),
    expected_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,

    -- Record information
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign keys for audit
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Foreign key constraints
    CONSTRAINT fk_movements_inventory FOREIGN KEY (inventory_id) REFERENCES warehouse.inventory(inventory_id),
    CONSTRAINT fk_movements_source_location FOREIGN KEY (source_location_id) REFERENCES warehouse.locations(location_id),
    CONSTRAINT fk_movements_destination_location FOREIGN KEY (destination_location_id) REFERENCES warehouse.locations(location_id)
);

-- =========================================
-- Create inventory_counts table
-- =========================================
CREATE TABLE warehouse.inventory_counts (
    -- Primary keys and identifiers
    count_id VARCHAR(36) PRIMARY KEY,
    warehouse_id VARCHAR(10) NOT NULL,

    -- Basic count information
    count_name VARCHAR(100),
    count_type VARCHAR(20) NOT NULL CHECK (count_type IN ('cycle', 'full', 'partial', 'spot')),
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),

    -- Count dates
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    expected_completion TIMESTAMP,

    -- Team information
    team_leader VARCHAR(36),
    count_team TEXT,

    -- Count settings
    count_method VARCHAR(20),
    count_frequency VARCHAR(20),
    count_zone VARCHAR(20),
    count_category VARCHAR(20),
    variance_threshold DECIMAL(5,2),

    -- Approval information
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP,
    approved_by VARCHAR(36),

    -- Recount information
    is_recount BOOLEAN DEFAULT FALSE,
    original_count_id VARCHAR(36),

    -- Additional information
    priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')),
    notes TEXT,

    -- Record timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign keys for audit
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Foreign key constraints
    CONSTRAINT fk_counts_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse.warehouses(warehouse_id)
);

-- =========================================
-- Create inventory_count_details table
-- =========================================
CREATE TABLE warehouse.inventory_count_details (
    -- Primary keys and identifiers
    count_detail_id VARCHAR(36) PRIMARY KEY,
    count_id VARCHAR(36) NOT NULL,
    inventory_id VARCHAR(36) NOT NULL,

    -- Quantity information
    expected_quantity DECIMAL(10,2),
    counted_quantity DECIMAL(10,2),
    recount_quantity DECIMAL(10,2),
    uom_id VARCHAR(10) NOT NULL,

    -- Variance information
    variance DECIMAL(10,2),
    variance_percentage DECIMAL(10,2),

    -- Count process information
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'counted', 'adjusted')),
    count_method VARCHAR(20),
    device_id VARCHAR(36),

    -- Personnel responsible for counting
    counted_by VARCHAR(36),
    counted_at TIMESTAMP,
    recount_by VARCHAR(36),
    recount_at TIMESTAMP,
    recount_status VARCHAR(20),

    -- Adjustment information
    adjustment_id VARCHAR(36),
    adjustment_by VARCHAR(36),
    adjustment_date TIMESTAMP,

    -- Verification information
    location_verified BOOLEAN,
    batch_verified BOOLEAN,
    expiry_verified BOOLEAN,
    item_condition VARCHAR(20),

    -- Additional information
    notes TEXT,

    -- Record timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign keys for audit
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Foreign key constraints
    CONSTRAINT fk_count_details_count FOREIGN KEY (count_id) REFERENCES warehouse.inventory_counts(count_id),
    CONSTRAINT fk_count_details_inventory FOREIGN KEY (inventory_id) REFERENCES warehouse.inventory(inventory_id)
);

-- =========================================
-- Create inventory_reservations table
-- =========================================
CREATE TABLE warehouse.inventory_reservations (
    -- Basic information
    reservation_id VARCHAR(36) PRIMARY KEY,
    reservation_number VARCHAR(50) UNIQUE NOT NULL,

    -- Relationships to other tables
    product_id VARCHAR(20) NOT NULL,
    inventory_id VARCHAR(36),
    location_id VARCHAR(35),

    -- Quantity information
    quantity DECIMAL(10,2) NOT NULL,
    uom_id VARCHAR(10) NOT NULL,

    -- Reservation information
    reservation_type VARCHAR(20) NOT NULL CHECK (reservation_type IN ('sale', 'transfer', 'production', 'quality_check')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'released', 'fulfilled', 'cancelled')),

    -- References
    reference_id VARCHAR(36),
    reference_type VARCHAR(30),

    -- Dates
    reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    released_at TIMESTAMP,

    -- User information
    reserved_by VARCHAR(36) NOT NULL,
    released_by VARCHAR(36),

    -- Additional information
    notes TEXT,
    priority INTEGER DEFAULT 5,

    -- Tracking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Constraints
    CONSTRAINT chk_inv_res_quantity CHECK (quantity > 0),
    CONSTRAINT chk_inv_res_dates CHECK (expires_at IS NULL OR expires_at > reserved_at),

    -- Foreign key constraints
    CONSTRAINT fk_reservations_inventory FOREIGN KEY (inventory_id) REFERENCES warehouse.inventory(inventory_id),
    CONSTRAINT fk_reservations_location FOREIGN KEY (location_id) REFERENCES warehouse.locations(location_id)
);

-- =========================================
-- Create indexes for better performance
-- =========================================

-- Inventory indexes
CREATE INDEX idx_inventory_product_location ON warehouse.inventory(product_id, location_id);
CREATE INDEX idx_inventory_status ON warehouse.inventory(status, is_active);
CREATE INDEX idx_inventory_expiry ON warehouse.inventory(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_inventory_lot_serial ON warehouse.inventory(lot_number, serial_number) WHERE lot_number IS NOT NULL OR serial_number IS NOT NULL;

-- Inventory movements indexes
CREATE INDEX idx_movements_inventory_id ON warehouse.inventory_movements(inventory_id, movement_date);
CREATE INDEX idx_movements_type_date ON warehouse.inventory_movements(movement_type, movement_date);
CREATE INDEX idx_movements_locations ON warehouse.inventory_movements(source_location_id, destination_location_id);
CREATE INDEX idx_movements_reference ON warehouse.inventory_movements(reference_id, reference_type);

-- Inventory counts indexes
CREATE INDEX idx_counts_warehouse_status ON warehouse.inventory_counts(warehouse_id, status);
CREATE INDEX idx_counts_dates ON warehouse.inventory_counts(start_date, end_date);

-- Count details indexes
CREATE INDEX idx_count_details_count_id ON warehouse.inventory_count_details(count_id, status);
CREATE INDEX idx_count_details_variance ON warehouse.inventory_count_details(variance) WHERE variance != 0;

-- Reservations indexes
CREATE INDEX idx_reservations_product ON warehouse.inventory_reservations(product_id, status);
CREATE INDEX idx_reservations_expires ON warehouse.inventory_reservations(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_reservations_reference ON warehouse.inventory_reservations(reference_id, reference_type);

-- =========================================
-- Add comments to tables
-- =========================================
COMMENT ON TABLE warehouse.inventory IS 'Main inventory tracking table with product quantities and locations';
COMMENT ON TABLE warehouse.inventory_movements IS 'All inventory movements including inbound, outbound, transfers and adjustments';
COMMENT ON TABLE warehouse.inventory_counts IS 'Inventory count sessions and cycle counting operations';
COMMENT ON TABLE warehouse.inventory_count_details IS 'Detailed count results for each inventory item';
COMMENT ON TABLE warehouse.inventory_reservations IS 'Temporary reservations of inventory for orders and operations';