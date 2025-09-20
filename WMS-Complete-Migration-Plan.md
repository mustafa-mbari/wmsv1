# WMS Complete File Migration Plan - All Folders & Files

## 📊 Complete Backend Inventory Analysis

### 🗂️ Full Backend Structure (Previously Missed)
```
backend/                           # Total: 150+ files
├── .env                          # Environment variables
├── api-docs.json                 # Generated API documentation
├── create_tables.sql             # Database creation script
├── fix_permissions.sql           # Permission fix script
├── nodemon.json                  # Nodemon configuration
├── package.json                  # Dependencies and scripts
├── recreate_database.sql         # Database recreation script
├── tsconfig.json                 # TypeScript configuration
├── dist/                         # Compiled JavaScript (auto-generated)
├── logs/                         # Application logs
│   ├── app.log
│   ├── app1.log
│   ├── debug.log
│   ├── debug1.log
│   ├── error.log
│   ├── exceptions.log
│   └── rejections.log
├── node_modules/                 # Dependencies (ignore)
├── prisma/                       # Database & Seeding (73 files!)
│   ├── migrations/               # Database migrations (5 files)
│   │   ├── 0001_add_profile_fields.sql
│   │   ├── 0002_create_warehouse_schema.sql
│   │   ├── 0003_create_inventory_tables.sql
│   │   ├── 0004_create_bin_management_tables.sql
│   │   └── 0005_add_location_coding_system.sql
│   ├── schema.prisma             # Main database schema
│   ├── schema_backup.prisma      # Schema backup
│   ├── seedsREADME.md           # Seeding documentation
│   ├── tablesFromDB.md          # Database documentation
│   └── seeds/                    # Comprehensive seeding system (65 files)
│       ├── package.json
│       ├── package-lock.json
│       ├── seed.ts              # Main seed runner
│       ├── SEEDING_GUIDE.md     # Seeding guide
│       ├── tsconfig.json        # Seed TypeScript config
│       ├── classes/             # Seed classes (39 files)
│       │   ├── BaseSeed.ts      # Base seeder class
│       │   ├── inventory/       # Inventory seeders (5 files)
│       │   │   ├── InventoryCountDetailsSeeder.ts
│       │   │   ├── InventoryCountsSeeder.ts
│       │   │   ├── InventoryMovementsSeeder.ts
│       │   │   ├── InventoryReservationsSeeder.ts
│       │   │   └── InventorySeeder.ts
│       │   ├── product/         # Product seeders (6 files)
│       │   │   ├── BrandSeeder.ts
│       │   │   ├── ProductAttributeOptionSeeder.ts
│       │   │   ├── ProductAttributeSeeder.ts
│       │   │   ├── ProductAttributeValueSeeder.ts
│       │   │   ├── ProductCategorySeeder.ts
│       │   │   ├── ProductFamilySeeder.ts
│       │   │   └── ProductSeeder.ts
│       │   ├── public/          # Public schema seeders (10 files)
│       │   │   ├── ClassTypeSeeder.ts
│       │   │   ├── NotificationsSeeder.ts
│       │   │   ├── PermissionSeeder.ts
│       │   │   ├── RolePermissionSeeder.ts
│       │   │   ├── RoleSeeder.ts
│       │   │   ├── SystemLogsSeeder.ts
│       │   │   ├── SystemSettingsSeeder.ts
│       │   │   ├── UnitsOfMeasureSeeder.ts
│       │   │   ├── UserRoleSeeder.ts
│       │   │   └── UserSeeder.ts
│       │   └── warehouse/       # Warehouse seeders (10 files)
│       │       ├── AisleSeeder.ts
│       │       ├── BinContentsSeeder.ts
│       │       ├── BinMovementsSeeder.ts
│       │       ├── BinsSeeder.ts
│       │       ├── BinTypeSeeder.ts
│       │       ├── LevelsSeeder.ts
│       │       ├── LocationSeeder.ts
│       │       ├── RacksSeeder.ts
│       │       ├── WarehouseSeeder.ts
│       │       └── ZoneSeeder.ts
│       ├── data/                # Seed data JSON files (22 files)
│       │   ├── inventory/       # Inventory data (5 files)
│       │   │   ├── inventory.json
│       │   │   ├── inventory-count-details.json
│       │   │   ├── inventory-counts.json
│       │   │   ├── inventory-movements.json
│       │   │   └── inventory-reservations.json
│       │   ├── product/         # Product data (7 files)
│       │   │   ├── brands.json
│       │   │   ├── product_attribute_options.json
│       │   │   ├── product_attribute_values.json
│       │   │   ├── product_attributes.json
│       │   │   ├── product-categories.json
│       │   │   ├── product-families.json
│       │   │   └── products.json
│       │   ├── public/          # Public schema data (10 files)
│       │   │   ├── class-types.json
│       │   │   ├── notifications.json
│       │   │   ├── permissions.json
│       │   │   ├── role-permissions.json
│       │   │   ├── roles.json
│       │   │   ├── system-logs.json
│       │   │   ├── system-settings.json
│       │   │   ├── units-of-measure.json
│       │   │   ├── user-roles.json
│       │   │   └── users.json
│       │   └── warehouse/       # Warehouse data (10 files)
│       │       ├── aisles.json
│       │       ├── bin-contents.json
│       │       ├── bin-movements.json
│       │       ├── bins.json
│       │       ├── bin-types.json
│       │       ├── levels.json
│       │       ├── locations.json
│       │       ├── racks.json
│       │       ├── warehouses.json
│       │       └── zones.json
│       └── utils/               # Seed utilities (3 files)
│           ├── JsonReader.ts
│           ├── SeedRunner.ts
│           └── SeedValidator.ts
├── scripts/                      # Build/validation scripts
│   └── validate-schema.ts        # Schema validation script
├── shared/                       # Empty shared folder
├── src/                          # Source code (45 files)
│   └── [Previously analyzed]
└── uploads/                      # File uploads
    ├── avatars/                  # User avatars
    └── profile-pictures/         # Profile pictures
```

