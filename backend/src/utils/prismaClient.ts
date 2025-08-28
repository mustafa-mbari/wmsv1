import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance for the app
const prisma = new PrismaClient();

export default prisma;
