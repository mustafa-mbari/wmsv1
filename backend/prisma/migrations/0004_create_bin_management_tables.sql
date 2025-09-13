-- Migration: Create Bin Management Tables
-- Description: Create bin types, bins, bin movements, and bin contents tables
-- Version: 0004
-- Created: 2025-09-13

-- Set search path to include warehouse schema
SET search_path TO warehouse, public;

-- =========================================
-- Create bin_types table
-- =========================================
CREATE TABLE warehouse.bin_types (
    type_id VARCHAR(20) PRIMARY KEY,
    type_code VARCHAR(10) UNIQUE NOT NULL,
    type_name VARCHAR(50) NOT NULL,
    description TEXT,
    storage_class VARCHAR(20),

    -- Standard specifications
    standard_length DECIMAL(6,2) NOT NULL,
    standard_width DECIMAL(6,2) NOT NULL,
    standard_height DECIMAL(6,2) NOT NULL,
    standard_volume DECIMAL(10,2),
    standard_weight DECIMAL(10,2),
    max_payload DECIMAL(10,2) NOT NULL,

    -- Storage properties
    is_stackable BOOLEAN DEFAULT TRUE,
    max_stack_count INTEGER DEFAULT 1,
    stackable_with JSONB,

    -- Physical properties
    material VARCHAR(30) NOT NULL,
    color VARCHAR(20),
    is_transparent BOOLEAN DEFAULT FALSE,
    is_foldable BOOLEAN DEFAULT FALSE,

    -- Special requirements
    requires_cleaning BOOLEAN DEFAULT FALSE,
    cleaning_frequency_days INTEGER,
    is_hazardous_material BOOLEAN DEFAULT FALSE,
    temperature_range VARCHAR(20),

    -- Visual coding
    default_barcode_prefix VARCHAR(10),
    default_color_code VARCHAR(10),
    label_position VARCHAR(20),

    -- Cost and financial information
    average_cost DECIMAL(12,2),
    expected_lifespan_months INTEGER,
    depreciation_rate DECIMAL(5,2),

    -- Additional information
    custom_fields JSONB,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36)
);

-- =========================================
-- Create bins table
-- =========================================
CREATE TABLE warehouse.bins (
    bin_id VARCHAR(20) PRIMARY KEY,
    bin_barcode VARCHAR(50) UNIQUE,
    qr_code VARCHAR(50),
    rfid_tag VARCHAR(50),
    bin_name VARCHAR(100),
    bin_category VARCHAR(20),
    bin_status VARCHAR(20) DEFAULT 'available' CHECK (bin_status IN ('available', 'occupied', 'disabled', 'maintenance', 'missing')),
    current_location_id VARCHAR(35),
    bin_type VARCHAR(20),

    -- Physical specifications
    length DECIMAL(6,2),
    width DECIMAL(6,2),
    height DECIMAL(6,2),
    volume DECIMAL(10,2),
    tare_weight DECIMAL(10,2),
    max_weight DECIMAL(10,2),
    max_volume DECIMAL(10,2),

    -- Optimization fields
    optimal_fill_percentage DECIMAL(5,2),
    current_fill_percentage DECIMAL(5,2),

    -- Manufacturing information
    manufacturer VARCHAR(100),
    manufacturing_date DATE,
    material VARCHAR(50),
    serial_number VARCHAR(50),

    -- Safety information
    is_hazardous BOOLEAN DEFAULT FALSE,
    requires_cleaning BOOLEAN DEFAULT FALSE,
    last_cleaned_date DATE,

    -- Tracking information
    is_active BOOLEAN DEFAULT TRUE,
    owned_by VARCHAR(50),
    purchase_date DATE,
    purchase_price DECIMAL(12,2),
    expected_lifespan_months INTEGER,

    -- Additional information
    custom_fields JSONB,
    notes TEXT,

    -- Timestamps
    last_inventory_check TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign keys
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Foreign key constraints
    CONSTRAINT fk_bins_location FOREIGN KEY (current_location_id) REFERENCES warehouse.locations(location_id),
    CONSTRAINT fk_bins_type FOREIGN KEY (bin_type) REFERENCES warehouse.bin_types(type_id)
);