## 🎯 Complete Migration Mapping - All Missing Files

### 1. Database & Prisma Migration

#### 1.1 Prisma Schema & Migrations
```bash
# Source → Target
backend/prisma/schema.prisma → backend/src/infrastructure/persistence/prisma/schema.prisma
backend/prisma/schema_backup.prisma → backend/src/infrastructure/persistence/prisma/schema_backup.prisma
backend/prisma/seedsREADME.md → backend/src/infrastructure/persistence/seeds/README.md
backend/prisma/tablesFromDB.md → backend/docs/database/tables.md

# Database Migrations
backend/prisma/migrations/ → backend/src/infrastructure/persistence/prisma/migrations/
├── 0001_add_profile_fields.sql → migrations/0001_add_profile_fields.sql
├── 0002_create_warehouse_schema.sql → migrations/0002_create_warehouse_schema.sql
├── 0003_create_inventory_tables.sql → migrations/0003_create_inventory_tables.sql
├── 0004_create_bin_management_tables.sql → migrations/0004_create_bin_management_tables.sql
└── 0005_add_location_coding_system.sql → migrations/0005_add_location_coding_system.sql
```

**Issues:**
- ⚠️ **Prisma Config**: Need to update schema.prisma file paths
- ⚠️ **Migration Path**: Prisma CLI expects migrations in specific location
- ⚠️ **Database Connection**: Current schema has hardcoded paths

