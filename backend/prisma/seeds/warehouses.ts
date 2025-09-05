import { PrismaClient } from '@prisma/client';

export async function seedWarehouses(prisma: PrismaClient) {
  // Get some users to assign as managers
  const users = await prisma.users.findMany({
    take: 6
  });

  const warehouses = [
    {
      name: 'Main Distribution Center',
      code: 'MDC-001',
      address: '1234 Industrial Blvd, Building A',
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
      postal_code: '90210',
      phone: '+1-555-0101',
      email: 'mdc@wms.com',
      manager_id: users[1]?.id || null,
      is_active: true,
    },
    {
      name: 'East Coast Warehouse',
      code: 'ECW-002',
      address: '5678 Logistics Drive, Suite 100',
      city: 'New York',
      state: 'New York',
      country: 'United States',
      postal_code: '10001',
      phone: '+1-555-0102',
      email: 'ecw@wms.com',
      manager_id: users[2]?.id || null,
      is_active: true,
    },
    {
      name: 'Midwest Regional Hub',
      code: 'MRH-003',
      address: '9101 Commerce Street',
      city: 'Chicago',
      state: 'Illinois',
      country: 'United States',
      postal_code: '60601',
      phone: '+1-555-0103',
      email: 'mrh@wms.com',
      manager_id: users[3]?.id || null,
      is_active: true,
    },
    {
      name: 'South Distribution Point',
      code: 'SDP-004',
      address: '2468 Supply Chain Road',
      city: 'Atlanta',
      state: 'Georgia',
      country: 'United States',
      postal_code: '30301',
      phone: '+1-555-0104',
      email: 'sdp@wms.com',
      manager_id: users[4]?.id || null,
      is_active: true,
    },
    {
      name: 'West Coast Fulfillment',
      code: 'WCF-005',
      address: '1357 Shipping Lane',
      city: 'Seattle',
      state: 'Washington',
      country: 'United States',
      postal_code: '98101',
      phone: '+1-555-0105',
      email: 'wcf@wms.com',
      manager_id: users[5]?.id || null,
      is_active: true,
    },
    {
      name: 'Central Storage Facility',
      code: 'CSF-006',
      address: '8642 Warehouse Way',
      city: 'Dallas',
      state: 'Texas',
      country: 'United States',
      postal_code: '75201',
      phone: '+1-555-0106',
      email: 'csf@wms.com',
      manager_id: users[0]?.id || null,
      is_active: true,
    },
    {
      name: 'Northern Distribution Center',
      code: 'NDC-007',
      address: '7531 Cold Storage Drive',
      city: 'Minneapolis',
      state: 'Minnesota',
      country: 'United States',
      postal_code: '55401',
      phone: '+1-555-0107',
      email: 'ndc@wms.com',
      manager_id: users[1]?.id || null,
      is_active: false, // Inactive warehouse for testing
    },
    {
      name: 'Southwest Hub',
      code: 'SWH-008',
      address: '9642 Desert View Blvd',
      city: 'Phoenix',
      state: 'Arizona',
      country: 'United States',
      postal_code: '85001',
      phone: '+1-555-0108',
      email: 'swh@wms.com',
      manager_id: users[2]?.id || null,
      is_active: true,
    },
  ];

  for (const warehouse of warehouses) {
    await prisma.warehouses.upsert({
      where: { code: warehouse.code },
      update: {},
      create: warehouse,
    });
  }

  console.log(`✅ Seeded ${warehouses.length} warehouses`);
}
