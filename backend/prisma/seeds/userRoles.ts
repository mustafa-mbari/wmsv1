import { PrismaClient } from '@prisma/client';

export async function seedUserRoles(prisma: PrismaClient) {
  // Get users and roles
  const users = await prisma.users.findMany();
  const roles = await prisma.roles.findMany();

  const adminRole = roles.find(r => r.slug === 'super-admin');
  const managerRole = roles.find(r => r.slug === 'manager');
  const warehouseRole = roles.find(r => r.slug === 'warehouse-staff');
  const salesRole = roles.find(r => r.slug === 'sales-rep');
  const inventoryRole = roles.find(r => r.slug === 'inventory-clerk');
  const viewerRole = roles.find(r => r.slug === 'viewer');

  const adminUser = users.find(u => u.username === 'admin');
  const john = users.find(u => u.username === 'jsmith');
  const mary = users.find(u => u.username === 'mjohnson');
  const robert = users.find(u => u.username === 'rdavis');
  const sarah = users.find(u => u.username === 'slee');
  const kevin = users.find(u => u.username === 'kwilson');

  const userRoles = [
    // Admin user gets super admin role
    ...(adminUser && adminRole ? [{
      user_id: adminUser.id,
      role_id: adminRole.id,
      assigned_by: adminUser.id,
      assigned_at: new Date(),
    }] : []),

    // John Smith as Manager
    ...(john && managerRole && adminUser ? [{
      user_id: john.id,
      role_id: managerRole.id,
      assigned_by: adminUser.id,
      assigned_at: new Date(),
    }] : []),

    // Mary Johnson as Warehouse Staff
    ...(mary && warehouseRole && adminUser ? [{
      user_id: mary.id,
      role_id: warehouseRole.id,
      assigned_by: adminUser.id,
      assigned_at: new Date(),
    }] : []),

    // Robert Davis as Sales Representative
    ...(robert && salesRole && adminUser ? [{
      user_id: robert.id,
      role_id: salesRole.id,
      assigned_by: adminUser.id,
      assigned_at: new Date(),
    }] : []),

    // Sarah Lee as Inventory Clerk
    ...(sarah && inventoryRole && adminUser ? [{
      user_id: sarah.id,
      role_id: inventoryRole.id,
      assigned_by: adminUser.id,
      assigned_at: new Date(),
    }] : []),

    // Kevin Wilson as Viewer
    ...(kevin && viewerRole && adminUser ? [{
      user_id: kevin.id,
      role_id: viewerRole.id,
      assigned_by: adminUser.id,
      assigned_at: new Date(),
    }] : []),

    // Give some users multiple roles
    ...(john && warehouseRole && adminUser ? [{
      user_id: john.id,
      role_id: warehouseRole.id,
      assigned_by: adminUser.id,
      assigned_at: new Date(),
    }] : []),

    ...(mary && inventoryRole && adminUser ? [{
      user_id: mary.id,
      role_id: inventoryRole.id,
      assigned_by: adminUser.id,
      assigned_at: new Date(),
    }] : []),
  ];

  for (const userRole of userRoles) {
    await prisma.user_roles.upsert({
      where: {
        user_id_role_id: {
          user_id: userRole.user_id,
          role_id: userRole.role_id,
        },
      },
      update: {},
      create: userRole,
    });
  }

  console.log(`✅ Seeded ${userRoles.length} user roles`);
}
