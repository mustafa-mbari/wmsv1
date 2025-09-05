import { PrismaClient } from '@prisma/client';

export async function seedProductFamilies(prisma: PrismaClient) {
  // First get some categories to link families to
  const electronicsCategory = await prisma.product_categories.findUnique({
    where: { slug: 'electronics' }
  });
  
  const clothingCategory = await prisma.product_categories.findUnique({
    where: { slug: 'clothing' }
  });

  const homeKitchenCategory = await prisma.product_categories.findUnique({
    where: { slug: 'home-kitchen' }
  });

  const families = [
    {
      name: 'Smartphones',
      description: 'Mobile phone devices with smart capabilities',
      category_id: electronicsCategory?.id || null,
      is_active: true,
    },
    {
      name: 'Laptops',
      description: 'Portable computer devices',
      category_id: electronicsCategory?.id || null,
      is_active: true,
    },
    {
      name: 'Tablets',
      description: 'Tablet computing devices',
      category_id: electronicsCategory?.id || null,
      is_active: true,
    },
    {
      name: 'T-Shirts',
      description: 'Short-sleeve cotton shirts',
      category_id: clothingCategory?.id || null,
      is_active: true,
    },
    {
      name: 'Jeans',
      description: 'Denim trousers and pants',
      category_id: clothingCategory?.id || null,
      is_active: true,
    },
    {
      name: 'Kitchen Appliances',
      description: 'Small and large kitchen appliances',
      category_id: homeKitchenCategory?.id || null,
      is_active: true,
    },
    {
      name: 'Cookware',
      description: 'Pots, pans, and cooking utensils',
      category_id: homeKitchenCategory?.id || null,
      is_active: true,
    },
    {
      name: 'Home Decor',
      description: 'Decorative items for home',
      category_id: homeKitchenCategory?.id || null,
      is_active: true,
    },
  ];

  for (const family of families) {
    await prisma.product_families.upsert({
      where: { name: family.name },
      update: {},
      create: family,
    });
  }

  console.log(`✅ Seeded ${families.length} product families`);
}