#### 1.2 Seeding System Migration (65 files!)
```bash
# Seed Infrastructure
backend/prisma/seeds/seed.ts → backend/src/infrastructure/persistence/seeds/seed.ts
backend/prisma/seeds/package.json → backend/src/infrastructure/persistence/seeds/package.json
backend/prisma/seeds/SEEDING_GUIDE.md → backend/docs/seeding/SEEDING_GUIDE.md
backend/prisma/seeds/tsconfig.json → backend/src/infrastructure/persistence/seeds/tsconfig.json

# Base Seeder
backend/prisma/seeds/classes/BaseSeed.ts → backend/src/infrastructure/persistence/seeds/base/BaseSeed.ts

# Seed Utilities
backend/prisma/seeds/utils/JsonReader.ts → backend/src/infrastructure/persistence/seeds/utils/JsonReader.ts
backend/prisma/seeds/utils/SeedRunner.ts → backend/src/infrastructure/persistence/seeds/utils/SeedRunner.ts
backend/prisma/seeds/utils/SeedValidator.ts → backend/src/infrastructure/persistence/seeds/utils/SeedValidator.ts

# Domain-based Seed Classes
backend/prisma/seeds/classes/public/ → backend/src/infrastructure/persistence/seeds/user/
├── UserSeeder.ts → UserSeeder.ts
├── RoleSeeder.ts → RoleSeeder.ts
├── PermissionSeeder.ts → PermissionSeeder.ts
├── UserRoleSeeder.ts → UserRoleSeeder.ts
├── RolePermissionSeeder.ts → RolePermissionSeeder.ts
├── NotificationsSeeder.ts → backend/src/infrastructure/persistence/seeds/notification/NotificationSeeder.ts
├── SystemLogsSeeder.ts → backend/src/infrastructure/persistence/seeds/system/SystemLogSeeder.ts
├── SystemSettingsSeeder.ts → backend/src/infrastructure/persistence/seeds/system/SystemSettingSeeder.ts
├── UnitsOfMeasureSeeder.ts → backend/src/infrastructure/persistence/seeds/system/UnitOfMeasureSeeder.ts
└── ClassTypeSeeder.ts → backend/src/infrastructure/persistence/seeds/system/ClassTypeSeeder.ts

backend/prisma/seeds/classes/product/ → backend/src/infrastructure/persistence/seeds/product/
├── ProductSeeder.ts → ProductSeeder.ts
├── ProductCategorySeeder.ts → CategorySeeder.ts
├── BrandSeeder.ts → BrandSeeder.ts
├── ProductFamilySeeder.ts → FamilySeeder.ts
├── ProductAttributeSeeder.ts → AttributeSeeder.ts
├── ProductAttributeOptionSeeder.ts → AttributeOptionSeeder.ts
└── ProductAttributeValueSeeder.ts → AttributeValueSeeder.ts

backend/prisma/seeds/classes/inventory/ → backend/src/infrastructure/persistence/seeds/inventory/
├── InventorySeeder.ts → InventorySeeder.ts
├── InventoryMovementsSeeder.ts → MovementSeeder.ts
├── InventoryCountsSeeder.ts → CountSeeder.ts
├── InventoryCountDetailsSeeder.ts → CountDetailSeeder.ts
└── InventoryReservationsSeeder.ts → ReservationSeeder.ts

backend/prisma/seeds/classes/warehouse/ → backend/src/infrastructure/persistence/seeds/warehouse/
├── WarehouseSeeder.ts → WarehouseSeeder.ts
├── ZoneSeeder.ts → ZoneSeeder.ts
├── AisleSeeder.ts → AisleSeeder.ts
├── RacksSeeder.ts → RackSeeder.ts
├── LevelsSeeder.ts → LevelSeeder.ts
├── LocationSeeder.ts → LocationSeeder.ts
├── BinsSeeder.ts → BinSeeder.ts
├── BinTypeSeeder.ts → BinTypeSeeder.ts
├── BinContentsSeeder.ts → BinContentSeeder.ts
└── BinMovementsSeeder.ts → BinMovementSeeder.ts

# Seed Data Files (22 JSON files)
backend/prisma/seeds/data/ → backend/src/infrastructure/persistence/seeds/data/
├── public/ → user/ + system/ + notification/
├── product/ → product/
├── inventory/ → inventory/
└── warehouse/ → warehouse/
```

**Major Issues:**
- ⚠️ **Massive Refactoring**: 65 seed files need path updates
- ⚠️ **Import Changes**: All seeders import from relative paths
- ⚠️ **JSON Data Paths**: Data file references will break
- ⚠️ **Seed Runner**: Main seed.ts orchestrates all seeders
- ⚠️ **NPM Scripts**: Package.json has seeding scripts that reference old paths

**Example Current Seeder Structure:**
```typescript
// Current: backend/prisma/seeds/classes/public/UserSeeder.ts
import { BaseSeed } from '../BaseSeed';
import { JsonReader } from '../../utils/JsonReader';

export class UserSeeder extends BaseSeed {
    async seed() {
        const users = await JsonReader.read('../../data/public/users.json');
        // Seeding logic...
    }
}
```