-- =========================================
-- Create bin_movements table
-- =========================================
CREATE TABLE warehouse.bin_movements (
    movement_id BIGSERIAL PRIMARY KEY,
    bin_id VARCHAR(20) NOT NULL,

    -- Location source and destination information
    from_location_id VARCHAR(35),
    from_location_type VARCHAR(20),
    to_location_id VARCHAR(35) NOT NULL,
    to_location_type VARCHAR(20),

    -- Movement details
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('transfer', 'picking', 'putaway', 'inventory', 'cleaning', 'maintenance')),
    movement_reason VARCHAR(100),
    movement_method VARCHAR(20),

    -- Personnel responsible for movement
    moved_by VARCHAR(36),
    team_id VARCHAR(20),

    -- Session/operation information
    session_id VARCHAR(50),
    work_order_id VARCHAR(50),
    reference_doc VARCHAR(50),

    -- Movement data
    distance_moved DECIMAL(10,2),
    movement_duration_seconds INTEGER,

    -- Movement status
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'failed')),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_method VARCHAR(20),
    approved_by VARCHAR(36),

    -- Additional information
    equipment_used VARCHAR(50),
    temperature_at_move DECIMAL(5,2),
    notes TEXT,
    custom_fields JSONB,
    movement_priority INTEGER,

    -- Timestamps
    scheduled_time TIMESTAMP,
    movement_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_time TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign keys
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Foreign key constraints
    CONSTRAINT fk_bin_movements_bin FOREIGN KEY (bin_id) REFERENCES warehouse.bins(bin_id),
    CONSTRAINT fk_bin_movements_from_location FOREIGN KEY (from_location_id) REFERENCES warehouse.locations(location_id),
    CONSTRAINT fk_bin_movements_to_location FOREIGN KEY (to_location_id) REFERENCES warehouse.locations(location_id)
);

-- =========================================
-- Create bin_contents table
-- =========================================
CREATE TABLE warehouse.bin_contents (
    content_id BIGSERIAL PRIMARY KEY,
    bin_id VARCHAR(20) NOT NULL,
    product_id VARCHAR(20) NOT NULL,
    batch_number VARCHAR(50),
    serial_number VARCHAR(50),

    -- Quantity information
    quantity DECIMAL(10,2) NOT NULL,
    uom VARCHAR(10) NOT NULL,
    min_quantity DECIMAL(10,2),
    max_quantity DECIMAL(10,2),

    -- Storage information
    storage_condition VARCHAR(20),
    putaway_date TIMESTAMP,
    last_accessed TIMESTAMP,
    expiration_date DATE,

    -- Quality information
    quality_status VARCHAR(20) DEFAULT 'good' CHECK (quality_status IN ('good', 'damaged', 'expired', 'quarantine')),
    inspection_required BOOLEAN DEFAULT FALSE,
    last_inspection_date TIMESTAMP,
    inspection_due_date DATE,

    -- Tracking information
    source_document VARCHAR(50),
    source_reference VARCHAR(50),
    is_locked BOOLEAN DEFAULT FALSE,
    lock_reason TEXT,

    -- Analysis fields
    turnover_rate DECIMAL(10,2),
    days_in_stock INTEGER,

    -- Additional information
    custom_fields JSONB,
    notes TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Foreign keys
    created_by VARCHAR(36),
    updated_by VARCHAR(36),
    deleted_by VARCHAR(36),

    -- Constraints
    CONSTRAINT positive_quantity CHECK (quantity >= 0),
    UNIQUE(bin_id, product_id, batch_number, serial_number),

    -- Foreign key constraints
    CONSTRAINT fk_bin_contents_bin FOREIGN KEY (bin_id) REFERENCES warehouse.bins(bin_id)
);

-- =========================================
-- Create indexes for better performance
-- =========================================

