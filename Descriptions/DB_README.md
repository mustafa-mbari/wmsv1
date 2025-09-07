# دليل إعداد قاعدة بيانات PostgreSQL - خطة شاملة
# PostgreSQL Database Setup Plan - Complete Guide

## 1. تثبيت وإعداد PostgreSQL الأولي | Initial PostgreSQL Installation & Setup

### تثبيت PostgreSQL | Install PostgreSQL
```powershell
# باستخدام Chocolatey | Using Chocolatey
choco install postgresql

# أو تحميل من الموقع الرسمي | Or download from official website
# https://www.postgresql.org/download/windows/

# أو باستخدام Scoop | Or using Scoop
scoop install postgresql
```

### بدء خدمة PostgreSQL | Start PostgreSQL Service
```powershell
# بدء الخدمة | Start the service
Start-Service postgresql-x64-14

# تعيين الخدمة للبدء التلقائي | Set service to start automatically
Set-Service -Name postgresql-x64-14 -StartupType Automatic

# التحقق من حالة الخدمة | Check service status
Get-Service postgresql-x64-14
```

### الاتصال بـ PostgreSQL لأول مرة | Initial PostgreSQL Connection
```powershell
# فتح PowerShell كمدير | Open PowerShell as Administrator
# الاتصال بقاعدة البيانات كمستخدم postgres | Connect as postgres user
psql -U postgres -d postgres
```

## 2. إنشاء قاعدة البيانات والمستخدمين | Database and User Creation

### إنشاء قاعدة البيانات الرئيسية | Create Main Database
```sql
-- إنشاء قاعدة بيانات المشروع | Create project database
CREATE DATABASE my_project_db;

-- إنشاء قاعدة بيانات للاختبار (اختياري) | Create test database (optional)
CREATE DATABASE my_project_db_test;

-- عرض جميع قواعد البيانات | List all databases
\l
```

### إنشاء المستخدمين والأدوار | Create Users and Roles

#### إنشاء مستخدم التطبيق الرئيسي | Create Main Application User
```sql
-- إنشاء مستخدم التطبيق الرئيسي | Create main application user
CREATE USER app_user WITH PASSWORD 'MyApp123!@#';

-- إنشاء مستخدم الهجرة (صلاحيات أعلى) | Create migration user (elevated privileges)
CREATE USER migration_user WITH PASSWORD 'Migration456!@#';

-- إنشاء مستخدم للقراءة فقط للتقارير | Create read-only user for reports
CREATE USER readonly_user WITH PASSWORD 'ReadOnly789!@#';

-- إنشاء مستخدم للنسخ الاحتياطي | Create backup user
CREATE USER backup_user WITH PASSWORD 'Backup101!@#';
```

#### إنشاء الأدوار المخصصة | Create Custom Roles
```sql
-- إنشاء أدوار مخصصة لإدارة أفضل للصلاحيات | Create custom roles for better permission management
CREATE ROLE app_role;
CREATE ROLE migration_role;
CREATE ROLE readonly_role;
CREATE ROLE backup_role;

-- منح الأدوار للمستخدمين | Grant roles to users
GRANT app_role TO app_user;
GRANT migration_role TO migration_user;
GRANT readonly_role TO readonly_user;
GRANT backup_role TO backup_user;

-- عرض جميع المستخدمين | List all users
\du
```

## 3. إعداد الصلاحيات | Permission Setup

### صلاحيات مستوى قاعدة البيانات | Database-Level Permissions
```sql
-- الاتصال بقاعدة البيانات | Connect to your database
\c my_project_db;

-- منح صلاحيات الاتصال بقاعدة البيانات | Grant database connection permissions
GRANT CONNECT ON DATABASE my_project_db TO app_role;
GRANT CONNECT ON DATABASE my_project_db TO migration_role;
GRANT CONNECT ON DATABASE my_project_db TO readonly_role;
GRANT CONNECT ON DATABASE my_project_db TO backup_role;

-- منح صلاحيات استخدام المخطط | Grant schema usage permissions
GRANT USAGE ON SCHEMA public TO app_role;
GRANT USAGE ON SCHEMA public TO migration_role;
GRANT USAGE ON SCHEMA public TO readonly_role;
GRANT USAGE ON SCHEMA public TO backup_role;
```

### صلاحيات مستوى الجداول | Table-Level Permissions
```sql
-- دور الهجرة (صلاحيات كاملة لتغيير المخطط) | Migration role (full permissions for schema changes)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO migration_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO migration_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO migration_role;
GRANT CREATE ON SCHEMA public TO migration_role;

-- دور التطبيق (عمليات CRUD) | App role (CRUD operations)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_role;

-- دور القراءة فقط | Readonly role (select only)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_role;

-- دور النسخ الاحتياطي | Backup role
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_role;

-- تعيين الصلاحيات الافتراضية للكائنات المستقبلية | Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO migration_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_role;
```

## 4. إعداد البيئة | Environment Configuration

### إنشاء ملفات .env | Create .env files
```powershell
# إنشاء مجلد المشروع | Create project directory
New-Item -ItemType Directory -Path "C:\MyProject" -Force
Set-Location "C:\MyProject"

# إنشاء ملف .env للتطوير | Create .env for development
@"
# إعدادات قاعدة البيانات للتطوير | Database settings for development
DATABASE_URL="postgresql://app_user:MyApp123!@#@localhost:5432/my_project_db"
MIGRATION_DATABASE_URL="postgresql://migration_user:Migration456!@#@localhost:5432/my_project_db"
BACKUP_DATABASE_URL="postgresql://backup_user:Backup101!@#@localhost:5432/my_project_db"

# إعدادات التطبيق | Application settings
NODE_ENV=development
PORT=3000
"@ | Out-File -FilePath ".env" -Encoding UTF8

# إنشاء ملف .env.test للاختبار | Create .env.test for testing
@"
# إعدادات قاعدة البيانات للاختبار | Database settings for testing
DATABASE_URL="postgresql://app_user:MyApp123!@#@localhost:5432/my_project_db_test"
NODE_ENV=test
"@ | Out-File -FilePath ".env.test" -Encoding UTF8

# إنشاء ملف .env.production للإنتاج | Create .env.production for production
@"
# إعدادات قاعدة البيانات للإنتاج | Database settings for production
DATABASE_URL="postgresql://app_user:STRONG_PRODUCTION_PASSWORD@your-production-host:5432/my_project_db"
NODE_ENV=production
"@ | Out-File -FilePath ".env.production" -Encoding UTF8
```

## 5. إعداد نظام الهجرة مع Prisma | Migration Setup with Prisma

### تثبيت Node.js و npm | Install Node.js and npm
```powershell
# باستخدام Chocolatey | Using Chocolatey
choco install nodejs

# أو باستخدام Scoop | Or using Scoop
scoop install nodejs

# التحقق من التثبيت | Verify installation
node --version
npm --version
```

### تهيئة المشروع وتثبيت Prisma | Initialize Project and Install Prisma
```powershell
# تهيئة مشروع Node.js جديد | Initialize new Node.js project
npm init -y

# تثبيت Prisma | Install Prisma
npm install prisma @prisma/client
npm install -D prisma tsx typescript @types/node

# تهيئة Prisma | Initialize Prisma
npx prisma init
```

