import { PrismaClient } from '@prisma/client';

export async function seedClassTypes(prisma: PrismaClient) {
  const classTypes = [
    {
      name: 'Electronics',
      description: 'Electronic devices and accessories',
      is_active: true,
    },
    {
      name: 'Clothing',
      description: 'Apparel and fashion items',
      is_active: true,
    },
    {
      name: 'Food & Beverage',
      description: 'Food items and beverages',
      is_active: true,
    },
    {
      name: 'Home & Garden',
      description: 'Home improvement and garden supplies',
      is_active: true,
    },
    {
      name: 'Automotive',
      description: 'Car parts and automotive accessories',
      is_active: true,
    },
    {
      name: 'Books & Media',
      description: 'Books, magazines, and media content',
      is_active: true,
    },
    {
      name: 'Health & Beauty',
      description: 'Health care and beauty products',
      is_active: true,
    },
    {
      name: 'Sports & Outdoors',
      description: 'Sports equipment and outdoor gear',
      is_active: true,
    },
  ];

  for (const classType of classTypes) {
    await prisma.class_types.upsert({
      where: { name: classType.name },
      update: {},
      create: classType,
    });
  }

  console.log(`✅ Seeded ${classTypes.length} class types`);
}
