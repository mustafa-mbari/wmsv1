const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignRolePermissions() {
  try {
    console.log('🔗 Assigning permissions to roles...');
    
    // Get all roles and permissions
    const roles = await prisma.roles.findMany();
    const permissions = await prisma.permissions.findMany();
    
    // Create a permission lookup
    const permissionMap = {};
    permissions.forEach(p => {
      permissionMap[p.slug] = p.id;
    });
    
    // Define role-permission mappings
    const rolePermissions = {
      'super-admin': [
        'view-users', 'create-users', 'edit-users', 'delete-users',
        'view-products', 'create-products', 'edit-products', 'delete-products',
        'view-inventory', 'manage-inventory',
        'view-reports', 'export-data',
        'system-settings'
      ],
      'admin': [
        'view-users', 'create-users', 'edit-users',
        'view-products', 'create-products', 'edit-products', 'delete-products',
        'view-inventory', 'manage-inventory',
        'view-reports', 'export-data'
      ],
      'manager': [
        'view-users',
        'view-products', 'create-products', 'edit-products',
        'view-inventory', 'manage-inventory',
        'view-reports', 'export-data'
      ],
      'supervisor': [
        'view-products', 'edit-products',
        'view-inventory', 'manage-inventory',
        'view-reports'
      ],
      'employee': [
        'view-products',
        'view-inventory'
      ],
      'viewer': [
        'view-products',
        'view-inventory',
        'view-reports'
      ]
    };
    
    for (const role of roles) {
      const permissionSlugs = rolePermissions[role.slug];
      if (!permissionSlugs) {
        console.log(`⚠️ No permissions defined for role: ${role.slug}`);
        continue;
      }
      
      console.log(`📋 Assigning permissions to ${role.name}...`);
      
      for (const permissionSlug of permissionSlugs) {
        const permissionId = permissionMap[permissionSlug];
        if (!permissionId) {
          console.log(`❌ Permission not found: ${permissionSlug}`);
          continue;
        }
        
        // Check if assignment already exists
        const existing = await prisma.role_permissions.findFirst({
          where: {
            role_id: role.id,
            permission_id: permissionId
          }
        });
        
        if (!existing) {
          await prisma.role_permissions.create({
            data: {
              role_id: role.id,
              permission_id: permissionId
            }
          });
          console.log(`✅ Assigned ${permissionSlug} to ${role.slug}`);
        } else {
          console.log(`⚡ Already assigned: ${permissionSlug} to ${role.slug}`);
        }
      }
    }
    
    console.log('🎉 Role permissions assignment completed!');
    
    // Verify the assignments
    const totalAssignments = await prisma.role_permissions.count();
    console.log(`📊 Total role-permission assignments: ${totalAssignments}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignRolePermissions();
