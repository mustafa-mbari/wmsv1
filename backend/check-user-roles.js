const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserRoles() {
  try {
    console.log('=== USERS WITH ROLES ===');
    const userRoles = await prisma.user_roles.findMany({
      include: {
        users_user_roles_user_idTousers: {
          select: {
            username: true,
            email: true
          }
        },
        roles: {
          select: {
            name: true,
            slug: true
          }
        }
      },
      orderBy: [
        { user_id: 'asc' },
        { role_id: 'asc' }
      ]
    });
    
    console.log(`Found ${userRoles.length} user-role assignments:`);
    
    // Group by user
    const userRoleMap = {};
    userRoles.forEach(ur => {
      const username = ur.users_user_roles_user_idTousers.username;
      if (!userRoleMap[username]) {
        userRoleMap[username] = {
          email: ur.users_user_roles_user_idTousers.email,
          roles: []
        };
      }
      userRoleMap[username].roles.push(ur.roles.name);
    });
    
    Object.entries(userRoleMap).forEach(([username, data]) => {
      console.log(`- ${username} (${data.email}) - Roles: ${data.roles.join(', ')}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRoles();