### إعداد ملف schema.prisma | Configure schema.prisma
```powershell
# إنشاء ملف المخطط | Create schema file
@"
// مولد العميل | Client generator
generator client {
  provider = "prisma-client-js"
}

// مصدر قاعدة البيانات | Database source
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// نموذج المستخدم | User model
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
  profile   Profile?

  @@map("users")
}

// نموذج الملف الشخصي | Profile model
model Profile {
  id       Int     @id @default(autoincrement())
  bio      String?
  avatar   String?
  userId   Int     @unique
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

// نموذج المنشور | Post model
model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  tags      String[]
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  comments  Comment[]

  @@map("posts")
}

// نموذج التعليق | Comment model
model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  postId    Int
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@map("comments")
}

// نموذج الفئة | Category model
model Category {
  id          Int    @id @default(autoincrement())
  name        String @unique
  description String?
  createdAt   DateTime @default(now())

  @@map("categories")
}
"@ | Out-File -FilePath "prisma\schema.prisma" -Encoding UTF8
```

### إنشاء وتشغيل الهجرات | Create and Run Migrations
```powershell
# إنشاء الهجرة الأولية | Create initial migration
npx prisma migrate dev --name "initial_migration"

# إنشاء هجرات إضافية | Create additional migrations
npx prisma migrate dev --name "add_user_profile"
npx prisma migrate dev --name "add_post_comments"
npx prisma migrate dev --name "add_categories"

# تطبيق الهجرات على الإنتاج | Apply migrations to production
npx prisma migrate deploy

# إعادة تعيين قاعدة البيانات (احذر: سيحذف البيانات!) | Reset database (Warning: will delete data!)
npx prisma migrate reset

# عرض حالة الهجرات | Show migration status
npx prisma migrate status
```

## 6. إعداد البيانات الأولية (Seeds) | Seed Data Setup

### إنشاء ملف البذور | Create Seed File
```powershell
# إنشاء مجلد prisma إذا لم يكن موجوداً | Create prisma directory if not exists
New-Item -ItemType Directory -Path "prisma" -Force

# إنشاء ملف seed.ts | Create seed.ts file
@"
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 بدء عملية زراعة البيانات... | Starting seed process...')

  // إنشاء المستخدمين التجريبيين | Create sample users
  const user1 = await prisma.user.upsert({
    where: { email: 'ahmed@example.com' },
    update: {},
    create: {
      email: 'ahmed@example.com',
      name: 'أحمد محمد',
      phone: '+201234567890',
      profile: {
        create: {
          bio: 'مطور برمجيات متخصص في تطوير المواقع',
          avatar: 'https://example.com/avatars/ahmed.jpg'
        }
      },
      posts: {
        create: [
          {
            title: 'مرحباً بكم في مدونتي',
            content: 'هذه أول مشاركة لي في المدونة. أتطلع لمشاركة المزيد من المحتوى المفيد.',
            published: true,
            tags: ['ترحيب', 'مدونة', 'أول مشاركة'],
            comments: {
              create: [
                { content: 'مرحباً! منشور رائع' },
                { content: 'نتطلع للمزيد من المحتوى' }
              ]
            }
          },
          {
            title: 'نصائح في البرمجة',
            content: 'في هذا المنشور، سأشارك بعض النصائح المهمة في البرمجة...',
            published: false,
            tags: ['برمجة', 'نصائح', 'تطوير'],
          },
        ],
      },
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'fatima@example.com' },
    update: {},
    create: {
      email: 'fatima@example.com',
      name: 'فاطمة علي',
      phone: '+201987654321',
      profile: {
        create: {
          bio: 'مصممة UI/UX ومحبة للتكنولوجيا',
          avatar: 'https://example.com/avatars/fatima.jpg'
        }
      },
      posts: {
        create: [
          {
            title: 'أساسيات تصميم واجهات المستخدم',
            content: 'تصميم واجهات المستخدم فن وعلم. دعونا نتعلم الأساسيات...',
            published: true,
            tags: ['تصميم', 'UI', 'UX', 'واجهات'],
            comments: {
              create: [
                { content: 'شرح ممتاز ومفصل!' },
              ]
            }
          },
        ],
      },
    },
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'omar@example.com' },
    update: {},
    create: {
      email: 'omar@example.com',
      name: 'عمر حسن',
      phone: '+201555666777',
      profile: {
        create: {
          bio: 'مدير مشاريع تقنية وخبير في إدارة الفرق',
        }
      },
      posts: {
        create: [
          {
            title: 'إدارة المشاريع التقنية',
            content: 'نصائح مهمة لإدارة المشاريع التقنية بكفاءة عالية...',
            published: true,
            tags: ['إدارة', 'مشاريع', 'قيادة'],
          },
        ],
      },
    },
  })

  // إنشاء الفئات | Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'تقنية' },
      update: {},
      create: { name: 'تقنية', description: 'مواضيع متعلقة بالتكنولوجيا والبرمجة' }
    }),
    prisma.category.upsert({
      where: { name: 'تصميم' },
      update: {},
      create: { name: 'تصميم', description: 'مواضيع متعلقة بالتصميم والإبداع' }
    }),
    prisma.category.upsert({
      where: { name: 'إدارة' },
      update: {},
      create: { name: 'إدارة', description: 'مواضيع متعلقة بإدارة المشاريع والفرق' }
    })
  ])

  console.log('✅ تم إنشاء البيانات بنجاح | Data created successfully:', { 
    users: [user1.name, user2.name, user3.name],
    categories: categories.map(c => c.name)
  })
}

main()
  .catch((e) => {
    console.error('❌ خطأ في زراعة البيانات | Error in seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.\$disconnect()
    console.log('🔌 تم قطع الاتصال من قاعدة البيانات | Disconnected from database')
  })
"@ | Out-File -FilePath "prisma\seed.ts" -Encoding UTF8
```

### إعداد package.json للبذور | Configure package.json for Seeding
```powershell
# قراءة ملف package.json الحالي | Read current package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json

# إضافة إعدادات Prisma | Add Prisma configuration
$packageJson | Add-Member -MemberType NoteProperty -Name "prisma" -Value @{
  seed = "tsx prisma/seed.ts"
} -Force

# إعادة كتابة الملف | Rewrite the file
$packageJson | ConvertTo-Json -Depth 10 | Out-File "package.json" -Encoding UTF8
```

### تشغيل البذور | Run Seeds
```powershell
# تشغيل البذور | Run seeds
npx prisma db seed

# إعادة تعيين قاعدة البيانات وتشغيل البذور | Reset database and run seeds
npx prisma migrate reset

# توليد عميل Prisma | Generate Prisma client
npx prisma generate

# فتح Prisma Studio لاستعراض البيانات | Open Prisma Studio to browse data
npx prisma studio
```

## 7. أفضل الممارسات الأمنية | Security Best Practices

### أمان قاعدة البيانات | Database Security
```sql
-- إنشاء مخططات محددة لتنظيم أفضل | Create specific schemas for better organization
CREATE SCHEMA app_schema;
CREATE SCHEMA migration_schema;
CREATE SCHEMA admin_schema;

-- نقل الوظائف الحساسة إلى مخطط منفصل | Move sensitive functions to separate schema
CREATE SCHEMA sensitive_schema;

-- إلغاء صلاحيات المخطط العام | Revoke public schema permissions
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE my_project_db FROM PUBLIC;

-- تفعيل تسجيل العمليات | Enable logging
-- يتم هذا في ملف postgresql.conf
```

### إعداد الاتصال الآمن | Secure Connection Setup
```powershell
# إنشاء ملف إعدادات الأمان | Create security configuration file
@"
# إعدادات الأمان لقاعدة البيانات | Database security settings

# استخدام SSL في الإنتاج | Use SSL in production
DATABASE_SSL=true
DATABASE_SSL_CERT_PATH="./certs/client-cert.pem"
DATABASE_SSL_KEY_PATH="./certs/client-key.pem"
DATABASE_SSL_CA_PATH="./certs/ca-cert.pem"

# إعدادات Connection Pool | Connection Pool settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=30000

# إعدادات المهلة الزمنية | Timeout settings
DATABASE_CONNECT_TIMEOUT=60
DATABASE_QUERY_TIMEOUT=30
"@ | Out-File -FilePath "database-security.env" -Encoding UTF8
```

