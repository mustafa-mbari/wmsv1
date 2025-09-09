const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log('=== PRODUCT CATEGORIES ===');
    const categories = await prisma.product_categories.findMany({
      orderBy: [{ parent_id: 'asc' }, { sort_order: 'asc' }]
    });
    console.log(`Found ${categories.length} product categories:`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - Parent ID: ${cat.parent_id || 'none'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
