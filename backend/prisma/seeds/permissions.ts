import { PrismaClient } from '@prisma/client';

export async function seedPermissions(prisma: PrismaClient) {
  const permissions = [
    {
      name: 'Create User',
      slug: 'create-user',
      description: 'Permission to create new users',
      module: 'users',
      is_active: true,
    },
    {
      name: 'Edit User',
      slug: 'edit-user',
      description: 'Permission to edit existing users',
      module: 'users',
      is_active: true,
    },
    {
      name: 'Delete User',
      slug: 'delete-user',
      description: 'Permission to delete users',
      module: 'users',
      is_active: true,
    },
    {
      name: 'View Users',
      slug: 'view-users',
      description: 'Permission to view user listings',
      module: 'users',
      is_active: true,
    },
    {
      name: 'Manage Products',
      slug: 'manage-products',
      description: 'Permission to manage product inventory',
      module: 'products',
      is_active: true,
    },
    {
      name: 'View Reports',
      slug: 'view-reports',
      description: 'Permission to view system reports',
      module: 'reports',
      is_active: true,
    },
    {
      name: 'Manage Warehouses',
      slug: 'manage-warehouses',
      description: 'Permission to manage warehouse operations',
      module: 'warehouses',
      is_active: true,
    },
    {
      name: 'System Settings',
      slug: 'system-settings',
      description: 'Permission to modify system settings',
      module: 'system',
      is_active: true,
    },
  ];

  for (const permission of permissions) {
    await prisma.permissions.upsert({
      where: { slug: permission.slug },
      update: {},
      create: permission,
    });
  }

  console.log(`✅ Seeded ${permissions.length} permissions`);
}
