import { PrismaClient } from '@prisma/client';

export async function seedProductAttributes(prisma: PrismaClient) {
  const attributes = [
    {
      name: 'Color',
      slug: 'color',
      type: 'select',
      description: 'Product color options',
      is_required: false,
      is_filterable: true,
      is_searchable: true,
      sort_order: 1,
      is_active: true,
    },
    {
      name: 'Size',
      slug: 'size',
      type: 'select',
      description: 'Product size variations',
      is_required: false,
      is_filterable: true,
      is_searchable: true,
      sort_order: 2,
      is_active: true,
    },
    {
      name: 'Brand',
      slug: 'brand',
      type: 'text',
      description: 'Product brand or manufacturer',
      is_required: false,
      is_filterable: true,
      is_searchable: true,
      sort_order: 3,
      is_active: true,
    },
    {
      name: 'Material',
      slug: 'material',
      type: 'select',
      description: 'Product material composition',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 4,
      is_active: true,
    },
    {
      name: 'Storage Capacity',
      slug: 'storage-capacity',
      type: 'select',
      description: 'Storage capacity for electronic devices',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 5,
      is_active: true,
    },
    {
      name: 'Screen Size',
      slug: 'screen-size',
      type: 'number',
      description: 'Screen size in inches',
      is_required: false,
      is_filterable: true,
      is_searchable: false,
      sort_order: 6,
      is_active: true,
    },
    {
      name: 'Weight',
      slug: 'weight',
      type: 'number',
      description: 'Product weight',
      is_required: false,
      is_filterable: false,
      is_searchable: false,
      sort_order: 7,
      is_active: true,
    },
    {
      name: 'Warranty',
      slug: 'warranty',
      type: 'text',
      description: 'Product warranty information',
      is_required: false,
      is_filterable: false,
      is_searchable: false,
      sort_order: 8,
      is_active: true,
    },
  ];

  for (const attribute of attributes) {
    await prisma.product_attributes.upsert({
      where: { slug: attribute.slug },
      update: {},
      create: attribute,
    });
  }

  console.log(`✅ Seeded ${attributes.length} product attributes`);
}
