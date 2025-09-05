import { PrismaClient } from '@prisma/client';

export async function seedRoles(prisma: PrismaClient) {
  const roles = [
    {
      name: 'Super Admin',
      slug: 'super-admin',
      description: 'Full system access with all permissions',
      is_active: true,
    },
    {
      name: 'Admin',
      slug: 'admin',
      description: 'Administrative access with most permissions',
      is_active: true,
    },
    {
      name: 'Manager',
      slug: 'manager',
      description: 'Management level access for specific modules',
      is_active: true,
    },
    {
      name: 'Warehouse Staff',
      slug: 'warehouse-staff',
      description: 'Access to warehouse operations and inventory',
      is_active: true,
    },
    {
      name: 'Sales Representative',
      slug: 'sales-rep',
      description: 'Access to sales and customer management',
      is_active: true,
    },
    {
      name: 'Inventory Clerk',
      slug: 'inventory-clerk',
      description: 'Access to inventory management only',
      is_active: true,
    },
    {
      name: 'Viewer',
      slug: 'viewer',
      description: 'Read-only access to reports and data',
      is_active: true,
    },
    {
      name: 'Customer',
      slug: 'customer',
      description: 'Limited access for external customers',
      is_active: true,
    },
  ];

  for (const role of roles) {
    await prisma.roles.upsert({
      where: { slug: role.slug },
      update: {},
      create: role,
    });
  }

  console.log(`✅ Seeded ${roles.length} roles`);
}
