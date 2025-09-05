import { PrismaClient } from '@prisma/client';

export async function seedRolePermissions(prisma: PrismaClient) {
  // Get roles and permissions
  const roles = await prisma.roles.findMany();
  const permissions = await prisma.permissions.findMany();

  const superAdminRole = roles.find(r => r.slug === 'super-admin');
  const adminRole = roles.find(r => r.slug === 'admin');
  const managerRole = roles.find(r => r.slug === 'manager');
  const warehouseRole = roles.find(r => r.slug === 'warehouse-staff');
  const salesRole = roles.find(r => r.slug === 'sales-rep');
  const inventoryRole = roles.find(r => r.slug === 'inventory-clerk');
  const viewerRole = roles.find(r => r.slug === 'viewer');

  const createUserPerm = permissions.find(p => p.slug === 'create-user');
  const editUserPerm = permissions.find(p => p.slug === 'edit-user');
  const deleteUserPerm = permissions.find(p => p.slug === 'delete-user');
  const viewUsersPerm = permissions.find(p => p.slug === 'view-users');
  const manageProductsPerm = permissions.find(p => p.slug === 'manage-products');
  const viewReportsPerm = permissions.find(p => p.slug === 'view-reports');
  const manageWarehousesPerm = permissions.find(p => p.slug === 'manage-warehouses');
  const systemSettingsPerm = permissions.find(p => p.slug === 'system-settings');

  const rolePermissions = [
    // Super Admin gets all permissions
    ...(superAdminRole ? [
      ...(createUserPerm ? [{ role_id: superAdminRole.id, permission_id: createUserPerm.id }] : []),
      ...(editUserPerm ? [{ role_id: superAdminRole.id, permission_id: editUserPerm.id }] : []),
      ...(deleteUserPerm ? [{ role_id: superAdminRole.id, permission_id: deleteUserPerm.id }] : []),
      ...(viewUsersPerm ? [{ role_id: superAdminRole.id, permission_id: viewUsersPerm.id }] : []),
      ...(manageProductsPerm ? [{ role_id: superAdminRole.id, permission_id: manageProductsPerm.id }] : []),
      ...(viewReportsPerm ? [{ role_id: superAdminRole.id, permission_id: viewReportsPerm.id }] : []),
      ...(manageWarehousesPerm ? [{ role_id: superAdminRole.id, permission_id: manageWarehousesPerm.id }] : []),
      ...(systemSettingsPerm ? [{ role_id: superAdminRole.id, permission_id: systemSettingsPerm.id }] : []),
    ] : []),

    // Admin gets most permissions except system settings
    ...(adminRole ? [
      ...(createUserPerm ? [{ role_id: adminRole.id, permission_id: createUserPerm.id }] : []),
      ...(editUserPerm ? [{ role_id: adminRole.id, permission_id: editUserPerm.id }] : []),
      ...(deleteUserPerm ? [{ role_id: adminRole.id, permission_id: deleteUserPerm.id }] : []),
      ...(viewUsersPerm ? [{ role_id: adminRole.id, permission_id: viewUsersPerm.id }] : []),
      ...(manageProductsPerm ? [{ role_id: adminRole.id, permission_id: manageProductsPerm.id }] : []),
      ...(viewReportsPerm ? [{ role_id: adminRole.id, permission_id: viewReportsPerm.id }] : []),
      ...(manageWarehousesPerm ? [{ role_id: adminRole.id, permission_id: manageWarehousesPerm.id }] : []),
    ] : []),

    // Manager gets user and product management
    ...(managerRole ? [
      ...(editUserPerm ? [{ role_id: managerRole.id, permission_id: editUserPerm.id }] : []),
      ...(viewUsersPerm ? [{ role_id: managerRole.id, permission_id: viewUsersPerm.id }] : []),
      ...(manageProductsPerm ? [{ role_id: managerRole.id, permission_id: manageProductsPerm.id }] : []),
      ...(viewReportsPerm ? [{ role_id: managerRole.id, permission_id: viewReportsPerm.id }] : []),
      ...(manageWarehousesPerm ? [{ role_id: managerRole.id, permission_id: manageWarehousesPerm.id }] : []),
    ] : []),

    // Warehouse Staff gets product and warehouse management
    ...(warehouseRole ? [
      ...(manageProductsPerm ? [{ role_id: warehouseRole.id, permission_id: manageProductsPerm.id }] : []),
      ...(manageWarehousesPerm ? [{ role_id: warehouseRole.id, permission_id: manageWarehousesPerm.id }] : []),
      ...(viewReportsPerm ? [{ role_id: warehouseRole.id, permission_id: viewReportsPerm.id }] : []),
    ] : []),

    // Sales Representative gets user viewing and reports
    ...(salesRole ? [
      ...(viewUsersPerm ? [{ role_id: salesRole.id, permission_id: viewUsersPerm.id }] : []),
      ...(viewReportsPerm ? [{ role_id: salesRole.id, permission_id: viewReportsPerm.id }] : []),
    ] : []),

    // Inventory Clerk gets product management only
    ...(inventoryRole ? [
      ...(manageProductsPerm ? [{ role_id: inventoryRole.id, permission_id: manageProductsPerm.id }] : []),
    ] : []),

    // Viewer gets only view reports
    ...(viewerRole ? [
      ...(viewReportsPerm ? [{ role_id: viewerRole.id, permission_id: viewReportsPerm.id }] : []),
    ] : []),
  ];

  for (const rolePermission of rolePermissions) {
    await prisma.role_permissions.upsert({
      where: {
        role_id_permission_id: {
          role_id: rolePermission.role_id,
          permission_id: rolePermission.permission_id,
        },
      },
      update: {},
      create: rolePermission,
    });
  }

  console.log(`✅ Seeded ${rolePermissions.length} role permissions`);
}
