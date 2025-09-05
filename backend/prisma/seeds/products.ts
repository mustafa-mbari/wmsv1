import { PrismaClient } from '@prisma/client';

export async function seedProducts(prisma: PrismaClient) {
  // Get some categories, families, and units to link products to
  const electronicsCategory = await prisma.product_categories.findUnique({
    where: { slug: 'electronics' }
  });
  
  const clothingCategory = await prisma.product_categories.findUnique({
    where: { slug: 'clothing' }
  });

  const smartphoneFamily = await prisma.product_families.findUnique({
    where: { name: 'Smartphones' }
  });

  const laptopFamily = await prisma.product_families.findUnique({
    where: { name: 'Laptops' }
  });

  const tshirtFamily = await prisma.product_families.findUnique({
    where: { name: 'T-Shirts' }
  });

  const eachUnit = await prisma.units_of_measure.findUnique({
    where: { name: 'Each' }
  });

  const products = [
    {
      name: 'iPhone 15 Pro',
      sku: 'IPH15PRO-001',
      barcode: '1234567890123',
      description: 'Latest iPhone with advanced camera system and A17 Pro chip',
      short_description: 'iPhone 15 Pro - Premium smartphone',
      category_id: electronicsCategory?.id || null,
      family_id: smartphoneFamily?.id || null,
      unit_id: eachUnit?.id || null,
      price: 999.99,
      cost: 600.00,
      stock_quantity: 50,
      min_stock_level: 10,
      weight: 0.187,
      length: 14.67,
      width: 7.09,
      height: 0.83,
      status: 'active',
      is_digital: false,
      track_stock: true,
      image_url: 'https://example.com/images/iphone15pro.jpg',
      images: JSON.stringify(['https://example.com/images/iphone15pro-1.jpg', 'https://example.com/images/iphone15pro-2.jpg']),
      tags: JSON.stringify(['smartphone', 'apple', 'premium', 'ios']),
    },
    {
      name: 'Samsung Galaxy S24',
      sku: 'SGS24-001',
      barcode: '1234567890124',
      description: 'Samsung flagship smartphone with AI features',
      short_description: 'Samsung Galaxy S24 - Android flagship',
      category_id: electronicsCategory?.id || null,
      family_id: smartphoneFamily?.id || null,
      unit_id: eachUnit?.id || null,
      price: 899.99,
      cost: 550.00,
      stock_quantity: 35,
      min_stock_level: 8,
      weight: 0.168,
      length: 14.7,
      width: 7.06,
      height: 0.76,
      status: 'active',
      is_digital: false,
      track_stock: true,
      image_url: 'https://example.com/images/galaxys24.jpg',
      images: JSON.stringify(['https://example.com/images/galaxys24-1.jpg', 'https://example.com/images/galaxys24-2.jpg']),
      tags: JSON.stringify(['smartphone', 'samsung', 'android', 'ai']),
    },
    {
      name: 'MacBook Air M3',
      sku: 'MBA-M3-001',
      barcode: '1234567890125',
      description: 'Apple MacBook Air with M3 chip, perfect for everyday computing',
      short_description: 'MacBook Air M3 - Ultralight laptop',
      category_id: electronicsCategory?.id || null,
      family_id: laptopFamily?.id || null,
      unit_id: eachUnit?.id || null,
      price: 1299.99,
      cost: 800.00,
      stock_quantity: 25,
      min_stock_level: 5,
      weight: 1.24,
      length: 30.41,
      width: 21.5,
      height: 1.13,
      status: 'active',
      is_digital: false,
      track_stock: true,
      image_url: 'https://example.com/images/macbookair.jpg',
      images: JSON.stringify(['https://example.com/images/macbookair-1.jpg', 'https://example.com/images/macbookair-2.jpg']),
      tags: JSON.stringify(['laptop', 'apple', 'macbook', 'ultralight']),
    },
    {
      name: 'Classic Cotton T-Shirt',
      sku: 'TSH-COT-001',
      barcode: '1234567890126',
      description: 'Premium cotton t-shirt with comfortable fit',
      short_description: 'Classic Cotton T-Shirt',
      category_id: clothingCategory?.id || null,
      family_id: tshirtFamily?.id || null,
      unit_id: eachUnit?.id || null,
      price: 29.99,
      cost: 12.00,
      stock_quantity: 200,
      min_stock_level: 50,
      weight: 0.15,
      length: 71.0,
      width: 56.0,
      height: 1.0,
      status: 'active',
      is_digital: false,
      track_stock: true,
      image_url: 'https://example.com/images/cotton-tshirt.jpg',
      images: JSON.stringify(['https://example.com/images/cotton-tshirt-1.jpg', 'https://example.com/images/cotton-tshirt-2.jpg']),
      tags: JSON.stringify(['clothing', 'tshirt', 'cotton', 'casual']),
    },
    {
      name: 'Gaming Laptop Pro',
      sku: 'GLP-001',
      barcode: '1234567890127',
      description: 'High-performance gaming laptop with RTX graphics',
      short_description: 'Gaming Laptop Pro - High performance',
      category_id: electronicsCategory?.id || null,
      family_id: laptopFamily?.id || null,
      unit_id: eachUnit?.id || null,
      price: 1899.99,
      cost: 1200.00,
      stock_quantity: 15,
      min_stock_level: 3,
      weight: 2.5,
      length: 35.5,
      width: 25.2,
      height: 2.3,
      status: 'active',
      is_digital: false,
      track_stock: true,
      image_url: 'https://example.com/images/gaming-laptop.jpg',
      images: JSON.stringify(['https://example.com/images/gaming-laptop-1.jpg', 'https://example.com/images/gaming-laptop-2.jpg']),
      tags: JSON.stringify(['laptop', 'gaming', 'rtx', 'performance']),
    },
    {
      name: 'Wireless Earbuds',
      sku: 'WEB-001',
      barcode: '1234567890128',
      description: 'Premium wireless earbuds with noise cancellation',
      short_description: 'Wireless Earbuds - Premium audio',
      category_id: electronicsCategory?.id || null,
      family_id: null,
      unit_id: eachUnit?.id || null,
      price: 199.99,
      cost: 80.00,
      stock_quantity: 100,
      min_stock_level: 20,
      weight: 0.05,
      length: 6.1,
      width: 4.5,
      height: 2.1,
      status: 'active',
      is_digital: false,
      track_stock: true,
      image_url: 'https://example.com/images/wireless-earbuds.jpg',
      images: JSON.stringify(['https://example.com/images/wireless-earbuds-1.jpg', 'https://example.com/images/wireless-earbuds-2.jpg']),
      tags: JSON.stringify(['audio', 'wireless', 'earbuds', 'noise-cancellation']),
    },
  ];

  for (const product of products) {
    await prisma.products.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log(`✅ Seeded ${products.length} products`);
}
