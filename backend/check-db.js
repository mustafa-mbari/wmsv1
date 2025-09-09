const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== ROLES ===');
    const roles = await prisma.roles.findMany();
    console.log(roles);
    
    console.log('\n=== PERMISSIONS ===');
    const permissions = await prisma.permissions.findMany();
    console.log(permissions);
    
    console.log('\n=== ROLE_PERMISSIONS ===');
    const rolePermissions = await prisma.role_permissions.findMany();
    console.log(rolePermissions);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
