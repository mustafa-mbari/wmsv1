import { PrismaClient } from '@prisma/client';

export async function seedProductAttributeValues(prisma: PrismaClient) {
  // Get products and attributes
  const iphone = await prisma.products.findUnique({
    where: { sku: 'IPH15PRO-001' }
  });
  
  const samsung = await prisma.products.findUnique({
    where: { sku: 'SGS24-001' }
  });

  const macbook = await prisma.products.findUnique({
    where: { sku: 'MBA-M3-001' }
  });

  const tshirt = await prisma.products.findUnique({
    where: { sku: 'TSH-COT-001' }
  });

  const colorAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'color' }
  });
  
  const sizeAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'size' }
  });

  const brandAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'brand' }
  });

  const storageAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'storage-capacity' }
  });

  const screenSizeAttribute = await prisma.product_attributes.findUnique({
    where: { slug: 'screen-size' }
  });

  // Get some attribute options
  const blackOption = await prisma.product_attribute_options.findFirst({
    where: { value: 'black', attribute_id: colorAttribute?.id }
  });

  const storage256Option = await prisma.product_attribute_options.findFirst({
    where: { value: '256gb', attribute_id: storageAttribute?.id }
  });

  const storage128Option = await prisma.product_attribute_options.findFirst({
    where: { value: '128gb', attribute_id: storageAttribute?.id }
  });

  const mediumSizeOption = await prisma.product_attribute_options.findFirst({
    where: { value: 'm', attribute_id: sizeAttribute?.id }
  });

  const attributeValues = [
    // iPhone attributes
    ...(iphone && colorAttribute && blackOption ? [{
      product_id: iphone.id,
      attribute_id: colorAttribute.id,
      value: 'black',
      option_id: blackOption.id,
    }] : []),
    
    ...(iphone && brandAttribute ? [{
      product_id: iphone.id,
      attribute_id: brandAttribute.id,
      value: 'Apple',
      option_id: null,
    }] : []),

    ...(iphone && storageAttribute && storage256Option ? [{
      product_id: iphone.id,
      attribute_id: storageAttribute.id,
      value: '256gb',
      option_id: storage256Option.id,
    }] : []),

    ...(iphone && screenSizeAttribute ? [{
      product_id: iphone.id,
      attribute_id: screenSizeAttribute.id,
      value: '6.1',
      option_id: null,
    }] : []),

    // Samsung attributes
    ...(samsung && colorAttribute && blackOption ? [{
      product_id: samsung.id,
      attribute_id: colorAttribute.id,
      value: 'black',
      option_id: blackOption.id,
    }] : []),

    ...(samsung && brandAttribute ? [{
      product_id: samsung.id,
      attribute_id: brandAttribute.id,
      value: 'Samsung',
      option_id: null,
    }] : []),

    ...(samsung && storageAttribute && storage128Option ? [{
      product_id: samsung.id,
      attribute_id: storageAttribute.id,
      value: '128gb',
      option_id: storage128Option.id,
    }] : []),

    ...(samsung && screenSizeAttribute ? [{
      product_id: samsung.id,
      attribute_id: screenSizeAttribute.id,
      value: '6.2',
      option_id: null,
    }] : []),

    // MacBook attributes
    ...(macbook && brandAttribute ? [{
      product_id: macbook.id,
      attribute_id: brandAttribute.id,
      value: 'Apple',
      option_id: null,
    }] : []),

    ...(macbook && screenSizeAttribute ? [{
      product_id: macbook.id,
      attribute_id: screenSizeAttribute.id,
      value: '13.6',
      option_id: null,
    }] : []),

    // T-Shirt attributes
    ...(tshirt && sizeAttribute && mediumSizeOption ? [{
      product_id: tshirt.id,
      attribute_id: sizeAttribute.id,
      value: 'm',
      option_id: mediumSizeOption.id,
    }] : []),
  ];

  for (const attributeValue of attributeValues) {
    await prisma.product_attribute_values.upsert({
      where: {
        product_id_attribute_id: {
          product_id: attributeValue.product_id,
          attribute_id: attributeValue.attribute_id,
        },
      },
      update: {},
      create: attributeValue,
    });
  }

  console.log(`✅ Seeded ${attributeValues.length} product attribute values`);
}
