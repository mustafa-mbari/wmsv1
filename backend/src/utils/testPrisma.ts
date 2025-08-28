import prisma from './prismaClient';

async function main() {
  try {
    // Example: fetch all users
    const users = await prisma.users.findMany();
    console.log('Users:', users);
  } catch (error) {
    console.error('Prisma connection error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
