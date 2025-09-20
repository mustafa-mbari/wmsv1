# WMS File Migration Plan - Detailed Implementation

## 📊 Current State Analysis

### Backend Files Inventory (45 TypeScript files)
```
Current Structure:
backend/src/
├── app.ts                          # Main Express app
├── server.ts                       # Server startup
├── audit.setup.ts                  # Audit configuration
├── example.usage.ts                # Example/demo file
├── config/
│   └── swagger.ts                  # Swagger configuration
├── middleware/
│   ├── authMiddleware.ts           # Authentication middleware
│   └── requestLogger.ts            # Request logging middleware
├── routes/                         # 39 route files
│   ├── public/ (13 files)          # User management routes
│   ├── product/ (7 files)          # Product management routes
│   ├── inventory/ (4 files)        # Inventory management routes
│   └── warehouse/ (10 files)       # Warehouse management routes
└── utils/
    ├── logger/ (3 files)           # Logger utilities
    ├── prismaClient.ts             # Prisma client
    └── testPrisma.ts               # Prisma testing
```

### Frontend Files Inventory (132 TypeScript/React files)
```
Current Structure:
frontend/src/
├── app/                            # Next.js pages (25 files)
├── components/                     # React components (89 files)
├── hooks/                          # Custom hooks (6 files)
├── lib/                            # Utilities (3 files)
├── services/                       # API services (4 files)
├── types/                          # Type definitions (3 files)
└── styles/                         # CSS files (2 files)
```

## 🎯 Detailed Migration Mapping

### Phase 1: Backend Infrastructure Layer Migration

#### 1.1 Core Application Files
```bash
# Source → Target
backend/src/app.ts → backend/src/host/App.ts
backend/src/server.ts → backend/src/host/Server.ts
backend/src/audit.setup.ts → backend/src/infrastructure/persistence/audit/AuditSetup.ts
```

**Issues:**
- ⚠️ **Breaking Change**: Import paths will change in all dependent files
- ⚠️ **Configuration**: App.ts contains hardcoded routes that need to be modularized
- ⚠️ **Dependencies**: Server.ts imports from old paths

**Required Changes:**
```typescript
// OLD: backend/src/app.ts
import userRoutes from './routes/public/userRoutes';

// NEW: backend/src/host/App.ts
import userRoutes from '../infrastructure/api/routes/user.routes';
```

#### 1.2 Configuration Files
```bash
# Source → Target
backend/src/config/swagger.ts → backend/src/config/app.config.ts
                             → backend/src/infrastructure/api/documentation/swagger.config.ts
```

**Issues:**
- ⚠️ **Split Required**: Current swagger.ts needs to be split into configuration and documentation
- ⚠️ **Environment Handling**: Need to add environment-specific configurations

#### 1.3 Middleware Migration
```bash
# Source → Target
backend/src/middleware/authMiddleware.ts → backend/src/infrastructure/api/middleware/auth.middleware.ts
backend/src/middleware/requestLogger.ts → backend/src/infrastructure/api/middleware/logging.middleware.ts
```

**Issues:**
- ⚠️ **Import Changes**: All route files import these middlewares
- ⚠️ **Dependency Injection**: Need to refactor to use DI container
- ⚠️ **Authentication Strategy**: Current JWT handling needs to be abstracted

**Required Changes:**
```typescript
// OLD: Direct imports in route files
import { authenticateToken } from '../../middleware/authMiddleware';

// NEW: Dependency injection
@Injectable()
export class UserController {
  constructor(
    @Inject('AuthMiddleware') private authMiddleware: AuthMiddleware
  ) {}
}
```

#### 1.4 Utilities Migration
```bash
# Source → Target
backend/src/utils/logger/logger.ts → backend/src/utils/logger/Logger.ts
backend/src/utils/logger/examples.ts → DELETE (demo file)
backend/src/utils/logger/testLogger.ts → tests/unit/utils/logger.test.ts
backend/src/utils/prismaClient.ts → backend/src/infrastructure/persistence/prisma/PrismaClient.ts
backend/src/utils/testPrisma.ts → tests/integration/prisma.test.ts
```