**Target Structure:**
```typescript
// NEW: backend/src/infrastructure/persistence/seeds/user/UserSeeder.ts
import { BaseSeed } from '../base/BaseSeed';
import { JsonReader } from '../utils/JsonReader';

@Injectable()
export class UserSeeder extends BaseSeed {
    constructor(@Inject('PrismaClient') private prisma: PrismaClient) {
        super();
    }

    async seed() {
        const users = await JsonReader.read('../../data/user/users.json');
        // Refactored seeding logic with DI...
    }
}
```

### 2. Configuration & Scripts Migration

#### 2.1 Configuration Files
```bash
# Root Configuration Files
backend/package.json → backend/package.json (Update scripts & paths)
backend/tsconfig.json → backend/tsconfig.json (Update paths & includes)
backend/nodemon.json → backend/nodemon.json (Update watch paths)
backend/.env → backend/.env (No change needed)

# Generated/Documentation Files
backend/api-docs.json → backend/src/infrastructure/api/documentation/api-docs.json
```

**Issues:**
- ⚠️ **Package.json Scripts**: NPM scripts reference old paths
- ⚠️ **TypeScript Paths**: tsconfig.json has path mappings that will break
- ⚠️ **Nodemon Config**: Watches old source paths

**Required Changes in package.json:**
```json
// OLD scripts
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "seed": "ts-node prisma/seeds/seed.ts",
    "seed:reset": "npx prisma migrate reset --force && npm run seed"
  }
}

// NEW scripts
{
  "scripts": {
    "dev": "nodemon src/host/Server.ts",
    "seed": "ts-node src/infrastructure/persistence/seeds/seed.ts",
    "seed:reset": "npx prisma migrate reset --force && npm run seed"
  }
}
```

#### 2.2 Database Scripts
```bash
# SQL Scripts
backend/create_tables.sql → backend/scripts/database/create_tables.sql
backend/fix_permissions.sql → backend/scripts/database/fix_permissions.sql
backend/recreate_database.sql → backend/scripts/database/recreate_database.sql

# Validation Scripts
backend/scripts/validate-schema.ts → backend/scripts/validation/validate-schema.ts
```

#### 2.3 Build & Generated Files
```bash
# Generated files (will be regenerated)
backend/dist/ → DELETE (will be regenerated in new structure)
backend/api-docs.json → REGENERATE (Swagger will create in new location)

# Log Files (runtime generated)
backend/logs/ → backend/logs/ (No change, but update logger config)
├── app.log → Keep existing
├── debug.log → Keep existing
├── error.log → Keep existing
├── exceptions.log → Keep existing
└── rejections.log → Keep existing
```

#### 2.4 Upload Directories
```bash
# Upload Folders (user content)
backend/uploads/ → backend/uploads/ (No change needed)
├── avatars/ → Keep existing files
└── profile-pictures/ → Keep existing files
```

### 3. Shared Folder (Currently Empty)
```bash
# Currently empty - will be populated with new shared components
backend/shared/ → DELETE (empty)
# Will be replaced by root-level shared/ directory
```

## ⚠️ Critical Migration Issues - Previously Missed

### 1. Seeding System Breakdown (HIGH IMPACT)
**Issue**: 65 seed files with complex interdependencies
**Problems**:
- Relative import paths throughout
- JSON data file references
- Seed execution order dependencies
- NPM scripts for seeding
- BaseSeed class inheritance

**Example Breaking Changes:**
```typescript
// Current imports that will break
import { BaseSeed } from '../BaseSeed';
import { JsonReader } from '../../utils/JsonReader';
const data = await JsonReader.read('../../data/public/users.json');

// Database seeding commands that will break
npm run seed:users
npm run seed:warehouses
npm run seed:full
```

### 2. Prisma Configuration (HIGH IMPACT)
**Issue**: Schema location and migration paths hardcoded
**Problems**:
- `schema.prisma` location referenced in package.json
- Migration directory expected by Prisma CLI
- Generated Prisma client import paths

**Required Changes:**
```typescript
// package.json prisma config
{
  "prisma": {
    "schema": "src/infrastructure/persistence/prisma/schema.prisma"
  }
}

// All imports of Prisma client
import { PrismaClient } from '@prisma/client'; // Will need path updates
```

