import { PrismaClient } from '@prisma/client';

export async function seedSystemSettings(prisma: PrismaClient) {
  const settings = [
    {
      key: 'app_name',
      value: 'Warehouse Management System',
      type: 'string',
      description: 'Application name displayed in the interface',
      group: 'general',
      is_public: true,
      is_editable: true,
    },
    {
      key: 'company_name',
      value: 'WMS Solutions Inc.',
      type: 'string',
      description: 'Company name for branding and reports',
      group: 'general',
      is_public: true,
      is_editable: true,
    },
    {
      key: 'default_currency',
      value: 'USD',
      type: 'string',
      description: 'Default currency for pricing and financial calculations',
      group: 'financial',
      is_public: true,
      is_editable: true,
    },
    {
      key: 'low_stock_threshold',
      value: '10',
      type: 'number',
      description: 'Default minimum stock level for low stock alerts',
      group: 'inventory',
      is_public: false,
      is_editable: true,
    },
    {
      key: 'email_notifications_enabled',
      value: 'true',
      type: 'boolean',
      description: 'Enable or disable email notifications system-wide',
      group: 'notifications',
      is_public: false,
      is_editable: true,
    },
    {
      key: 'max_login_attempts',
      value: '5',
      type: 'number',
      description: 'Maximum number of failed login attempts before account lockout',
      group: 'security',
      is_public: false,
      is_editable: true,
    },
    {
      key: 'session_timeout',
      value: '3600',
      type: 'number',
      description: 'Session timeout in seconds (1 hour)',
      group: 'security',
      is_public: false,
      is_editable: true,
    },
    {
      key: 'backup_retention_days',
      value: '30',
      type: 'number',
      description: 'Number of days to retain database backups',
      group: 'system',
      is_public: false,
      is_editable: false,
    },
  ];

  for (const setting of settings) {
    await prisma.system_settings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log(`✅ Seeded ${settings.length} system settings`);
}