**Issues:**
- ⚠️ **Global Dependencies**: Logger is imported in 39+ files
- ⚠️ **Singleton Pattern**: PrismaClient needs singleton implementation
- ⚠️ **Test Files**: Need to restructure test organization

### Phase 2: Route to Controller/Service Migration

#### 2.1 User Domain Migration (13 files)
```bash
# Public Schema Routes → User Domain
backend/src/routes/public/userRoutes.ts → SPLIT INTO:
├── backend/src/infrastructure/api/controllers/user/UserController.ts
├── backend/src/core/application/use-cases/user/CreateUser.usecase.ts
├── backend/src/core/application/use-cases/user/UpdateUser.usecase.ts
├── backend/src/core/application/use-cases/user/GetUsers.usecase.ts
├── backend/src/core/application/use-cases/user/DeleteUser.usecase.ts
├── backend/src/core/domain/services/user/UserService.ts
├── backend/src/core/domain/entities/user/User.entity.ts
└── backend/src/infrastructure/persistence/repositories/impl/user/UserRepository.impl.ts

backend/src/routes/public/authRoutes.ts → SPLIT INTO:
├── backend/src/infrastructure/api/controllers/user/AuthController.ts
├── backend/src/core/application/use-cases/user/AuthenticateUser.usecase.ts
├── backend/src/core/application/use-cases/user/RefreshToken.usecase.ts
└── backend/src/core/domain/services/user/AuthService.ts

backend/src/routes/public/roleRoutes.ts → SPLIT INTO:
├── backend/src/infrastructure/api/controllers/user/RoleController.ts
├── backend/src/core/application/use-cases/user/CreateRole.usecase.ts
├── backend/src/core/domain/entities/user/Role.entity.ts
└── backend/src/infrastructure/persistence/repositories/impl/user/RoleRepository.impl.ts

backend/src/routes/public/permissionRoutes.ts → SPLIT INTO:
├── backend/src/infrastructure/api/controllers/user/PermissionController.ts
├── backend/src/core/domain/entities/user/Permission.entity.ts
└── backend/src/infrastructure/persistence/repositories/impl/user/PermissionRepository.impl.ts

# Additional Public Routes
backend/src/routes/public/profileRoutes.ts → backend/src/infrastructure/api/controllers/user/ProfileController.ts
backend/src/routes/public/rolePermissionRoutes.ts → backend/src/infrastructure/api/controllers/user/RolePermissionController.ts
backend/src/routes/public/userRoleRoutes.ts → backend/src/infrastructure/api/controllers/user/UserRoleController.ts
backend/src/routes/public/notificationRoutes.ts → backend/src/infrastructure/api/controllers/notification/NotificationController.ts
backend/src/routes/public/systemLogRoutes.ts → backend/src/infrastructure/api/controllers/system/SystemLogController.ts
backend/src/routes/public/systemSettingRoutes.ts → backend/src/infrastructure/api/controllers/system/SystemSettingController.ts
backend/src/routes/public/unitRoutes.ts → backend/src/infrastructure/api/controllers/system/UnitController.ts
backend/src/routes/public/classTypeRoutes.ts → backend/src/infrastructure/api/controllers/system/ClassTypeController.ts
```

**Major Issues:**
- ⚠️ **Massive Refactoring**: Each route file contains 5-15 endpoints that need to be split
- ⚠️ **Business Logic Extraction**: Routes contain business logic that needs to move to services
- ⚠️ **Direct Prisma Usage**: Routes directly use PrismaClient, need repository abstraction
- ⚠️ **No Validation**: Need to add DTO validation
- ⚠️ **Error Handling**: Inconsistent error handling across routes

