const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔍 Checking if admin@example.com already exists...');
    
    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: 'admin@example.com' }
    });

    if (existingUser) {
      console.log('👤 User admin@example.com already exists with ID:', existingUser.id);
      
      // Get the super-admin role
      const superAdminRole = await prisma.roles.findUnique({
        where: { slug: 'super-admin' }
      });

      if (superAdminRole) {
        // Check if user already has super-admin role
        const existingUserRole = await prisma.user_roles.findFirst({
          where: {
            user_id: existingUser.id,
            role_id: superAdminRole.id,
            deleted_at: null
          }
        });

        if (!existingUserRole) {
          // Add super-admin role to existing user
          await prisma.user_roles.create({
            data: {
              user_id: existingUser.id,
              role_id: superAdminRole.id,
              assigned_at: new Date(),
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          console.log('✅ Added super-admin role to existing user');
        } else {
          console.log('✅ User already has super-admin role');
        }
      }
      
      return existingUser;
    }

    console.log('🔑 Hashing password...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    console.log('👤 Creating new admin user...');
    const newUser = await prisma.users.create({
      data: {
        username: 'superadmin',
        email: 'admin@example.com',
        password_hash: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        phone: '+1234567890',
        address: '123 Admin Street, Tech City',
        gender: 'other',
        is_active: true,
        email_verified: true,
        email_verified_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Created admin user with ID:', newUser.id);

    // Get the super-admin role
    console.log('🔍 Finding super-admin role...');
    const superAdminRole = await prisma.roles.findUnique({
      where: { slug: 'super-admin' }
    });

    if (!superAdminRole) {
      console.log('❌ Super-admin role not found! Creating it...');
      const createdRole = await prisma.roles.create({
        data: {
          name: 'Super Admin',
          slug: 'super-admin',
          description: 'Full system access with all permissions',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log('✅ Created super-admin role with ID:', createdRole.id);
      
      // Assign the role to the user
      await prisma.user_roles.create({
        data: {
          user_id: newUser.id,
          role_id: createdRole.id,
          assigned_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    } else {
      console.log('✅ Found super-admin role with ID:', superAdminRole.id);
      
      // Assign the role to the user
      await prisma.user_roles.create({
        data: {
          user_id: newUser.id,
          role_id: superAdminRole.id,
          assigned_at: new Date(),
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    console.log('✅ Assigned super-admin role to user');

    // Verify the setup
    console.log('🔍 Verifying setup...');
    const verifyUser = await prisma.users.findUnique({
      where: { email: 'admin@example.com' },
      include: {
        user_roles_user_roles_user_idTousers: {
          where: { deleted_at: null },
          include: {
            roles: true
          }
        }
      }
    });

    if (verifyUser) {
      console.log('✅ Verification successful!');
      console.log('📧 Email:', verifyUser.email);
      console.log('👤 Username:', verifyUser.username);
      console.log('🔐 Password: password123');
      console.log('🎭 Roles:', verifyUser.user_roles_user_roles_user_idTousers.map(ur => ur.roles.name).join(', '));
    }

    return newUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser()
  .then(() => {
    console.log('🎉 Admin user setup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });