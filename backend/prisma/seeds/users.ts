import { PrismaClient } from '@prisma/client';

export async function seedUsers(prisma: PrismaClient) {
  // Using simple hashed passwords for seeding - in production, use proper bcrypt
  const defaultHashedPassword = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8QFCQzAg5JYWNYcWBQN9BI6lYhAUDi'; // 'Password123!'
  
  const users = [
    {
      username: 'admin',
      email: 'admin@wms.com',
      password_hash: defaultHashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      phone: '+1234567890',
      address: '123 Admin Street, Admin City, AC 12345',
      birth_date: new Date('1985-01-15'),
      gender: 'male',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    {
      username: 'jsmith',
      email: 'john.smith@wms.com',
      password_hash: defaultHashedPassword,
      first_name: 'John',
      last_name: 'Smith',
      phone: '+1234567891',
      address: '456 Manager Lane, Manager City, MC 12346',
      birth_date: new Date('1990-05-20'),
      gender: 'male',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    {
      username: 'mjohnson',
      email: 'mary.johnson@wms.com',
      password_hash: defaultHashedPassword,
      first_name: 'Mary',
      last_name: 'Johnson',
      phone: '+1234567892',
      address: '789 Warehouse Ave, Warehouse City, WC 12347',
      birth_date: new Date('1988-11-12'),
      gender: 'female',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    {
      username: 'rdavis',
      email: 'robert.davis@wms.com',
      password_hash: defaultHashedPassword,
      first_name: 'Robert',
      last_name: 'Davis',
      phone: '+1234567893',
      address: '321 Sales Boulevard, Sales City, SC 12348',
      birth_date: new Date('1992-03-08'),
      gender: 'male',
      is_active: true,
      email_verified: false,
    },
    {
      username: 'slee',
      email: 'sarah.lee@wms.com',
      password_hash: defaultHashedPassword,
      first_name: 'Sarah',
      last_name: 'Lee',
      phone: '+1234567894',
      address: '654 Inventory Drive, Inventory City, IC 12349',
      birth_date: new Date('1995-07-25'),
      gender: 'female',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
    {
      username: 'kwilson',
      email: 'kevin.wilson@wms.com',
      password_hash: defaultHashedPassword,
      first_name: 'Kevin',
      last_name: 'Wilson',
      phone: '+1234567895',
      address: '987 Clerk Street, Clerk City, CC 12350',
      birth_date: new Date('1987-09-14'),
      gender: 'male',
      is_active: true,
      email_verified: true,
      email_verified_at: new Date(),
    },
  ];

  for (const user of users) {
    await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log(`✅ Seeded ${users.length} users`);
}