**Example Current Route Structure:**
```typescript
// Current: backend/src/routes/public/userRoutes.ts (200+ lines)
router.post('/', requireSuperAdmin, upload.single('avatar'), async (req: Request, res: Response) => {
  // Direct Prisma usage
  const prisma = new PrismaClient();

  // Business logic mixed with HTTP handling
  const hashedPassword = await bcrypt.hash(password, 10);

  // Direct database operations
  const user = await prisma.users.create({
    data: { ... }
  });
});
```

**Target Structure:**
```typescript
// NEW: backend/src/infrastructure/api/controllers/user/UserController.ts
@Controller('/api/users')
export class UserController {
  constructor(
    @Inject('CreateUserUseCase') private createUser: CreateUserUseCase
  ) {}

  @Post('/')
  @ValidateBody(CreateUserDto)
  @RequirePermission('user.create')
  async create(@Body() data: CreateUserDto): Promise<ApiResponse<UserResponseDto>> {
    const result = await this.createUser.execute(data);
    return this.success(result);
  }
}

// NEW: backend/src/core/application/use-cases/user/CreateUser.usecase.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('UserRepository') private userRepo: IUserRepository,
    @Inject('UserService') private userService: UserService
  ) {}

  async execute(data: CreateUserDto): Promise<Result<User>> {
    return await this.userService.createUser(data);
  }
}
```

#### 2.2 Product Domain Migration (7 files)
```bash
backend/src/routes/product/productRoutes.ts → SPLIT INTO:
├── backend/src/infrastructure/api/controllers/product/ProductController.ts
├── backend/src/core/application/use-cases/product/CreateProduct.usecase.ts
├── backend/src/core/application/use-cases/product/UpdateProduct.usecase.ts
├── backend/src/core/application/use-cases/product/GetProducts.usecase.ts
├── backend/src/core/domain/services/product/ProductService.ts
├── backend/src/core/domain/entities/product/Product.entity.ts
└── backend/src/infrastructure/persistence/repositories/impl/product/ProductRepository.impl.ts

backend/src/routes/product/categoryRoutes.ts → backend/src/infrastructure/api/controllers/product/CategoryController.ts
backend/src/routes/product/brandRoutes.ts → backend/src/infrastructure/api/controllers/product/BrandController.ts
backend/src/routes/product/familyRoutes.ts → backend/src/infrastructure/api/controllers/product/FamilyController.ts
backend/src/routes/product/attributeRoutes.ts → backend/src/infrastructure/api/controllers/product/AttributeController.ts
backend/src/routes/product/attributeOptionRoutes.ts → backend/src/infrastructure/api/controllers/product/AttributeOptionController.ts
backend/src/routes/product/attributeValueRoutes.ts → backend/src/infrastructure/api/controllers/product/AttributeValueController.ts
```

#### 2.3 Inventory Domain Migration (4 files)
```bash
backend/src/routes/inventory/inventoryRoutes.ts → backend/src/infrastructure/api/controllers/inventory/InventoryController.ts
backend/src/routes/inventory/inventoryMovementRoutes.ts → backend/src/infrastructure/api/controllers/inventory/MovementController.ts
backend/src/routes/inventory/inventoryCountRoutes.ts → backend/src/infrastructure/api/controllers/inventory/CountController.ts
backend/src/routes/inventory/inventoryReservationRoutes.ts → backend/src/infrastructure/api/controllers/inventory/ReservationController.ts
```

#### 2.4 Warehouse Domain Migration (10 files)
```bash
backend/src/routes/warehouse/warehouseRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/WarehouseController.ts
backend/src/routes/warehouse/zoneRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/ZoneController.ts
backend/src/routes/warehouse/aisleRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/AisleController.ts
backend/src/routes/warehouse/rackRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/RackController.ts
backend/src/routes/warehouse/levelRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/LevelController.ts
backend/src/routes/warehouse/locationRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/LocationController.ts
backend/src/routes/warehouse/binRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/BinController.ts
backend/src/routes/warehouse/binTypeRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/BinTypeController.ts
backend/src/routes/warehouse/binContentRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/BinContentController.ts
backend/src/routes/warehouse/binMovementRoutes.ts → backend/src/infrastructure/api/controllers/warehouse/BinMovementController.ts
```