### 3. Build Process (MEDIUM IMPACT)
**Issue**: TypeScript compilation and build scripts
**Problems**:
- `tsconfig.json` paths and includes
- `nodemon.json` watch patterns
- Build output directory structure
- NPM scripts referencing old paths

### 4. Logging Configuration (MEDIUM IMPACT)
**Issue**: Logger configuration and log file paths
**Problems**:
- Log files in `/logs` directory
- Logger configuration hardcoded paths
- Multiple log types (app, debug, error, exceptions, rejections)

**Current Logger Issues:**
```typescript
// Logger config with hardcoded paths
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app.log' })
  ]
});
```

### 5. Database Migration Scripts (LOW IMPACT)
**Issue**: SQL scripts for database setup
**Problems**:
- Manual SQL scripts for database creation
- Permission fix scripts
- Database recreation scripts

## 🛠️ Updated Migration Strategy

### Updated Effort Estimation

| Component | Files | Hours | Risk Level |
|-----------|-------|-------|------------|
| **Source Code (src/)** | 45 | 200 | HIGH |
| **Seeding System** | 65 | 80 | HIGH |
| **Prisma & DB** | 10 | 40 | HIGH |
| **Configuration** | 8 | 20 | MEDIUM |
| **Scripts & Tools** | 5 | 15 | MEDIUM |
| **Documentation** | 3 | 10 | LOW |
| **Frontend** | 132 | 105 | MEDIUM |
| **Integration & Testing** | - | 50 | HIGH |
| **TOTAL** | **268 files** | **520 hours** | - |

### Revised Timeline (14 weeks)

#### Phase 1: Infrastructure Preparation (Weeks 1-2)
- Set up new directory structure
- Implement DI container and base classes
- Create migration scripts for automated file movement
- Update configuration files (package.json, tsconfig.json)

#### Phase 2: Database & Seeding (Weeks 3-4)
- Migrate Prisma schema and migrations
- Refactor entire seeding system (65 files!)
- Update all seed data references
- Test database setup and seeding

#### Phase 3: Domain Migration (Weeks 5-8)
- Week 5: User domain + related seeders
- Week 6: Product domain + related seeders
- Week 7: Inventory domain + related seeders
- Week 8: Warehouse domain + related seeders

#### Phase 4: Frontend & API (Weeks 9-11)
- Migrate frontend components and services
- Update API documentation and endpoints
- Refactor authentication and middleware

#### Phase 5: Integration & Deployment (Weeks 12-14)
- End-to-end testing
- Performance optimization
- Documentation updates
- Deployment configuration

## 📋 Pre-Migration Checklist

### Before Starting Migration:
1. ✅ **Backup Database**: Full database backup with test data
2. ✅ **Create Migration Branch**: Separate Git branch for refactoring
3. ✅ **Document Current State**: API endpoint inventory
4. ✅ **Test Coverage**: Ensure existing functionality works
5. ✅ **Team Alignment**: All team members understand new structure
6. ✅ **Environment Setup**: Development environment for new structure

### Migration Tools Needed:
1. **Automated File Movement Scripts**: For bulk file operations
2. **Import Path Replacement**: Regex-based search and replace
3. **Prisma Schema Validator**: Ensure schema integrity
4. **Seed Data Validator**: Verify JSON data integrity
5. **API Testing Suite**: Verify endpoints after migration

## 🎯 Success Criteria - Updated

1. ✅ **All 500+ API endpoints** work without breaking changes
2. ✅ **Complete seeding system** functions with new structure
3. ✅ **Database migrations** work with new Prisma location
4. ✅ **Build process** compiles successfully
5. ✅ **All NPM scripts** execute correctly
6. ✅ **File uploads** continue working
7. ✅ **Logging system** works with new configuration
8. ✅ **Development workflow** (nodemon, TypeScript) functions
9. ✅ **Testing infrastructure** works with new structure
10. ✅ **Documentation** updated and accurate

---

**Total Migration Scope**: 268 files, 520 hours, 14 weeks
**Risk Level**: HIGH (due to seeding system complexity and Prisma dependencies)
**Recommendation**: Proceed in small, testable increments with comprehensive backup strategy