## 8. استراتيجية النسخ الاحتياطي | Backup Strategy

### إنشاء سكريبت النسخ الاحتياطي | Create Backup Script
```powershell
# إنشاء مجلد النسخ الاحتياطي | Create backup directory
New-Item -ItemType Directory -Path "C:\DatabaseBackups" -Force

# إنشاء سكريبت النسخ الاحتياطي | Create backup script
@"
# سكريبت النسخ الاحتياطي التلقائي | Automated Backup Script
# نسخ احتياطي كامل لقاعدة البيانات | Full database backup

param(
    [string]\$DatabaseName = "my_project_db",
    [string]\$BackupPath = "C:\DatabaseBackups",
    [string]\$Username = "backup_user"
)

# إنشاء اسم الملف مع التاريخ والوقت | Create filename with date and time
\$DateTime = Get-Date -Format "yyyyMMdd_HHmmss"
\$BackupFile = "\$BackupPath\backup_\$DatabaseName_\$DateTime.sql"

Write-Host "🔄 بدء النسخ الاحتياطي... | Starting backup..." -ForegroundColor Yellow
Write-Host "📂 الملف: \$BackupFile | File: \$BackupFile" -ForegroundColor Cyan

try {
    # تنفيذ النسخ الاحتياطي | Execute backup
    \$env:PGPASSWORD = "Backup101!@#"
    pg_dump -U \$Username -h localhost \$DatabaseName > \$BackupFile
    
    if (\$LASTEXITCODE -eq 0) {
        Write-Host "✅ تم النسخ الاحتياطي بنجاح | Backup completed successfully" -ForegroundColor Green
        
        # عرض حجم الملف | Show file size
        \$FileSize = (Get-Item \$BackupFile).Length
        \$FileSizeMB = [math]::Round(\$FileSize / 1MB, 2)
        Write-Host "📊 حجم الملف: \$FileSizeMB MB | File size: \$FileSizeMB MB" -ForegroundColor Cyan
        
        # حذف النسخ الاحتياطية القديمة (أكثر من 7 أيام) | Delete old backups (older than 7 days)
        Get-ChildItem \$BackupPath -Name "backup_*.sql" | 
        Where-Object { \$_.CreationTime -lt (Get-Date).AddDays(-7) } | 
        Remove-Item -Force
        
        Write-Host "🧹 تم حذف النسخ الاحتياطية القديمة | Old backups cleaned up" -ForegroundColor Green
    } else {
        Write-Host "❌ فشل في النسخ الاحتياطي | Backup failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ خطأ: \$_.Exception.Message | Error: \$_.Exception.Message" -ForegroundColor Red
} finally {
    # إزالة كلمة المرور من البيئة | Remove password from environment
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
"@ | Out-File -FilePath "backup-script.ps1" -Encoding UTF8

Write-Host "✅ تم إنشاء سكريبت النسخ الاحتياطي | Backup script created"
```

### أوامر النسخ الاحتياطي والاستعادة | Backup and Restore Commands
```powershell
# تشغيل النسخ الاحتياطي | Run backup
.\backup-script.ps1

# نسخ احتياطي يدوي | Manual backup
$env:PGPASSWORD = "Backup101!@#"
pg_dump -U backup_user -h localhost my_project_db > "backup_manual_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"

# نسخ احتياطي للمخطط فقط | Schema-only backup
pg_dump -U backup_user -h localhost --schema-only my_project_db > "schema_only.sql"

# نسخ احتياطي للبيانات فقط | Data-only backup
pg_dump -U backup_user -h localhost --data-only my_project_db > "data_only.sql"

# استعادة من النسخة الاحتياطية | Restore from backup
psql -U migration_user -h localhost my_project_db < "backup_file.sql"

# استعادة مع إعادة إنشاء قاعدة البيانات | Restore with database recreation
dropdb -U postgres my_project_db
createdb -U postgres my_project_db
psql -U migration_user -h localhost my_project_db < "backup_file.sql"
```

## 9. سير العمل التطويري | Development Workflow

### العمل اليومي في التطوير | Daily Development Workflow
```powershell
# سحب أحدث تحديثات الكود | Pull latest code updates
git pull origin main

# تشغيل الهجرات | Run migrations
npx prisma migrate dev

# توليد عميل Prisma | Generate Prisma client
npx prisma generate

# تشغيل الخادم التطويري | Start development server
npm run dev

# أو تشغيل كل شيء في أمر واحد | Or run everything in one command
npx prisma migrate dev && npx prisma generate && npm run dev
```

### سير العمل لتغييرات قاعدة البيانات | Database Changes Workflow
```powershell
# 1. تعديل ملف schema.prisma | 1. Modify schema.prisma file
# 2. إنشاء هجرة جديدة | 2. Create new migration
npx prisma migrate dev --name "add_user_avatar_field"

# 3. اختبار الهجرة محلياً | 3. Test migration locally
npx prisma studio

# 4. إضافة التغييرات إلى Git | 4. Add changes to Git
git add prisma/
git commit -m "feat: add avatar field to user model"

# 5. رفع التغييرات | 5. Push changes
git push origin feature/user-avatar
```

### نشر الإنتاج | Production Deployment
```powershell
# تطبيق الهجرات على الإنتاج | Apply migrations to production
$env:DATABASE_URL = "postgresql://app_user:PROD_PASSWORD@prod-host:5432/my_project_db"
npx prisma migrate deploy

# توليد عميل الإنتاج | Generate production client
npx prisma generate

# بناء التطبيق | Build application
npm run build

# بدء تشغيل الإنتاج | Start production
npm start
```

## 10. المراقبة والصيانة | Monitoring and Maintenance

### المهام الدورية | Regular Tasks
```sql
-- مراقبة حجم قاعدة البيانات | Monitor database size
SELECT 
    pg_size_pretty(pg_database_size('my_project_db')) AS "حجم قاعدة البيانات | Database Size";

-- مراقبة أحجام الجداول | Monitor table sizes
SELECT 
    schemaname AS "المخطط | Schema",
    tablename AS "اسم الجدول | Table Name",
    pg_size_pretty(pg_total_relation_size(tablename::text)) AS "الحجم | Size"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC;

-- مراقبة الاتصالات النشطة | Monitor active connections
SELECT 
    datname AS "قاعدة البيانات | Database",
    usename AS "المستخدم | User",
    application_name AS "التطبيق | Application",
    client_addr AS "عنوان العميل | Client Address",
    state AS "الحالة | State",
    query_start AS "بداية الاستعلام | Query Start"
FROM pg_stat_activity 
WHERE datname = 'my_project_db';

-- تحديث الإحصائيات | Update statistics
ANALYZE;

-- تنظيف قاعدة البيانات | Clean up database
VACUUM ANALYZE;
```

### أوامر PowerShell للمراقبة | PowerShell Monitoring Commands
```powershell
# إنشاء سكريبت المراقبة | Create monitoring script
@"
# سكريبت مراقبة قاعدة البيانات | Database Monitoring Script

param(
    [string]$DatabaseName = "my_project_db",
    [string]$Username = "readonly_user",
    [switch]$ShowConnections,
    [switch]$ShowSizes,
    [switch]$ShowPerformance
)

Write-Host "🔍 مراقبة قاعدة البيانات | Database Monitoring" -ForegroundColor Cyan
Write-Host "📊 قاعدة البيانات: $DatabaseName | Database: $DatabaseName" -ForegroundColor Yellow

$env:PGPASSWORD = "ReadOnly789!@#"

if ($ShowSizes -or (!$ShowConnections -and !$ShowPerformance)) {
    Write-Host "`n📏 أحجام الجداول | Table Sizes:" -ForegroundColor Green
    $sizeQuery = @"