### Phase 3: Frontend Migration

#### 3.1 Component Restructuring
```bash
# Current components by feature → New domain-based structure

# User Management Components
frontend/src/components/users/ → frontend/src/presentation/components/features/user/
├── tabs/UserTabs.tsx → UserTabs.tsx
├── UserList.tsx → UserList.tsx
├── UserForm.tsx → UserForm.tsx
└── UserCard.tsx → UserCard.tsx

# Product Management Components
frontend/src/components/products/ → frontend/src/presentation/components/features/product/
├── tabs/ProductTabs.tsx → ProductTabs.tsx
├── ProductList.tsx → ProductList.tsx
├── ProductForm.tsx → ProductForm.tsx
└── ProductCard.tsx → ProductCard.tsx

# Inventory Management Components
frontend/src/components/inventory/ → frontend/src/presentation/components/features/inventory/
├── tabs/InventoryTabs.tsx → InventoryTabs.tsx
├── InventoryList.tsx → InventoryList.tsx
└── MovementForm.tsx → MovementForm.tsx

# Warehouse Management Components
frontend/src/components/warehouses/ → frontend/src/presentation/components/features/warehouse/
├── tabs/WarehouseTabs.tsx → WarehouseTabs.tsx
├── WarehouseList.tsx → WarehouseList.tsx
├── LocationTree.tsx → LocationTree.tsx
└── BinGrid.tsx → BinGrid.tsx

# Common Components
frontend/src/components/ui/ → frontend/src/presentation/components/common/ui/
frontend/src/components/forms/ → frontend/src/presentation/components/common/forms/
frontend/src/components/tables/ → frontend/src/presentation/components/common/tables/
frontend/src/components/layout/ → frontend/src/presentation/components/layouts/
```

#### 3.2 Page Structure Migration
```bash
# App Router Pages → New Structure
frontend/src/app/dashboard/users/ → frontend/src/app/(dashboard)/users/
frontend/src/app/dashboard/products/ → frontend/src/app/(dashboard)/products/
frontend/src/app/dashboard/inventory/ → frontend/src/app/(dashboard)/inventory/
frontend/src/app/dashboard/warehouses/ → frontend/src/app/(dashboard)/warehouses/
```

#### 3.3 Services and Hooks Migration
```bash
# Services → Domain Services
frontend/src/services/ → frontend/src/core/services/
├── api.ts → ApiService.ts
├── auth.ts → AuthService.ts
├── users.ts → UserService.ts
└── products.ts → ProductService.ts

# Hooks → Domain Hooks
frontend/src/hooks/ → frontend/src/presentation/hooks/
├── useAuth.ts → common/useAuth.ts
├── useUsers.ts → user/useUsers.ts
├── useProducts.ts → product/useProducts.ts
└── useApi.ts → common/useApi.ts
```

## ⚠️ Critical Issues and Breaking Changes

### 1. Import Path Changes (HIGH IMPACT)
**Issue**: Every file that imports from old paths will break
**Affected Files**: 177+ files (45 backend + 132 frontend)
**Solution**:
- Create import alias mapping
- Use automated refactoring tools
- Gradual migration with temporary re-exports

```typescript
// Temporary bridge file: backend/src/legacy-imports.ts
export { default as logger } from './utils/logger/Logger';
export { UserController } from './infrastructure/api/controllers/user/UserController';
```

### 2. Prisma Client Direct Usage (HIGH IMPACT)
**Issue**: 39 route files directly instantiate PrismaClient
**Problems**:
- Multiple connections
- No transaction management
- No caching
- No testing isolation

**Solution**:
```typescript
// Before: In every route file
const prisma = new PrismaClient();

// After: Dependency injection
@Injectable()
export class UserRepository {
  constructor(@Inject('PrismaClient') private prisma: PrismaClient) {}
}
```

