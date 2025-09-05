import { PrismaClient } from '@prisma/client';

export async function seedProductCategories(prisma: PrismaClient) {
  const categories = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and accessories',
      parent_id: null,
      image_url: 'https://example.com/images/electronics.jpg',
      sort_order: 1,
      is_active: true,
    },
    {
      name: 'Computers',
      slug: 'computers',
      description: 'Desktop and laptop computers',
      parent_id: null, // Will be updated after electronics is created
      image_url: 'https://example.com/images/computers.jpg',
      sort_order: 1,
      is_active: true,
    },
    {
      name: 'Mobile Phones',
      slug: 'mobile-phones',
      description: 'Smartphones and mobile devices',
      parent_id: null, // Will be updated after electronics is created
      image_url: 'https://example.com/images/mobile.jpg',
      sort_order: 2,
      is_active: true,
    },
    {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel and fashion items',
      parent_id: null,
      image_url: 'https://example.com/images/clothing.jpg',
      sort_order: 2,
      is_active: true,
    },
    {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Home appliances and kitchen items',
      parent_id: null,
      image_url: 'https://example.com/images/home-kitchen.jpg',
      sort_order: 3,
      is_active: true,
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Books and reading materials',
      parent_id: null,
      image_url: 'https://example.com/images/books.jpg',
      sort_order: 4,
      is_active: true,
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment and accessories',
      parent_id: null,
      image_url: 'https://example.com/images/sports.jpg',
      sort_order: 5,
      is_active: true,
    },
    {
      name: 'Beauty',
      slug: 'beauty',
      description: 'Beauty and personal care products',
      parent_id: null,
      image_url: 'https://example.com/images/beauty.jpg',
      sort_order: 6,
      is_active: true,
    },
  ];

  // Create parent categories first
  const parentCategories = categories.filter(cat => cat.parent_id === null);
  
  for (const category of parentCategories) {
    await prisma.product_categories.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Update child categories with parent IDs
  const electronicsCategory = await prisma.product_categories.findUnique({
    where: { slug: 'electronics' }
  });

  if (electronicsCategory) {
    await prisma.product_categories.updateMany({
      where: { slug: { in: ['computers', 'mobile-phones'] } },
      data: { parent_id: electronicsCategory.id }
    });
  }

  console.log(`✅ Seeded ${categories.length} product categories`);
}
