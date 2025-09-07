# WMS Database Seeding Guide

This guide explains how to use the WMS database seeding system to populate your database with initial data.

## Quick Start

### Run All Seeds
```bash
cd backend
npm run seed
```

### Run Specific Seeds Only
```bash
cd backend
npm run seed -- --only users,roles,permissions
```

## Available Commands

### Basic Commands
```bash
# Run all seeders
npm run seed

# Force re-seed (overwrite existing data)
npm run seed -- --force

# Continue running even if some seeders fail
npm run seed -- --continue-on-error

# Preview what would be seeded without executing
npm run seed -- --dry-run

# Skip data validation before seeding
npm run seed -- --skip-validation
```

### Selective Seeding
```bash
# Run only specific seeders
npm run seed -- --only permissions,roles,users

# Skip specific seeders
npm run seed -- --skip products

# Run with custom system user ID for audit fields
npm run seed -- --user-id 1
```

### Combined Options
```bash
# Force re-seed and continue on errors
npm run seed -- --force --continue-on-error

# Run only basic data with force
npm run seed -- --only permissions,roles,users --force
```

## Available Seeders

The seeding system includes the following seeders in dependency order:

### 1. Core System Data
- **permissions** - System permissions (13 records)
- **class_types** - Classification types (7 records)  
- **units_of_measure** - Units of measurement (10 records)

### 2. User Management
- **roles** - User roles with permissions (6 records)
- **users** - System users (6 records: mustafa, admin, manager1, supervisor1, employee1, viewer1)

### 3. Product Catalog
- **product_categories** - Product categories (4 records)
- **product_families** - Product families (4 records, depends on categories)
- **products** - Products and inventory (depends on categories, families, units)

### 4. Warehouse Management
- **warehouses** - Warehouse locations (depends on users for managers)

## Execution Order

The system automatically determines the correct execution order based on dependencies:

```
permissions → roles → users
     ↓
class_types, units_of_measure (parallel)
     ↓
product_categories → product_families → products
     ↓
warehouses
```

## Data Sources

### JSON Data Files
Most seeders read from JSON files in `prisma/seeds/data/`:
- `permissions.json`
- `roles.json` 
- `users.json`
- `class-types.json`
- `units-of-measure.json`
- `warehouses.json`

### Product Data
Product-related seeders use `products.json` with sections:
- `categories[]` - for product categories
- `families[]` - for product families
- `products[]` - for actual products

## Usage Examples

### Initial Setup
```bash
# First time setup - seed everything
cd backend
npm run seed
```

### Development Reset
```bash
# Reset and re-seed all data
npm run seed -- --force
```

### Add New Users Only
```bash
# Add users without affecting other data
npm run seed -- --only users --force
```

### Safe Partial Update
```bash
# Update specific data and continue if some fail
npm run seed -- --only permissions,roles --continue-on-error
```

## Troubleshooting

### Common Issues

**Foreign Key Constraints:**
- Ensure dependencies are seeded first
- Check that referenced records exist

**Validation Errors:**
- Verify JSON data files have all required fields
- Check data types match schema requirements

**Permission Errors:**
- Ensure database connection is working
- Check user has proper database permissions

### Debug Mode
```bash
# See detailed output of what would be seeded
npm run seed -- --dry-run

# Continue even if errors occur to see all issues
npm run seed -- --continue-on-error
```

### Reset Database
If you need to completely reset:
```bash
# Reset database and re-run migrations
npx prisma migrate reset

# Then seed data
npm run seed
```

## Current Status

✅ **Working Seeders (8/9):**
- permissions, class_types, units_of_measure
- roles, users
- product_categories, product_families  
- warehouses

⚠️ **Known Issues:**
- Products seeder has validation issues (field structure mismatch)

## Getting Help

```bash
# Show all available options
npm run seed -- --help

# View seeder status
npm run seed -- --dry-run
```

For technical issues, check the seeding logs or contact the development team.