### 3. Business Logic in Routes (HIGH IMPACT)
**Issue**: Routes contain business logic, validation, and data manipulation
**Example Problems**:
- Password hashing in routes
- Complex database queries
- File upload handling
- Business validations

**Solution**: Extract to domain services and use cases

### 4. No Dependency Injection (MEDIUM IMPACT)
**Issue**: Need to implement DI container from scratch
**Required**:
- DI Container implementation
- Decorator system (@Injectable, @Inject)
- Module registration system
- Lifecycle management

### 5. Authentication Middleware Changes (MEDIUM IMPACT)
**Issue**: Current middleware directly in routes
**Breaking Change**: All protected routes need refactoring

```typescript
// Before
router.get('/', authenticateToken, requireAdmin, async (req, res) => {});

// After
@Get('/')
@RequireAuth()
@RequirePermission('admin')
async getUsers() {}
```

### 6. Error Handling Inconsistency (MEDIUM IMPACT)
**Issue**: Each route handles errors differently
**Solution**: Centralized error handling with custom exceptions

### 7. Frontend API Client Changes (MEDIUM IMPACT)
**Issue**: API endpoints will change structure
**Solution**: Create API abstraction layer

## 🛠️ Migration Strategy & Risk Mitigation

### Stage 1: Preparation (Week 1)
1. **Create New Structure** without moving files
2. **Implement DI Container** and base classes
3. **Create Legacy Bridge** files for imports
4. **Set up Testing Framework** for new architecture

### Stage 2: Infrastructure (Week 2-3)
1. **Move Utilities** (Logger, Prisma, Config)
2. **Update Import Paths** with automated tools
3. **Implement Middleware** in new structure
4. **Create Repository Base** classes

### Stage 3: Domain by Domain (Week 4-7)
1. **User Domain** (Week 4)
2. **Product Domain** (Week 5)
3. **Inventory Domain** (Week 6)
4. **Warehouse Domain** (Week 7)

### Stage 4: Frontend (Week 8-9)
1. **Component Migration**
2. **Service Layer**
3. **Hook Refactoring**
4. **Page Structure**

### Stage 5: Integration & Testing (Week 10)
1. **End-to-end Testing**
2. **Performance Testing**
3. **Documentation Update**
4. **Legacy Cleanup**

## 📋 Detailed File-by-File Migration Checklist

### Backend Routes Analysis & Migration Plan

#### User Domain Routes (13 files) - 250+ endpoints total
```
✅ userRoutes.ts (20 endpoints) → Split into:
  ├── UserController.ts (CRUD operations)
  ├── CreateUser.usecase.ts
  ├── UpdateUser.usecase.ts
  ├── GetUsers.usecase.ts
  ├── User.entity.ts
  └── UserRepository.impl.ts

✅ authRoutes.ts (8 endpoints) → Split into:
  ├── AuthController.ts
  ├── AuthenticateUser.usecase.ts
  ├── RefreshToken.usecase.ts
  └── AuthService.ts

✅ roleRoutes.ts (15 endpoints) → RoleController.ts + Role.entity.ts
✅ permissionRoutes.ts (12 endpoints) → PermissionController.ts + Permission.entity.ts
✅ profileRoutes.ts (10 endpoints) → ProfileController.ts
✅ rolePermissionRoutes.ts (8 endpoints) → RolePermissionController.ts
✅ userRoleRoutes.ts (6 endpoints) → UserRoleController.ts
✅ notificationRoutes.ts (15 endpoints) → NotificationController.ts
✅ systemLogRoutes.ts (8 endpoints) → SystemLogController.ts
✅ systemSettingRoutes.ts (12 endpoints) → SystemSettingController.ts
✅ unitRoutes.ts (10 endpoints) → UnitController.ts
✅ classTypeRoutes.ts (8 endpoints) → ClassTypeController.ts
```

**Estimated Effort**: 40 hours
**Risk Level**: HIGH (Authentication & Authorization changes)