-- Bin types indexes
CREATE INDEX idx_bin_types_active ON warehouse.bin_types(is_active, deleted_at);
CREATE INDEX idx_bin_types_code ON warehouse.bin_types(type_code);

-- Bins indexes
CREATE INDEX idx_bins_status_location ON warehouse.bins(bin_status, current_location_id);
CREATE INDEX idx_bins_type ON warehouse.bins(bin_type, is_active);
CREATE INDEX idx_bins_barcode ON warehouse.bins(bin_barcode) WHERE bin_barcode IS NOT NULL;
CREATE INDEX idx_bins_category ON warehouse.bins(bin_category, bin_status);

-- Bin movements indexes
CREATE INDEX idx_bin_movements_bin_time ON warehouse.bin_movements(bin_id, movement_time);
CREATE INDEX idx_bin_movements_type_status ON warehouse.bin_movements(movement_type, status);
CREATE INDEX idx_bin_movements_locations ON warehouse.bin_movements(from_location_id, to_location_id);
CREATE INDEX idx_bin_movements_work_order ON warehouse.bin_movements(work_order_id) WHERE work_order_id IS NOT NULL;

-- Bin contents indexes
CREATE INDEX idx_bin_contents_bin_product ON warehouse.bin_contents(bin_id, product_id);
CREATE INDEX idx_bin_contents_expiry ON warehouse.bin_contents(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_bin_contents_quality ON warehouse.bin_contents(quality_status);
CREATE INDEX idx_bin_contents_batch ON warehouse.bin_contents(batch_number) WHERE batch_number IS NOT NULL;

-- =========================================
-- Create triggers for automatic updates
-- =========================================

-- Function to update bin fill percentage
CREATE OR REPLACE FUNCTION warehouse.update_bin_fill_percentage()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the current fill percentage based on contents
    UPDATE warehouse.bins
    SET current_fill_percentage = (
        SELECT COALESCE(SUM(quantity * 100.0 / bins.max_volume), 0)
        FROM warehouse.bin_contents
        JOIN warehouse.bins ON bin_contents.bin_id = bins.bin_id
        WHERE bin_contents.bin_id = COALESCE(NEW.bin_id, OLD.bin_id)
        AND bin_contents.deleted_at IS NULL
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE bin_id = COALESCE(NEW.bin_id, OLD.bin_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update bin fill percentage on content changes
CREATE TRIGGER trigger_update_bin_fill_percentage
    AFTER INSERT OR UPDATE OR DELETE ON warehouse.bin_contents
    FOR EACH ROW
    EXECUTE FUNCTION warehouse.update_bin_fill_percentage();

-- Function to update bin status based on contents
CREATE OR REPLACE FUNCTION warehouse.update_bin_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update bin status based on whether it has contents
    UPDATE warehouse.bins
    SET bin_status = CASE
        WHEN EXISTS (
            SELECT 1 FROM warehouse.bin_contents
            WHERE bin_id = COALESCE(NEW.bin_id, OLD.bin_id)
            AND deleted_at IS NULL
        ) THEN 'occupied'
        ELSE 'available'
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE bin_id = COALESCE(NEW.bin_id, OLD.bin_id)
    AND bin_status IN ('available', 'occupied'); -- Don't override maintenance/disabled status

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update bin status on content changes
CREATE TRIGGER trigger_update_bin_status
    AFTER INSERT OR UPDATE OR DELETE ON warehouse.bin_contents
    FOR EACH ROW
    EXECUTE FUNCTION warehouse.update_bin_status();

-- =========================================
-- Add comments to tables
-- =========================================
COMMENT ON TABLE warehouse.bin_types IS 'Standard specifications for different types of containers/bins used in the warehouse';
COMMENT ON TABLE warehouse.bins IS 'Individual movable containers/bins with their current status and location';
COMMENT ON TABLE warehouse.bin_movements IS 'Detailed movement history of bins between locations';
COMMENT ON TABLE warehouse.bin_contents IS 'Products stored within bins with quantities and conditions';