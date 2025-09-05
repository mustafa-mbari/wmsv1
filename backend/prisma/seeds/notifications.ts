import { PrismaClient } from '@prisma/client';

export async function seedNotifications(prisma: PrismaClient) {
  // Get some users to assign notifications to
  const users = await prisma.users.findMany();

  const notifications = [
    {
      type: 'system',
      title: 'Welcome to WMS',
      message: 'Welcome to the Warehouse Management System. Your account has been successfully created.',
      data: JSON.stringify({ action: 'account_created', timestamp: new Date().toISOString() }),
      user_id: users[0]?.id || null,
      email: users[0]?.email || null,
      status: 'sent',
      sent_at: new Date(),
      read_at: new Date(),
      retry_count: 0,
      priority: 'normal',
      metadata: JSON.stringify({ source: 'system', category: 'welcome' }),
    },
    {
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Product iPhone 15 Pro is running low on stock. Current quantity: 10 units.',
      data: JSON.stringify({ product_sku: 'IPH15PRO-001', current_stock: 10, min_level: 10 }),
      user_id: users[1]?.id || null,
      email: users[1]?.email || null,
      status: 'sent',
      sent_at: new Date(),
      retry_count: 0,
      priority: 'high',
      metadata: JSON.stringify({ source: 'inventory', category: 'stock_alert' }),
    },
    {
      type: 'order',
      title: 'New Order Received',
      message: 'A new order has been placed and requires processing.',
      data: JSON.stringify({ order_id: 'ORD-001', total_items: 5, total_value: 1299.99 }),
      user_id: users[2]?.id || null,
      email: users[2]?.email || null,
      status: 'pending',
      retry_count: 0,
      priority: 'normal',
      metadata: JSON.stringify({ source: 'orders', category: 'new_order' }),
    },
    {
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled system maintenance will occur on Sunday at 2 AM EST.',
      data: JSON.stringify({ maintenance_date: '2025-09-10T06:00:00Z', duration: '2 hours' }),
      user_id: users[3]?.id || null,
      email: users[3]?.email || null,
      status: 'sent',
      sent_at: new Date(),
      retry_count: 0,
      priority: 'normal',
      metadata: JSON.stringify({ source: 'system', category: 'maintenance' }),
    },
    {
      type: 'inventory',
      title: 'Stock Replenishment',
      message: 'Stock for Samsung Galaxy S24 has been replenished. New quantity: 100 units.',
      data: JSON.stringify({ product_sku: 'SGS24-001', previous_stock: 35, new_stock: 100 }),
      user_id: users[4]?.id || null,
      email: users[4]?.email || null,
      status: 'sent',
      sent_at: new Date(),
      read_at: new Date(),
      retry_count: 0,
      priority: 'low',
      metadata: JSON.stringify({ source: 'inventory', category: 'replenishment' }),
    },
    {
      type: 'user',
      title: 'Profile Update Required',
      message: 'Please update your profile information to ensure accurate communication.',
      data: JSON.stringify({ missing_fields: ['phone', 'address'], last_login: new Date().toISOString() }),
      user_id: users[5]?.id || null,
      email: users[5]?.email || null,
      status: 'pending',
      retry_count: 1,
      priority: 'normal',
      metadata: JSON.stringify({ source: 'user', category: 'profile_update' }),
    },
    {
      type: 'security',
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected for your account.',
      data: JSON.stringify({ attempts: 3, last_attempt: new Date().toISOString(), ip_address: '192.168.1.100' }),
      user_id: users[1]?.id || null,
      email: users[1]?.email || null,
      status: 'sent',
      sent_at: new Date(),
      retry_count: 0,
      priority: 'high',
      metadata: JSON.stringify({ source: 'security', category: 'login_alert' }),
    },
    {
      type: 'warehouse',
      title: 'Warehouse Capacity Warning',
      message: 'West Coast Fulfillment warehouse is at 90% capacity.',
      data: JSON.stringify({ warehouse_code: 'WCF-005', capacity_percentage: 90, total_capacity: 10000 }),
      user_id: users[2]?.id || null,
      email: users[2]?.email || null,
      status: 'failed',
      retry_count: 3,
      error_message: 'Email delivery failed - invalid email address',
      priority: 'high',
      metadata: JSON.stringify({ source: 'warehouse', category: 'capacity_warning' }),
    },
  ];

  for (const notification of notifications) {
    await prisma.notifications.create({
      data: notification,
    });
  }

  console.log(`✅ Seeded ${notifications.length} notifications`);
}