SELECT 
    schemaname AS schema,
    tablename AS table_name,
    pg_size_pretty(pg_total_relation_size(tablename::text)) AS size,
    pg_total_relation_size(tablename::text) AS size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::text) DESC
LIMIT 10;
"@
    psql -U $Username -h localhost -d $DatabaseName -c $sizeQuery
}

if ($ShowConnections -or (!$ShowSizes -and !$ShowPerformance)) {
    Write-Host "`n🔗 الاتصالات النشطة | Active Connections:" -ForegroundColor Green
    $connQuery = @"
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    query_start
FROM pg_stat_activity 
WHERE datname = '$DatabaseName'
ORDER BY query_start DESC;
"@
    psql -U $Username -h localhost -d $DatabaseName -c $connQuery
}

if ($ShowPerformance -or (!$ShowSizes -and !$ShowConnections)) {
    Write-Host "`n⚡ إحصائيات الأداء | Performance Stats:" -ForegroundColor Green
    $perfQuery = @"
SELECT 
    schemaname,
    tablename,
    seq_scan as sequential_scans,
    seq_tup_read as seq_tuples_read,
    idx_scan as index_scans,
    idx_tup_fetch as idx_tuples_fetched,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY seq_scan DESC
LIMIT 10;
"@
    psql -U $Username -h localhost -d $DatabaseName -c $perfQuery
}

# إزالة كلمة المرور من البيئة | Remove password from environment
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "`n✅ تم الانتهاء من المراقبة | Monitoring completed" -ForegroundColor Green
"@ | Out-File -FilePath "monitor-database.ps1" -Encoding UTF8

# إنشاء سكريپت صيانة دوري | Create maintenance script
@"
# سكريپت الصيانة الدورية | Regular Maintenance Script

param(
    [string]$DatabaseName = "my_project_db",
    [string]$Username = "migration_user",
    [switch]$FullMaintenance
)

Write-Host "🔧 بدء صيانة قاعدة البيانات | Starting database maintenance" -ForegroundColor Cyan

$env:PGPASSWORD = "Migration456!@#"

try {
    if ($FullMaintenance) {
        Write-Host "🧹 تنظيف شامل لقاعدة البيانات | Full database cleanup" -ForegroundColor Yellow
        
        # تنظيف شامل | Full vacuum
        psql -U $Username -h localhost -d $DatabaseName -c "VACUUM FULL ANALYZE;"
        
        # إعادة فهرسة | Reindex
        psql -U $Username -h localhost -d $DatabaseName -c "REINDEX DATABASE $DatabaseName;"
        
    } else {
        Write-Host "🧹 تنظيف سريع لقاعدة البيانات | Quick database cleanup" -ForegroundColor Yellow
        
        # تنظيف سريع | Quick vacuum
        psql -U $Username -h localhost -d $DatabaseName -c "VACUUM ANALYZE;"
    }
    
    # تحديث الإحصائيات | Update statistics
    Write-Host "📊 تحديث إحصائيات قاعدة البيانات | Updating database statistics" -ForegroundColor Yellow
    psql -U $Username -h localhost -d $DatabaseName -c "ANALYZE;"
    
    # التحقق من سلامة البيانات | Check data integrity
    Write-Host "🔍 التحقق من سلامة البيانات | Checking data integrity" -ForegroundColor Yellow
    $integrityCheck = psql -U $Username -h localhost -d $DatabaseName -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
    
    Write-Host "✅ تم الانتهاء من الصيانة بنجاح | Maintenance completed successfully" -ForegroundColor Green
    
} catch {
    Write-Host "❌ خطأ في الصيانة: $_.Exception.Message | Maintenance error: $_.Exception.Message" -ForegroundColor Red
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}
"@ | Out-File -FilePath "maintenance-database.ps1" -Encoding UTF8
```

### جدولة المهام التلقائية | Automated Task Scheduling
```powershell
# إنشاء مهمة النسخ الاحتياطي اليومي | Create daily backup task
$BackupAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\MyProject\backup-script.ps1"
$BackupTrigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
$BackupSettings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "PostgreSQL Daily Backup" -Action $BackupAction -Trigger $BackupTrigger -Settings $BackupSettings -Description "نسخ احتياطي يومي لقاعدة البيانات | Daily database backup"

# إنشاء مهمة الصيانة الأسبوعية | Create weekly maintenance task
$MaintenanceAction = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-File C:\MyProject\maintenance-database.ps1"
$MaintenanceTrigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At "03:00AM"
Register-ScheduledTask -TaskName "PostgreSQL Weekly Maintenance" -Action $MaintenanceAction -Trigger $MaintenanceTrigger -Settings $BackupSettings -Description "صيانة أسبوعية لقاعدة البيانات | Weekly database maintenance"

# عرض المهام المجدولة | Show scheduled tasks
Get-ScheduledTask | Where-Object {$_.TaskName -like "*PostgreSQL*"} | Format-Table TaskName, State, NextRunTime
```

## 11. إعداد تطبيق Node.js مع قاعدة البيانات | Node.js Application Setup with Database

### إنشاء تطبيق Node.js أساسي | Create Basic Node.js Application
```powershell
# إنشاء ملف app.js الرئيسي | Create main app.js file
@"
// تطبيق Node.js مع Express و Prisma | Node.js app with Express and Prisma
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// إعدادات الأمان والوسائط | Security and middleware setup
app.use(helmet()); // حماية أساسية | Basic security
app.use(cors()); // السماح بطلبات من أصول مختلفة | Allow cross-origin requests
app.use(express.json()); // تحليل JSON | Parse JSON
app.use(express.urlencoded({ extended: true })); // تحليل URL encoded

// Routes أساسية | Basic routes

// الصفحة الرئيسية | Home page
app.get('/', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    
    res.json({
      message: 'مرحباً بكم في API الخاص بنا | Welcome to our API',
      database_status: 'متصل | Connected',
      statistics: {
        users: userCount,
        posts: postCount
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'خطأ في الاتصال بقاعدة البيانات | Database connection error',
      error: error.message
    });
  }
});

// جلب جميع المستخدمين | Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        posts: {
          include: {
            comments: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المستخدمين | Error fetching users',
      error: error.message
    });
  }
});

// إنشاء مستخدم جديد | Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, phone, bio } = req.body;
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        profile: bio ? {
          create: { bio }
        } : undefined
      },
      include: {
        profile: true
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء المستخدم بنجاح | User created successfully',
      data: user
    });
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        message: 'البريد الإلكتروني مستخدم مسبقاً | Email already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'خطأ في إنشاء المستخدم | Error creating user',
        error: error.message
      });
    }
  }
});

// جلب المنشورات | Get posts
app.get('/api/posts', async (req, res) => {
  try {
    const { published, authorId } = req.query;
    
    const posts = await prisma.post.findMany({
      where: {
        ...(published && { published: published === 'true' }),
        ...(authorId && { authorId: parseInt(authorId) })
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المنشورات | Error fetching posts',
      error: error.message
    });
  }
});

// إنشاء منشور جديد | Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, authorId, tags, published = false } = req.body;
    
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: parseInt(authorId),
        tags: tags || [],
        published
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء المنشور بنجاح | Post created successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المنشور | Error creating post',
      error: error.message
    });
  }
});

// التعامل مع الأخطاء | Error handling
app.use((err, req, res, next) => {
  console.error('خطأ في الخادم | Server error:', err);
  res.status(500).json({
    success: false,
    message: 'خطأ داخلي في الخادم | Internal server error'
  });
});

// التعامل مع المسارات غير الموجودة | Handle 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود | Route not found'
  });
});

// بدء تشغيل الخادم | Start server
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT} | Server running on port ${PORT}`);
  console.log(`🔗 الرابط: http://localhost:${PORT} | URL: http://localhost:${PORT}`);
});

