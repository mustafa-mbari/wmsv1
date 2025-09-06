# WMS Database Seeds

This directory contains seed files to populate your WMS database with sample data for development and testing purposes.

## Overview

The seed files create sample data for all tables in the WMS database:

- **Class Types** (8 entries) - Product classification types
- **Permissions** (8 entries) - System permissions for role-based access
- **Roles** (8 entries) - User roles with different access levels
- **Users** (6 entries) - Sample users with different roles
- **Units of Measure** (8 entries) - Measurement units for products
- **Product Categories** (8 entries) - Product categories with hierarchy
- **Product Families** (8 entries) - Product family groupings
- **Product Attributes** (8 entries) - Configurable product attributes
- **Product Attribute Options** - Options for select-type attributes
- **Products** (6 entries) - Sample products with full details
- **Product Attribute Values** - Links products to their attribute values
- **Warehouses** (8 entries) - Sample warehouse locations
- **User Roles** - Assigns roles to users
- **Role Permissions** - Assigns permissions to roles
- **Notifications** (8 entries) - Sample system notifications
- **System Settings** (8 entries) - Application configuration settings
- **System Logs** (8 entries) - Sample system activity logs

## Default Users

The seeds create the following users (all with password: `Password123!`):

1. **admin** (admin@wms.com) - Super Admin
2. **jsmith** (john.smith@wms.com) - Manager + Warehouse Staff
3. **mjohnson** (mary.johnson@wms.com) - Warehouse Staff + Inventory Clerk
4. **rdavis** (robert.davis@wms.com) - Sales Representative
5. **slee** (sarah.lee@wms.com) - Inventory Clerk
6. **kwilson** (kevin.wilson@wms.com) - Viewer

## How to Run

### From the backend directory:

```bash
# Make sure you have generated the Prisma client
npx prisma generate

# Run the seeds
cd backend/prisma/seeds
npm install
npm run seed
```

### Alternative - Add to main package.json:

Add this to your backend `package.json` scripts:

```json
{
  "scripts": {
    "seed": "npx tsx prisma/seeds/seed.ts"
  }
}
```

Then run:
```bash
npm run seed
```

## Prerequisites

1. Database should be running and accessible
2. Prisma schema should be synced with database (`npx prisma db push` or migrations applied)
3. Prisma client should be generated (`npx prisma generate`)

## Important Notes

- **Upsert Strategy**: All seeds use `upsert` operations where possible to avoid duplicates
- **Dependencies**: Seeds are run in dependency order (users before user_roles, etc.)
- **Data Relationships**: Foreign key relationships are properly maintained
- **Sample Data**: All data is fictional and suitable for development/testing only

## Customization

You can modify individual seed files to:
- Add more sample data
- Change default values
- Adjust relationships
- Add new fields

Each seed file is independent and exports a single function that takes a Prisma client instance.

## Troubleshooting

If you encounter errors:

1. Ensure database is running and accessible
2. Check that all migrations are applied
3. Verify Prisma client is generated and up to date
4. Check for any constraint violations in the console output

The seed script will show progress for each table and display any errors encountered.