#### Product Domain Routes (7 files) - 85+ endpoints
```
✅ productRoutes.ts (18 endpoints)
✅ categoryRoutes.ts (12 endpoints)
✅ brandRoutes.ts (10 endpoints)
✅ familyRoutes.ts (12 endpoints)
✅ attributeRoutes.ts (15 endpoints)
✅ attributeOptionRoutes.ts (8 endpoints)
✅ attributeValueRoutes.ts (10 endpoints)
```

**Estimated Effort**: 25 hours
**Risk Level**: MEDIUM

#### Inventory Domain Routes (4 files) - 45+ endpoints
```
✅ inventoryRoutes.ts (15 endpoints)
✅ inventoryMovementRoutes.ts (12 endpoints)
✅ inventoryCountRoutes.ts (10 endpoints)
✅ inventoryReservationRoutes.ts (8 endpoints)
```

**Estimated Effort**: 15 hours
**Risk Level**: MEDIUM

#### Warehouse Domain Routes (10 files) - 120+ endpoints
```
✅ warehouseRoutes.ts (15 endpoints)
✅ zoneRoutes.ts (12 endpoints)
✅ aisleRoutes.ts (12 endpoints)
✅ rackRoutes.ts (12 endpoints)
✅ levelRoutes.ts (12 endpoints)
✅ locationRoutes.ts (15 endpoints)
✅ binRoutes.ts (15 endpoints)
✅ binTypeRoutes.ts (8 endpoints)
✅ binContentRoutes.ts (12 endpoints)
✅ binMovementRoutes.ts (7 endpoints)
```

**Estimated Effort**: 35 hours
**Risk Level**: HIGH (Complex warehouse hierarchy)

## 🔧 Required New Infrastructure

### 1. Dependency Injection System
```typescript
// New files needed:
backend/src/di/Container.ts
backend/src/di/decorators/Injectable.ts
backend/src/di/decorators/Inject.ts
backend/src/di/modules/CoreModule.ts
backend/src/di/modules/UserModule.ts
backend/src/di/modules/ProductModule.ts
backend/src/di/modules/InventoryModule.ts
backend/src/di/modules/WarehouseModule.ts
```

### 2. Base Classes
```typescript
// New files needed:
backend/src/core/domain/entities/base/BaseEntity.ts
backend/src/core/domain/entities/base/AuditableEntity.ts
backend/src/infrastructure/api/controllers/base/BaseController.ts
backend/src/core/domain/repositories/base/IBaseRepository.ts
backend/src/core/shared/exceptions/BaseException.ts
backend/src/utils/common/Result.ts
```

### 3. Domain Events System
```typescript
// New files needed:
backend/src/core/domain/events/base/DomainEvent.ts
backend/src/infrastructure/messaging/EventBus.ts
backend/src/infrastructure/messaging/LocalEventBus.ts
```

## 💰 Effort Estimation

| Phase | Backend Hours | Frontend Hours | Total Hours |
|-------|--------------|----------------|-------------|
| **Preparation** | 20 | 10 | 30 |
| **Infrastructure** | 40 | 15 | 55 |
| **User Domain** | 40 | 20 | 60 |
| **Product Domain** | 25 | 15 | 40 |
| **Inventory Domain** | 15 | 10 | 25 |
| **Warehouse Domain** | 35 | 20 | 55 |
| **Integration & Testing** | 25 | 15 | 40 |
| **TOTAL** | **200 hours** | **105 hours** | **305 hours** |

## 🎯 Success Criteria

1. ✅ All existing endpoints work without breaking changes
2. ✅ Improved code organization and maintainability
3. ✅ Proper separation of concerns
4. ✅ Dependency injection throughout
5. ✅ Comprehensive test coverage
6. ✅ Documentation updated
7. ✅ Performance maintained or improved
8. ✅ Team can easily add new features

---

**Next Steps**:
1. Approve this migration plan
2. Set up development branch for refactoring
3. Begin Phase 1 implementation
4. Create automated migration scripts where possible