// إغلاق اتصال Prisma عند إيقاف التطبيق | Close Prisma connection on app shutdown
process.on('SIGINT', async () => {
  console.log('🔌 إغلاق اتصال قاعدة البيانات... | Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});
"@ | Out-File -FilePath "app.js" -Encoding UTF8

# تثبيت التبعيات المطلوبة | Install required dependencies
npm install express cors helmet dotenv
npm install -D nodemon

# تحديث package.json بالسكريپتات | Update package.json with scripts
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$packageJson.scripts = @{
  "start" = "node app.js"
  "dev" = "nodemon app.js"
  "db:migrate" = "npx prisma migrate dev"
  "db:generate" = "npx prisma generate"
  "db:seed" = "npx prisma db seed"
  "db:reset" = "npx prisma migrate reset"
  "db:studio" = "npx prisma studio"
  "db:backup" = "powershell -File backup-script.ps1"
  "db:monitor" = "powershell -File monitor-database.ps1"
}
$packageJson | ConvertTo-Json -Depth 10 | Out-File "package.json" -Encoding UTF8
```

### إنشاء ملفات اختبار API | Create API Test Files
```powershell
# إنشاء مجلد الاختبارات | Create tests directory
New-Item -ItemType Directory -Path "tests" -Force

# إنشاء ملف اختبار API | Create API test file
@"
// ملف اختبار API | API Test File
// استخدم هذا الملف مع REST Client في VS Code أو Postman

### اختبار الصفحة الرئيسية | Test homepage
GET http://localhost:3000/
Content-Type: application/json

###

### جلب جميع المستخدمين | Get all users
GET http://localhost:3000/api/users
Content-Type: application/json

###

### إنشاء مستخدم جديد | Create new user
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "سارة أحمد",
  "email": "sara.ahmed@example.com",
  "phone": "+201122334455",
  "bio": "مطورة تطبيقات الجوال وخبيرة في React Native"
}

###

### جلب المنشورات المنشورة فقط | Get published posts only
GET http://localhost:3000/api/posts?published=true
Content-Type: application/json

###

### إنشاء منشور جديد | Create new post
POST http://localhost:3000/api/posts
Content-Type: application/json

{
  "title": "دليل تعلم PostgreSQL",
  "content": "في هذا المنشور سنتعلم كيفية استخدام PostgreSQL مع Node.js...",
  "authorId": 1,
  "tags": ["قواعد البيانات", "PostgreSQL", "Node.js"],
  "published": true
}

###

### اختبار خطأ - بريد إلكتروني مكرر | Test error - duplicate email
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "مستخدم آخر",
  "email": "ahmed@example.com",
  "phone": "+201999888777"
}
"@ | Out-File -FilePath "tests\api-tests.http" -Encoding UTF8
```

## 12. نصائح استكشاف الأخطاء وإصلاحها | Troubleshooting Tips

### مشاكل شائعة وحلولها | Common Issues and Solutions
```powershell
# إنشاء دليل استكشاف الأخطاء | Create troubleshooting guide
@"
# دليل استكشاف الأخطاء وإصلاحها | Troubleshooting Guide

## 1. مشاكل الاتصال | Connection Issues

### المشكلة: فشل الاتصال بقاعدة البيانات | Issue: Database connection failed
```powershell
# التحقق من حالة خدمة PostgreSQL | Check PostgreSQL service status
Get-Service postgresql*

# بدء تشغيل الخدمة إذا كانت متوقفة | Start service if stopped
Start-Service postgresql-x64-14

# التحقق من المنفذ | Check port
netstat -an | Select-String ":5432"
```

### المشكلة: خطأ في كلمة المرور | Issue: Password authentication failed
```sql
-- إعادة تعيين كلمة مرور المستخدم | Reset user password
ALTER USER app_user PASSWORD 'NewPassword123!';
```

## 2. مشاكل الهجرة | Migration Issues

### المشكلة: فشل في تطبيق الهجرة | Issue: Migration failed to apply
```powershell
# التحقق من حالة الهجرات | Check migration status
npx prisma migrate status

# إعادة تعيين قاعدة البيانات | Reset database
npx prisma migrate reset

# تطبيق هجرة محددة | Apply specific migration
npx prisma migrate resolve --applied "migration_name"
```

### المشكلة: تضارب في المخطط | Issue: Schema drift detected
```powershell
# إنشاء هجرة لحل التضارب | Create migration to resolve drift
npx prisma db push --accept-data-loss

# أو إنشاء هجرة جديدة | Or create new migration
npx prisma migrate dev --create-only
```

## 3. مشاكل الأداء | Performance Issues

### المشكلة: استعلامات بطيئة | Issue: Slow queries
```sql
-- تفعيل تسجيل الاستعلامات البطيئة | Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second
SELECT pg_reload_conf();

-- عرض الاستعلامات النشطة | Show active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

### المشكلة: استهلاك ذاكرة مرتفع | Issue: High memory usage
```sql
-- تنظيف الذاكرة | Clean up memory
VACUUM FULL;
REINDEX DATABASE my_project_db;

-- التحقق من إحصائيات الجداول | Check table statistics
SELECT schemaname, tablename, n_dead_tup, n_live_tup 
FROM pg_stat_user_tables 
WHERE n_dead_tup > 1000;
```

## 4. مشاكل النسخ الاحتياطي | Backup Issues

### المشكلة: فشل النسخ الاحتياطي | Issue: Backup failed
```powershell
# التحقق من الصلاحيات | Check permissions
Test-Path "C:\DatabaseBackups" -PathType Container

# إنشاء المجلد إذا لم يكن موجود | Create directory if not exists
New-Item -ItemType Directory -Path "C:\DatabaseBackups" -Force

# تشغيل نسخ احتياطي تجريبي | Run test backup
pg_dump --help
```

## 5. أوامر تشخيص مفيدة | Useful Diagnostic Commands

```powershell
# فحص شامل للنظام | System health check
@"
# تشخيص شامل لقاعدة البيانات | Comprehensive Database Diagnostics

Write-Host "🔍 تشخيص شامل لقاعدة البيانات | Comprehensive Database Diagnostics" -ForegroundColor Cyan

# 1. حالة الخدمة | Service status
Write-Host "`n1️⃣ حالة خدمة PostgreSQL | PostgreSQL Service Status:" -ForegroundColor Yellow
Get-Service postgresql* | Format-Table Name, Status, StartType

# 2. استخدام المنفذ | Port usage
Write-Host "`n2️⃣ استخدام المنفذ 5432 | Port 5432 Usage:" -ForegroundColor Yellow
netstat -an | Select-String ":5432"

# 3. اختبار الاتصال | Connection test
Write-Host "`n3️⃣ اختبار الاتصال | Connection Test:" -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "MyApp123!@#"
    $result = psql -U app_user -h localhost -d my_project_db -c "SELECT version();"
    Write-Host "✅ الاتصال ناجح | Connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ فشل الاتصال | Connection failed: $_" -ForegroundColor Red
} finally {
    Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
}

# 4. مساحة القرص | Disk space
Write-Host "`n4️⃣ مساحة القرص | Disk Space:" -ForegroundColor Yellow
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="FreeSpace(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}}

# 5. استخدام الذاكرة | Memory usage
Write-Host "`n5️⃣ استخدام الذاكرة | Memory Usage:" -ForegroundColor Yellow
Get-Process postgres* | Select-Object ProcessName, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet/1MB,2)}}

Write-Host "`n✅ انتهى التشخيص | Diagnostics completed" -ForegroundColor Green
"@ | Out-File -FilePath "diagnose-system.ps1" -Encoding UTF8
```

## 6. سكريپت الإصلاح التلقائي | Auto-fix Script
```powershell
# سكريپت إصلاح المشاكل الشائعة | Common issues auto-fix script
@"
# سكريپت الإصلاح التلقائي | Auto-fix Script

