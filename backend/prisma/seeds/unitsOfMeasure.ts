import { PrismaClient } from '@prisma/client';

export async function seedUnitsOfMeasure(prisma: PrismaClient) {
  const units = [
    {
      name: 'Each',
      symbol: 'ea',
      description: 'Individual units or pieces',
      is_active: true,
    },
    {
      name: 'Kilogram',
      symbol: 'kg',
      description: 'Weight measurement in kilograms',
      is_active: true,
    },
    {
      name: 'Gram',
      symbol: 'g',
      description: 'Weight measurement in grams',
      is_active: true,
    },
    {
      name: 'Liter',
      symbol: 'L',
      description: 'Volume measurement in liters',
      is_active: true,
    },
    {
      name: 'Milliliter',
      symbol: 'mL',
      description: 'Volume measurement in milliliters',
      is_active: true,
    },
    {
      name: 'Meter',
      symbol: 'm',
      description: 'Length measurement in meters',
      is_active: true,
    },
    {
      name: 'Centimeter',
      symbol: 'cm',
      description: 'Length measurement in centimeters',
      is_active: true,
    },
    {
      name: 'Box',
      symbol: 'box',
      description: 'Packaging unit - box',
      is_active: true,
    },
  ];

  for (const unit of units) {
    await prisma.units_of_measure.upsert({
      where: { name: unit.name },
      update: {},
      create: unit,
    });
  }

  console.log(`✅ Seeded ${units.length} units of measure`);
}
