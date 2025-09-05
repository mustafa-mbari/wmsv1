import { PrismaClient } from '@prisma/client';

export async function seedSystemLogs(prisma: PrismaClient) {
  // Get some users for log entries
  const users = await prisma.users.findMany();

  const logs = [
    {
      level: 'info',
      action: 'user_login',
      message: 'User successfully logged in',
      context: JSON.stringify({ 
        session_id: 'sess_12345',
        login_method: 'email_password',
        success: true 
      }),
      user_id: users[0]?.id || null,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      module: 'auth',
      entity_type: 'user',
      entity_id: users[0]?.id || null,
      created_at: new Date(),
    },
    {
      level: 'warning',
      action: 'failed_login',
      message: 'Failed login attempt with incorrect password',
      context: JSON.stringify({ 
        email: 'unknown@example.com',
        reason: 'invalid_password',
        attempt_count: 3 
      }),
      user_id: null,
      ip_address: '192.168.1.101',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      module: 'auth',
      entity_type: 'user',
      entity_id: null,
      created_at: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      level: 'info',
      action: 'product_created',
      message: 'New product added to inventory',
      context: JSON.stringify({ 
        product_sku: 'IPH15PRO-001',
        product_name: 'iPhone 15 Pro',
        initial_stock: 50 
      }),
      user_id: users[1]?.id || null,
      ip_address: '192.168.1.102',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      module: 'inventory',
      entity_type: 'product',
      entity_id: 1,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      level: 'error',
      action: 'database_connection',
      message: 'Database connection timeout',
      context: JSON.stringify({ 
        error: 'Connection timeout after 30s',
        database: 'wms_production',
        retry_attempt: 1 
      }),
      user_id: null,
      ip_address: '10.0.0.50',
      user_agent: 'Internal System',
      module: 'system',
      entity_type: 'database',
      entity_id: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      level: 'info',
      action: 'stock_update',
      message: 'Product stock quantity updated',
      context: JSON.stringify({ 
        product_sku: 'SGS24-001',
        previous_quantity: 35,
        new_quantity: 100,
        change_type: 'restock' 
      }),
      user_id: users[2]?.id || null,
      ip_address: '192.168.1.103',
      user_agent: 'WMS Mobile App v1.2.0',
      module: 'inventory',
      entity_type: 'product',
      entity_id: 2,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      level: 'warning',
      action: 'low_stock_alert',
      message: 'Product stock below minimum threshold',
      context: JSON.stringify({ 
        product_sku: 'IPH15PRO-001',
        current_stock: 10,
        min_threshold: 10,
        alert_triggered: true 
      }),
      user_id: null,
      ip_address: '10.0.0.50',
      user_agent: 'System Scheduler',
      module: 'inventory',
      entity_type: 'product',
      entity_id: 1,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
    },
    {
      level: 'info',
      action: 'user_created',
      message: 'New user account created',
      context: JSON.stringify({ 
        new_user_email: 'kevin.wilson@wms.com',
        created_by: 'admin@wms.com',
        role_assigned: 'viewer' 
      }),
      user_id: users[0]?.id || null,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      module: 'users',
      entity_type: 'user',
      entity_id: users[5]?.id || null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
    },
    {
      level: 'info',
      action: 'warehouse_update',
      message: 'Warehouse information updated',
      context: JSON.stringify({ 
        warehouse_code: 'MDC-001',
        updated_fields: ['phone', 'manager_id'],
        updated_by: 'admin@wms.com' 
      }),
      user_id: users[0]?.id || null,
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      module: 'warehouses',
      entity_type: 'warehouse',
      entity_id: 1,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
    },
  ];

  for (const log of logs) {
    await prisma.system_logs.create({
      data: log,
    });
  }

  console.log(`✅ Seeded ${logs.length} system logs`);
}