param(
    [switch]$FixService,
    [switch]$FixPermissions,
    [switch]$FixDatabase,
    [switch]$FixAll
)

Write-Host "🔧 بدء الإصلاح التلقائي | Starting auto-fix" -ForegroundColor Cyan

if ($FixAll -or $FixService) {
    Write-Host "`n🔄 إصلاح خدمة PostgreSQL | Fixing PostgreSQL service" -ForegroundColor Yellow
    try {
        $service = Get-Service postgresql* | Select-Object -First 1
        if ($service.Status -ne 'Running') {
            Start-Service $service.Name
            Write-Host "✅ تم بدء تشغيل الخدمة | Service started" -ForegroundColor Green
        } else {
            Write-Host "✅ الخدمة تعمل بالفعل | Service already running" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ فشل في إصلاح الخدمة | Failed to fix service: $_" -ForegroundColor Red
    }
}

if ($FixAll -or $FixPermissions) {
    Write-Host "`n🔐 إصلاح الصلاحيات | Fixing permissions" -ForegroundColor Yellow
    try {
        # إنشاء مجلدات النسخ الاحتياطي | Create backup directories
        New-Item -ItemType Directory -Path "C:\DatabaseBackups" -Force | Out-Null
        Write-Host "✅ تم إنشاء مجلد النسخ الاحتياطي | Backup directory created" -ForegroundColor Green
    } catch {
        Write-Host "❌ فشل في إصلاح الصلاحيات | Failed to fix permissions: $_" -ForegroundColor Red
    }
}

if ($FixAll -or $FixDatabase) {
    Write-Host "`n🗄️ إصلاح قاعدة البيانات | Fixing database" -ForegroundColor Yellow
    try {
        # تحديث إحصائيات قاعدة البيانات | Update database statistics
        $env:PGPASSWORD = "Migration456!@#"
        psql -U migration_user -h localhost -d my_project_db -c "ANALYZE;"
        Write-Host "✅ تم تحديث إحصائيات قاعدة البيانات | Database statistics updated" -ForegroundColor Green
        
        # تنظيف قاعدة البيانات | Clean database
        psql -U migration_user -h localhost -d my_project_db -c "VACUUM;"
        Write-Host "✅ تم تنظيف قاعدة البيانات | Database cleaned" -ForegroundColor Green
    } catch {
        Write-Host "❌ فشل في إصلاح قاعدة البيانات | Failed to fix database: $_" -ForegroundColor Red
    } finally {
        Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
    }
}

Write-Host "`n✅ انتهى الإصلاح التلقائي | Auto-fix completed" -ForegroundColor Green
"@ | Out-File -FilePath "auto-fix.ps1" -Encoding UTF8
```
"@ | Out-File -FilePath "troubleshooting-guide.md" -Encoding UTF8
```

## 13. الأوامر النهائية لبدء التشغيل | Final Startup Commands

### تشغيل كامل للمشروع | Complete Project Startup
```powershell
# سكريپت بدء التشغيل الكامل | Complete startup script
Write-Host "🚀 بدء تشغيل المشروع | Starting project" -ForegroundColor Cyan

# 1. التحقق من خدمة PostgreSQL | Check PostgreSQL service
Write-Host "`n1️⃣ التحقق من خدمة PostgreSQL | Checking PostgreSQL service" -ForegroundColor Yellow
$pgService = Get-Service postgresql* | Select-Object -First 1
if ($pgService.Status -ne 'Running') {
    Start-Service $pgService.Name
    Write-Host "✅ تم بدء تشغيل PostgreSQL | PostgreSQL started" -ForegroundColor Green
} else {
    Write-Host "✅ PostgreSQL يعمل بالفعل | PostgreSQL already running" -ForegroundColor Green
}

# 2. تطبيق الهجرات | Apply migrations
Write-Host "`n2️⃣ تطبيق هجرات قاعدة البيانات | Applying database migrations" -ForegroundColor Yellow
npx prisma migrate dev
Write-Host "✅ تم تطبيق الهجرات | Migrations applied" -ForegroundColor Green

# 3. توليد عميل Prisma | Generate Prisma client
Write-Host "`n3️⃣ توليد عميل Prisma | Generating Prisma client" -ForegroundColor Yellow
npx prisma generate
Write-Host "✅ تم توليد عميل Prisma | Prisma client generated" -ForegroundColor Green

# 4. زراعة البيانات الأولية (اختياري) | Seed initial data (optional)
Write-Host "`n4️⃣ زراعة البيانات الأولية | Seeding initial data" -ForegroundColor Yellow
$seedChoice = Read-Host "هل تريد زراعة البيانات الأولية؟ (y/n) | Do you want to seed initial data? (y/n)"
if ($seedChoice -eq 'y' -or $seedChoice -eq 'Y') {
    npx prisma db seed
    Write-Host "✅ تم زراعة البيانات الأولية | Initial data seeded" -ForegroundColor Green
} else {
    Write-Host "⏭️ تم تخطي زراعة البيانات | Skipped data seeding" -ForegroundColor Yellow
}

# 5. بدء تشغيل التطبيق | Start application
Write-Host "`n5️⃣ بدء تشغيل التطبيق | Starting application" -ForegroundColor Yellow
Write-Host "🌐 سيتم فتح التطبيق على http://localhost:3000 | Application will open on http://localhost:3000" -ForegroundColor Cyan
Write-Host "📊 لفتح Prisma Studio: npx prisma studio | To open Prisma Studio: npx prisma studio" -ForegroundColor Cyan
Write-Host "🔄 لإيقاف التطبيق اضغط Ctrl+C | To stop application press Ctrl+C" -ForegroundColor Cyan

# بدء التطبيق في وضع التطوير | Start app in development mode
npm run dev
```

### اختصارات مفيدة للتطوير | Useful Development Shortcuts
```powershell
# إنشاء ملف aliases.ps1 للاختصارات | Create aliases.ps1 for shortcuts
@"
# اختصارات مفيدة لتطوير قاعدة البيانات | Useful Database Development Shortcuts

# اختصارات Prisma | Prisma shortcuts
function db-migrate { npx prisma migrate dev }
function db-generate { npx prisma generate }
function db-seed { npx prisma db seed }
function db-reset { npx prisma migrate reset }
function db-studio { npx prisma studio }
function db-status { npx prisma migrate status }

# اختصارات النسخ الاحتياطي | Backup shortcuts
function db-backup { .\backup-script.ps1 }
function db-monitor { .\monitor-database.ps1 }
function db-maintain { .\maintenance-database.ps1 }

# اختصارات التطبيق | Application shortcuts
function app-start { npm start }
function app-dev { npm run dev }
function app-test { npm test }

# اختصارات PostgreSQL | PostgreSQL shortcuts
function pg-start { Start-Service postgresql-x64-14 }
function pg-stop { Stop-Service postgresql-x64-14 }
function pg-status { Get-Service postgresql-x64-14 }
function pg-connect { psql -U app_user -h localhost -d my_project_db }

# اختصار شامل لبدء التشغيل | Complete startup shortcut
function dev-start {
    Write-Host "🚀 بدء بيئة التطوير | Starting development environment" -ForegroundColor Cyan
    pg-start
    db-generate
    app-dev
}

# اختصار للتنظيف الشامل | Complete cleanup shortcut
function dev-clean {
    Write-Host "🧹 تنظيف بيئة التطوير | Cleaning development environment" -ForegroundColor Yellow
    db-maintain
    Write-Host "✅ تم التنظيف | Cleanup completed" -ForegroundColor Green
}

Write-Host "✅ تم تحميل الاختصارات | Shortcuts loaded successfully" -ForegroundColor Green
Write-Host "📋 الاختصارات المتاحة | Available shortcuts:" -ForegroundColor Cyan
Write-Host "   db-migrate, db-generate, db-seed, db-reset, db-studio" -ForegroundColor White
Write-Host "   db-backup, db-monitor, db-maintain" -ForegroundColor White
Write-Host "   app-start, app-dev, pg-start, pg-stop" -ForegroundColor White
Write-Host "   dev-start, dev-clean" -ForegroundColor White
"@ | Out-File -FilePath "aliases.ps1" -Encoding UTF8

# إضافة الاختصارات إلى الجلسة الحالية | Add shortcuts to current session
. .\aliases.ps1
```

## 14. إعداد Docker (اختياري) | Docker Setup (Optional)

### إنشاء ملفات Docker | Create Docker Files
```powershell
# إنشاء Dockerfile | Create Dockerfile
@"
# Dockerfile للتطبيق | Dockerfile for application
FROM node:18-alpine

# إعداد مجلد العمل | Set working directory
WORKDIR /app

# نسخ ملفات package | Copy package files
COPY package*.json ./
COPY prisma/ ./prisma/

# تثبيت التبعيات | Install dependencies
RUN npm ci --only=production && npm cache clean --force

# توليد عميل Prisma | Generate Prisma client
RUN npx prisma generate

# نسخ ملفات التطبيق | Copy application files
COPY . .

# تعريف المنفذ | Expose port
EXPOSE 3000

# متغيرات البيئة | Environment variables
ENV NODE_ENV=production

# الأمر الافتراضي | Default command
CMD ["npm", "start"]
"@ | Out-File -FilePath "Dockerfile" -Encoding UTF8

# إنشاء docker-compose.yml | Create docker-compose.yml
@"
# Docker Compose للتطوير | Docker Compose for development
version: '3.8'

services:
  # خدمة قاعدة البيانات | Database service
  postgres:
    image: postgres:15-alpine
    container_name: my_project_postgres
    environment:
      POSTGRES_DB: my_project_db
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: MyApp123!@#
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=C"
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    networks:
      - app_network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d my_project_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  # خدمة التطبيق | Application service
  app:
    build: .
    container_name: my_project_app
    environment:
      DATABASE_URL: "postgresql://app_user:MyApp123!@#@postgres:5432/my_project_db"
      NODE_ENV: development
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    networks:
      - app_network
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped
    command: npm run dev

  # خدمة Prisma Studio | Prisma Studio service
  prisma-studio:
    build: .
    container_name: my_project_studio
    environment:
      DATABASE_URL: "postgresql://app_user:MyApp123!@#@postgres:5432/my_project_db"
    ports:
      - "5555:5555"
    networks:
      - app_network
    depends_on:
      - postgres
    command: npx prisma studio --port 5555 --hostname 0.0.0.0

# تعريف الشبكات | Define networks
networks:
  app_network:
    driver: bridge

# تعريف الحجوم | Define volumes
volumes:
  postgres_data:
    driver: local
"@ | Out-File -FilePath "docker-compose.yml" -Encoding UTF8

# إنشاء مجلد سكريپتات التهيئة | Create init scripts directory
New-Item -ItemType Directory -Path "init-scripts" -Force

# إنشاء سكريپت تهيئة قاعدة البيانات | Create database initialization script
@"
#!/bin/bash
# سكريپت تهيئة قاعدة البيانات | Database initialization script

set -e

# إنشاء المستخدمين والأدوار | Create users and roles
psql -v ON_ERROR_STOP=1 --username "\$POSTGRES_USER" --dbname "\$POSTGRES_DB" <<-EOSQL
    -- إنشاء مستخدم الهجرة | Create migration user
    CREATE USER migration_user WITH PASSWORD 'Migration456!@#';
    
    -- إنشاء مستخدم القراءة فقط | Create readonly user
    CREATE USER readonly_user WITH PASSWORD 'ReadOnly789!@#';
    
    -- إنشاء الأدوار | Create roles
    CREATE ROLE app_role;
    CREATE ROLE migration_role;
    CREATE ROLE readonly_role;
    
    -- منح الأدوار | Grant roles
    GRANT app_role TO \$POSTGRES_USER;
    GRANT migration_role TO migration_user;
    GRANT readonly_role TO readonly_user;
    
    -- منح الصلاحيات | Grant permissions
    GRANT CONNECT ON DATABASE \$POSTGRES_DB TO app_role;
    GRANT CONNECT ON DATABASE \$POSTGRES_DB TO migration_role;
    GRANT CONNECT ON DATABASE \$POSTGRES_DB TO readonly_role;
    
    GRANT USAGE ON SCHEMA public TO app_role;
    GRANT USAGE ON SCHEMA public TO migration_role;
    GRANT USAGE ON SCHEMA public TO readonly_role;
    
    -- صلاحيات الجداول | Table permissions
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO migration_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO app_role;
EOSQL

echo "✅ تم إعداد قاعدة البيانات بنجاح | Database setup completed successfully"
"@ | Out-File -FilePath "init-scripts\01-init-users.sh" -Encoding UTF8

# إنشاء .dockerignore | Create .dockerignore
@"
# ملفات يجب تجاهلها في Docker | Files to ignore in Docker
node_modules
npm-debug.log
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.git
.gitignore
README.md
.eslintrc.json
.next
.nyc_output
coverage
.coverage
.vscode
.idea
*.log
*.pid
*.seed
*.pid.lock
.DS_Store
Thumbs.db
"@ | Out-File -FilePath ".dockerignore" -Encoding UTF8
```

### أوامر Docker | Docker Commands
```powershell
# أوامر Docker الأساسية | Basic Docker commands

# بناء وتشغيل الخدمات | Build and run services
docker-compose up --build -d

# عرض حالة الخدمات | Show services status
docker-compose ps

# عرض السجلات | Show logs
docker-compose logs -f app

# تشغيل الهجرات | Run migrations
docker-compose exec app npx prisma migrate dev

# زراعة البيانات | Seed data
docker-compose exec app npx prisma db seed

# الدخول إلى حاوية التطبيق | Enter app container
docker-compose exec app sh

# الدخول إلى قاعدة البيانات | Enter database
docker-compose exec postgres psql -U app_user -d my_project_db

# إيقاف الخدمات | Stop services
docker-compose down

# إيقاف وحذف البيانات | Stop and remove data
docker-compose down -v

# إعادة بناء الصور | Rebuild images
docker-compose build --no-cache

Write-Host "🐳 Docker تم إعداده بنجاح | Docker setup completed successfully" -ForegroundColor Green
Write-Host "🚀 لبدء التشغيل: docker-compose up -d | To start: docker-compose up -d" -ForegroundColor Cyan
```

## 15. الخلاصة والخطوات التالية | Summary and Next Steps

### ملخص الإعداد | Setup Summary
```powershell
Write-Host @"
🎉 تهانينا! تم إعداد قاعدة البيانات بنجاح | Congratulations! Database setup completed successfully

📋 ما تم إنجازه | What was accomplished:
✅ تثبيت وإعداد PostgreSQL
✅ إنشاء قاعدة البيانات والمستخدمين
✅ إعداد الأدوار والصلاحيات
✅ تكوين Prisma للهجرات
✅ إنشاء البيانات الأولية
✅ إعداد تطبيق Node.js مع Express
✅ إنشاء سكريپتات النسخ الاحتياطي والصيانة
✅ إعداد Docker (اختياري)
✅ إنشاء دليل استكشاف الأخطاء

🗂️ الملفات المنشأة | Files created:
📄 prisma/schema.prisma - مخطط قاعدة البيانات
📄 prisma/seed.ts - البيانات الأولية
📄 app.js - تطبيق Node.js الرئيسي
📄 .env - متغيرات البيئة
📄 backup-script.ps1 - سكريپت النسخ الاحتياطي
📄 monitor-database.ps1 - سكريپت المراقبة
📄 maintenance-database.ps1 - سكريپت الصيانة
📄 auto-fix.ps1 - سكريپت الإصلاح التلقائي
📄 aliases.ps1 - اختصارات مفيدة
📄 docker-compose.yml - إعداد Docker
📄 troubleshooting-guide.md - دليل استكشاف الأخطاء

🔐 معلومات الاتصال | Connection Information:
🗄️ اسم قاعدة البيانات | Database: my_project_db
👤 مستخدم التطبيق | App User: app_user
🔧 مستخدم الهجرة | Migration User: migration_user
👁️ مستخدم القراءة | Read-only User: readonly_user
💾 مستخدم النسخ الاحتياطي | Backup User: backup_user
🌐 رابط التطبيق | App URL: http://localhost:3000
📊 رابط Prisma Studio: http://localhost:5555

🚀 الأوامر المهمة | Important Commands:
• بدء التطبيق | Start app: npm run dev
• هجرة جديدة | New migration: npx prisma migrate dev --name "description"
• زراعة البيانات | Seed data: npx prisma db seed
• فتح Prisma Studio: npx prisma studio
• نسخ احتياطي | Backup: .\backup-script.ps1
• مراقبة | Monitor: .\monitor-database.ps1
• صيانة | Maintenance: .\maintenance-database.ps1

📚 الخطوات التالية | Next Steps:
1. اختبار الاتصال بقاعدة البيانات
2. تشغيل التطبيق والتأكد من عمله
3. إنشاء المزيد من النماذج حسب احتياجات مشروعك
4. إعداد اختبارات للتطبيق
5. تكوين CI/CD للنشر التلقائي
6. إعداد مراقبة الإنتاج

⚠️ تذكيرات أمنية | Security Reminders:
• غيّر كلمات المرور في الإنتاج
• استخدم SSL في الإنتاج
• فعّل النسخ الاحتياطي التلقائي
• راقب الأداء بانتظام
• حدّث PostgreSQL دورياً

🆘 في حالة المساعدة | For Help:
• راجع troubleshooting-guide.md
• استخدم .\auto-fix.ps1 للإصلاحات السريعة
• استخدم .\diagnose-system.ps1 لتشخيص المشاكل

"@ -ForegroundColor Green

# تحميل الاختصارات تلقائياً | Load shortcuts automatically
if (Test-Path "aliases.ps1") {
    . .\aliases.ps1
    Write-Host "🔧 تم تحميل الاختصارات | Shortcuts loaded" -ForegroundColor Cyan
}

Write-Host "`n🎯 استخدم dev-start لبدء بيئة التطوير | Use dev-start to begin development environment" -ForegroundColor Yellow
```

## 16. ملف README للمشروع | Project README File

```powershell
# إنشاء ملف README شامل | Create comprehensive README
@"
# مشروع قاعدة البيانات PostgreSQL | PostgreSQL Database Project

## نظرة عامة | Overview

هذا المشروع يوفر إعداداً شاملاً لقاعدة بيانات PostgreSQL مع Node.js و Prisma، مع جميع الأدوات اللازمة للتطوير والإنتاج.

This project provides a comprehensive PostgreSQL database setup with Node.js and Prisma, including all necessary tools for development and production.

## المتطلبات | Requirements

- Windows 10/11 مع PowerShell 5.1+ | Windows 10/11 with PowerShell 5.1+
- Node.js 16+ 
- PostgreSQL 12+
- Git

## التثبيت السريع | Quick Installation

\`\`\`powershell
# 1. استنسخ المستودع | Clone repository
git clone <repository-url>
cd <project-name>

# 2. ثبت التبعيات | Install dependencies
npm install

# 3. انسخ ملف البيئة | Copy environment file
Copy-Item .env.example .env

# 4. عدّل متغيرات البيئة | Edit environment variables
notepad .env

# 5. شغّل الهجرات | Run migrations
npx prisma migrate dev

# 6. ازرع البيانات الأولية | Seed initial data
npx prisma db seed

# 7. شغّل التطبيق | Start application
npm run dev
\`\`\`

## هيكل المشروع | Project Structure

\`\`\`
my-project/
├── prisma/
│   ├── schema.prisma          # مخطط قاعدة البيانات
│   ├── seed.ts               # البيانات الأولية
│   └── migrations/           # ملفات الهجرة
├── tests/
│   └── api-tests.http        # اختبارات API
├── app.js                    # التطبيق الرئيسي
├── .env                      # متغيرات البيئة
├── backup-script.ps1         # النسخ الاحتياطي
├── monitor-database.ps1      # المراقبة
├── maintenance-database.ps1  # الصيانة
├── auto-fix.ps1             # الإصلاح التلقائي
├── aliases.ps1              # الاختصارات
├── docker-compose.yml       # إعداد Docker
└── package.json             # تبعيات Node.js
\`\`\`

## الأوامر المفيدة | Useful Commands

### قاعدة البيانات | Database
\`\`\`powershell
# الهجرة | Migration
npx prisma migrate dev --name "description"
npx prisma migrate deploy
npx prisma migrate status

# البيانات | Data
npx prisma db seed
npx prisma db push
npx prisma generate

# الإدارة | Management
npx prisma studio
npx prisma format
\`\`\`

### التطبيق | Application
\`\`\`powershell
# التطوير | Development
npm run dev
npm start
npm test

# قاعدة البيانات | Database
npm run db:migrate
npm run db:seed
npm run db:studio
\`\`\`

### الصيانة | Maintenance
\`\`\`powershell
# النسخ الاحتياطي | Backup
.\backup-script.ps1

# المراقبة | Monitoring
.\monitor-database.ps1 -ShowSizes
.\monitor-database.ps1 -ShowConnections
.\monitor-database.ps1 -ShowPerformance

# الصيانة | Maintenance
.\maintenance-database.ps1
.\maintenance-database.ps1 -FullMaintenance

# الإصلاح | Auto-fix
.\auto-fix.ps1 -FixAll
\`\`\`

## Docker

\`\`\`powershell
# بناء وتشغيل | Build and run
docker-compose up --build -d

# عرض السجلات | View logs
docker-compose logs -f

# إيقاف | Stop
docker-compose down
\`\`\`

## API المرجع | API Reference

### المستخدمين | Users
- \`GET /api/users\` - جلب جميع المستخدمين | Get all users
- \`POST /api/users\` - إنشاء مستخدم جديد | Create new user

### المنشورات | Posts
- \`GET /api/posts\` - جلب المنشورات | Get posts
- \`POST /api/posts\` - إنشاء منشور جديد | Create new post

## استكشاف الأخطاء | Troubleshooting

راجع \`troubleshooting-guide.md\` للحصول على دليل شامل لحل المشاكل الشائعة.

See \`troubleshooting-guide.md\` for comprehensive troubleshooting guide.

## المساهمة | Contributing

1. أنشئ فرع جديد | Create new branch
2. اعمل التغييرات | Make changes  
3. اختبر التغييرات | Test changes
4. أرسل طلب دمج | Submit pull request

## الترخيص | License

MIT License - راجع ملف LICENSE للتفاصيل | See LICENSE file for details
"@ | Out-File -FilePath "README.md" -Encoding UTF8

Write-Host "📝 تم إنشاء ملف README.md | README.md file created successfully" -ForegroundColor Green
```

هذا الدليل الشامل يغطي جميع جوانب إعداد قاعدة بيانات PostgreSQL مع PowerShell والشرح باللغة العربية. الآن يمكنك البدء في استخدام هذا الإعداد لمشروعك!