import { PrismaClient } from '@prisma/client';

export async function seedProductAttributeOptions(prisma: PrismaClient) {
  // Get attributes to link options to
  const colorAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'color' }
  });
  
  const sizeAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'size' }
  });

  const materialAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'material' }
  });

  const storageAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'storage-capacity' }
  });

  const options = [
    // Color options
    ...(colorAttribute ? [
      {
        attribute_id: colorAttribute.id,
        value: 'red',
        label: 'Red',
        sort_order: 1,
        is_active: true,
      },
      {
        attribute_id: colorAttribute.id,
        value: 'blue',
        label: 'Blue',
        sort_order: 2,
        is_active: true,
      },
      {
        attribute_id: colorAttribute.id,
        value: 'black',
        label: 'Black',
        sort_order: 3,
        is_active: true,
      },
      {
        attribute_id: colorAttribute.id,
        value: 'white',
        label: 'White',
        sort_order: 4,
        is_active: true,
      },
    ] : []),

    // Size options
    ...(sizeAttribute ? [
      {
        attribute_id: sizeAttribute.id,
        value: 'xs',
        label: 'Extra Small',
        sort_order: 1,
        is_active: true,
      },
      {
        attribute_id: sizeAttribute.id,
        value: 's',
        label: 'Small',
        sort_order: 2,
        is_active: true,
      },
      {
        attribute_id: sizeAttribute.id,
        value: 'm',
        label: 'Medium',
        sort_order: 3,
        is_active: true,
      },
      {
        attribute_id: sizeAttribute.id,
        value: 'l',
        label: 'Large',
        sort_order: 4,
        is_active: true,
      },
      {
        attribute_id: sizeAttribute.id,
        value: 'xl',
        label: 'Extra Large',
        sort_order: 5,
        is_active: true,
      },
    ] : []),

    // Material options
    ...(materialAttribute ? [
      {
        attribute_id: materialAttribute.id,
        value: 'cotton',
        label: 'Cotton',
        sort_order: 1,
        is_active: true,
      },
      {
        attribute_id: materialAttribute.id,
        value: 'polyester',
        label: 'Polyester',
        sort_order: 2,
        is_active: true,
      },
      {
        attribute_id: materialAttribute.id,
        value: 'leather',
        label: 'Leather',
        sort_order: 3,
        is_active: true,
      },
    ] : []),

    // Storage capacity options
    ...(storageAttribute ? [
      {
        attribute_id: storageAttribute.id,
        value: '64gb',
        label: '64GB',
        sort_order: 1,
        is_active: true,
      },
      {
        attribute_id: storageAttribute.id,
        value: '128gb',
        label: '128GB',
        sort_order: 2,
        is_active: true,
      },
      {
        attribute_id: storageAttribute.id,
        value: '256gb',
        label: '256GB',
        sort_order: 3,
        is_active: true,
      },
      {
        attribute_id: storageAttribute.id,
        value: '512gb',
        label: '512GB',
        sort_order: 4,
        is_active: true,
      },
    ] : []),
  ];

  for (const option of options) {
    await prisma.product_attribute_options.upsert({
      where: {
        attribute_id_value: {
          attribute_id: option.attribute_id,
          value: option.value,
        },
      },
      update: {},
      create: option,
    });
  }

  console.log(`✅ Seeded ${options.length} product attribute options`);
}
