Please create all these new table make sure to create migrationscript and seeder classes for each table and seeds data json, also make sure to create for them swagger and put the new tables in good structure schemas, because schema in PostgreSQL is like a namespace or a folder that contains tables, views, functions, etc.


CREATE TABLE warehouses (
	-- المعرفات الأساسية
	warehouse_id VARCHAR(10) PRIMARY KEY,                  -- معرف فريد للمستودع
	warehouse_name VARCHAR(100) NOT NULL,                  -- اسم المستودع
	warehouse_code VARCHAR(20) UNIQUE,                     -- رمز فريد للمستودع
	-- معلومات العنوان
	address TEXT,                                          -- العنوان التفصيلي
	city VARCHAR(50),                                      -- المدينة
	state VARCHAR(50),                                     -- الولاية/المحافظة
	country VARCHAR(50),                                   -- الدولة
	postal_code VARCHAR(20),                               -- الرمز البريدي

	-- معلومات الاتصال
	contact_person VARCHAR(100),                           -- اسم الشخص المسؤول
	contact_email VARCHAR(100),                            -- بريد إلكتروني للتواصل
	contact_phone VARCHAR(20),                             -- رقم هاتف للتواصل
	secondary_contact_phone VARCHAR(20),                   -- رقم هاتف احتياطي

	-- الخصائص الفنية
	total_area DECIMAL(10,2),                              -- المساحة الإجمالية للمستودع (بالمتر المربع مثلاً)
	area_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس المساحة
	storage_capacity INTEGER,                              -- السعة التخزينية (عدد الوحدات/المنصات)
	warehouse_type VARCHAR(50),                            -- نوع المستودع (مبرد، جاف، خطر، إلخ)
	temperature_controlled BOOLEAN DEFAULT FALSE,          -- هل المستودع يدعم التحكم في درجة الحرارة؟
	min_temperature DECIMAL(5,2),                          -- أدنى درجة حرارة مدعومة
	max_temperature DECIMAL(5,2),                          -- أعلى درجة حرارة مدعومة
	temperature_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الحرارة

	-- الحالة والتدقيق
	is_active BOOLEAN DEFAULT TRUE,                        -- حالة التفعيل
	operational_status VARCHAR(20) DEFAULT 'operational',  -- الحالة التشغيلية (operational, maintenance, closed)
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- تاريخ الإنشاء
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ التحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36),  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- إعدادات إضافية
	timezone VARCHAR(50),                                  -- المنطقة الزمنية للمستودع
	operating_hours JSONB,                                 -- ساعات العمل (مثل {"mon": "08:00-17:00", "tue": ...})
	custom_attributes JSONB                                -- سمات مخصصة لتخزين بيانات ديناميكية
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed
);

CREATE TABLE zones (
	-- المعرفات الأساسية
	zone_id VARCHAR(15) PRIMARY KEY,                       -- معرف فريد للمنطقة
	warehouse_id VARCHAR(10) NOT NULL REFERENCES warehouses(warehouse_id), -- رابط المستودع
	zone_name VARCHAR(100) NOT NULL,                       -- اسم المنطقة
	zone_code VARCHAR(20) UNIQUE,                          -- رمز فريد للمنطقة

	-- الخصائص
	zone_type VARCHAR(50) NOT NULL CHECK (zone_type IN ('receiving', 'shipping', 'storage', 'picking', 'packing', 'staging')), -- نوع المنطقة
	description TEXT,                                      -- وصف تفصيلي
	area DECIMAL(10,2),                                    -- مساحة المنطقة
	area_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس المساحة
	capacity INTEGER,                                      -- السعة (عدد الوحدات/المنصات)
	priority INTEGER DEFAULT 0,                            -- أولوية المنطقة (للعمليات)

	-- الإحداثيات
	center_x DOUBLE PRECISION NOT NULL,  -- إحداثي X لمركز المنطقة -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	center_y DOUBLE PRECISION NOT NULL,  -- إحداثي Y لمركز المنطقة -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	coordinate_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الإحداثيات

	-- التحكم البيئي
	temperature_controlled BOOLEAN DEFAULT FALSE,          -- هل المنطقة تدعم التحكم في درجة الحرارة؟
	min_temperature DECIMAL(5,2),                          -- أدنى درجة حرارة
	max_temperature DECIMAL(5,2),                          -- أعلى درجة حرارة
	temperature_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الحرارة
	-- الحالة والتدقيق
	is_active BOOLEAN DEFAULT TRUE,                        -- حالة التفعيل
	status VARCHAR(20) DEFAULT 'operational',              -- الحالة (operational, maintenance, blocked)
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- تاريخ الإنشاء
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ التحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36),  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- إعدادات إضافية
	custom_attributes JSONB                               -- سمات مخصصة (مثل "عدد العاملين" أو "نوع الأرضية")
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed
);

CREATE TABLE aisles (
	-- المعرفات الأساسية
	aisle_id VARCHAR(20) PRIMARY KEY,                      -- معرف فريد للممر
	zone_id VARCHAR(15) NOT NULL REFERENCES zones(zone_id), -- رابط المنطقة
	aisle_name VARCHAR(50) NOT NULL,                       -- اسم الممر
	aisle_code VARCHAR(20) UNIQUE,                         -- رمز فريد للممر

	-- الخصائص
	description TEXT,                                      -- وصف تفصيلي
	length DECIMAL(10,2),                                  -- طول الممر
	width DECIMAL(10,2),                                   -- عرض الممر
	height DECIMAL(10,2),                                  -- ارتفاع الممر
	dimension_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الأبعاد
	capacity INTEGER,                                      -- السعة (عدد الرفوف/المنصات)
	aisle_direction VARCHAR(20),                           -- اتجاه الممر (north-south, east-west)

	-- الحالة والتدقيق
	is_active BOOLEAN DEFAULT TRUE,                        -- حالة التفعيل
	status VARCHAR(20) DEFAULT 'operational',              -- الحالة (operational, blocked)
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- تاريخ الإنشاء
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ التحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36),  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- الإحداثيات
	start_x DOUBLE PRECISION NOT NULL,  										-- إحداثي X لبداية الممر -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	start_y DOUBLE PRECISION NOT NULL,  										-- إحداثي Y لبداية الممر -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	end_x DOUBLE PRECISION NOT NULL,    										-- إحداثي X لنهاية الممر -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	end_y DOUBLE PRECISION NOT NULL,    										-- إحداثي Y لنهاية الممر -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	center_x DOUBLE PRECISION,          										-- إحداثي X لمركز الممر (اختياري) -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	center_y DOUBLE PRECISION,          										-- إحداثي Y لمركز الممر (اختياري) -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	coordinate_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), 	-- وحدة قياس الإحداثيات

	-- إعدادات إضافية
	custom_attributes JSONB                               -- سمات مخصصة
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed
);

CREATE TABLE racks (
	-- المعرفات الأساسية
	rack_id VARCHAR(25) PRIMARY KEY,                       -- معرف فريد للرف
	aisle_id VARCHAR(20) NOT NULL REFERENCES aisles(aisle_id), -- رابط الممر
	rack_name VARCHAR(50) NOT NULL,                        -- اسم الرف
	rack_code VARCHAR(20) UNIQUE,                          -- رمز فريد للرف

	-- الخصائص
	rack_type VARCHAR(50) CHECK (rack_type IN ('pallet', 'shelving', 'cantilever', 'drive-in')), -- نوع الرف
	description TEXT,                                      -- وصف تفصيلي
	length DECIMAL(10,2),                                  -- طول الرف
	width DECIMAL(10,2),                                   -- عرض الرف
	height DECIMAL(10,2),                                  -- ارتفاع الرف
	dimension_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الأبعاد
	max_weight DECIMAL(10,2),                              -- الحد الأقصى للوزن
	weight_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الوزن
	capacity INTEGER,                                      -- السعة (عدد المستويات/المنصات)
	rack_system VARCHAR(50),                            	-- نظام الرف (ثابت، متحرك، إلخ)
	total_levels INTEGER,                               	-- عدد المستويات

	-- الإحداثيات
	center_x DOUBLE PRECISION NOT NULL,  										-- إحداثي X لمركز الرف -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	center_y DOUBLE PRECISION NOT NULL,  										-- إحداثي Y لمركز الرف -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	coordinate_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), 	-- وحدة قياس الإحداثيات

	-- الحالة والتدقيق
	is_active BOOLEAN DEFAULT TRUE,                        -- حالة التفعيل
	status VARCHAR(20) DEFAULT 'operational',              -- الحالة (operational, maintenance)
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- تاريخ الإنشاء
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ التحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36),  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- إعدادات إضافية
	custom_attributes JSONB                               -- سمات مخصصة
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed
);

CREATE TABLE levels (
	-- المعرفات الأساسية
	level_id VARCHAR(30) PRIMARY KEY,                      -- معرف فريد للمستوى
	rack_id VARCHAR(25) NOT NULL REFERENCES racks(rack_id), -- رابط الرف
	level_name VARCHAR(50) NOT NULL,                       -- اسم المستوى
	level_code VARCHAR(20) UNIQUE,                         -- رمز فريد للمستوى

	-- الخصائص
	level_number INT NOT NULL,                             -- رقم المستوى (1, 2, 3...)
	height DECIMAL(10,2),                                  -- ارتفاع المستوى
	height_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الارتفاع
	max_weight DECIMAL(10,2),                              -- الحد الأقصى للوزن
	weight_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الوزن
	length DECIMAL(10,2),                                  -- طول المستوى
	width DECIMAL(10,2),                                   -- عرض المستوى
	dimension_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الأبعاد
	capacity INTEGER,                                      -- السعة (عدد المواقع/المنصات)

	-- الإحداثيات
	relative_x DOUBLE PRECISION,  												-- إحداثي X نسبي داخل الرف -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	relative_y DOUBLE PRECISION,  												-- إحداثي Y نسبي داخل الرف -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	z_position DOUBLE PRECISION,  												-- الموقع على محور Z (الارتفاع) -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	coordinate_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), 	-- وحدة قياس الإحداثيات

	-- الحالة والتدقيق
	is_active BOOLEAN DEFAULT TRUE,                        -- حالة التفعيل
	status VARCHAR(20) DEFAULT 'operational',              -- الحالة (operational, blocked)
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- تاريخ الإنشاء
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ التحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36),  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- إعدادات إضافية
	custom_attributes JSONB                               -- سمات مخصصة
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed
);

CREATE TABLE locations (
	-- المعرفات الأساسية
	location_id VARCHAR(35) PRIMARY KEY,                   -- معرف فريد للموقع
	level_id VARCHAR(30) NOT NULL REFERENCES levels(level_id), -- رابط المستوى
	location_name VARCHAR(50) NOT NULL,                    -- اسم الموقع
	location_code VARCHAR(20) UNIQUE,                      -- رمز فريد للموقع

	-- الخصائص
	location_type VARCHAR(50) CHECK (location_type IN ('picking', 'storage', 'bulk', 'returns')), -- نوع الموقع
	position INT,                                          -- الموضع داخل المستوى (1, 2, 3...)
	barcode VARCHAR(50) UNIQUE,                            -- باركود لتحديد الموقع
	location_priority VARCHAR(50) CHECK (location_priority IN ('HIGH', 'MEDIUM', 'LOW')), -- لأولوية الموقع في عمليات الانتقاء. -- !! CHANGED: Mismatched check constraint name location_type corrected to location_priority

	--Bins > if we are use the bins table as bin can move with all goods -------------------------------------------------------
	-- current_bin_id VARCHAR(20) REFERENCES bins(bin_id), -- الصندوق الحالي (NULL إذا كان فارغاً) -- !! COMMENTED OUT: bins table not yet created

	--Bins > if we are not using the bins table as bin can move with all goods +++++++++++++++++++++++++++++++++++++++++++++++++
	bin_type VARCHAR(20), 									-- نوع الحاوية/الصندوق (يمكن إضافته هنا بدلاً من جدول منفصل)
	bin_volume DECIMAL(10,2), 								-- حجم الحاوية
	bin_max_weight DECIMAL(10,2), 							-- أقصى حمل للحاوية

	-- القياسات
	length DECIMAL(10,2),                                  -- طول الموقع
	width DECIMAL(10,2),                                   -- عرض الموقع
	height DECIMAL(10,2),                                  -- ارتفاع الموقع
	dimension_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الأبعاد
	volume DECIMAL(10,2),                                  -- الحجم
	volume_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الحجم
	max_weight DECIMAL(10,2),                              -- الحد الأقصى للوزن
	weight_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), -- وحدة قياس الوزن

	-- الإحداثيات
	relative_x DOUBLE PRECISION,  												-- إحداثي X نسبي داخل المستوى -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	relative_y DOUBLE PRECISION,  												-- إحداثي Y نسبي داخل المستوى -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	z_position DOUBLE PRECISION,  												-- الموقع على محور Z (اختياري) -- !! CHANGED: data type DOUBLE to DOUBLE PRECISION
	coordinate_unit VARCHAR(10) REFERENCES units_of_measure(uom_id), 	-- وحدة قياس الإحداثيات

	-- الحالة والتدقيق
	is_active BOOLEAN DEFAULT TRUE,                        -- حالة التفعيل
	status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'blocked')), -- حالة الموقع
	last_occupied_at TIMESTAMP,                            -- آخر تاريخ تم احتلاله
	last_vacated_at TIMESTAMP,                             -- آخر تاريخ تم إخلاؤه
	last_inventory_date TIMESTAMP,                      	-- تاريخ آخر جرد
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,        -- تاريخ الإنشاء
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ التحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36),  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- إعدادات إضافية
	custom_attributes JSONB                               -- سمات مخصصة
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed
);

CREATE TABLE inventory (
	-- المفاتيح الأساسية والهويات
	inventory_id VARCHAR(36) PRIMARY KEY, -- المعرف الفريد لسجل المخزون
	product_id VARCHAR(20) NOT NULL REFERENCES products(product_id), -- رقم تعريف المنتج (مرتبط بجدول المنتجات)
	location_id VARCHAR(35) NOT NULL REFERENCES locations(location_id), -- رقم تعريف الموقع (مرتبط بجدول المواقع)

	-- معلومات الكميات والمقاييس
	quantity DECIMAL(10,2) NOT NULL, -- الكمية المتوفرة حالياً
	uom_id VARCHAR(10) NOT NULL REFERENCES units_of_measure(uom_id), -- وحدة القياس (مرتبط بجدول وحدات القياس)
	min_stock_level DECIMAL(10,2), -- الحد الأدنى للكمية المسموح بها
	max_stock_level DECIMAL(10,2), -- الحد الأقصى للكمية المسموح بها
	reorder_point DECIMAL(10,2), -- نقطة إعادة الطلب

	-- معلومات التتبع
	lot_number VARCHAR(50), -- رقم الدفعة (للتتبع بالدفعات)
	serial_number VARCHAR(50), -- الرقم التسلسلي (للتتبع الفردي)

	-- معلومات التواريخ
	production_date DATE, -- تاريخ تصنيع المنتج
	expiry_date DATE, -- تاريخ انتهاء الصلاحية
	last_movement_date TIMESTAMP, -- تاريخ آخر حركة للمخزون

	-- حالة المخزون
	status VARCHAR(20) DEFAULT 'available', -- الحالة (متاح/محجوز/تالف/منتهي)
	is_active BOOLEAN DEFAULT TRUE, -- نشط أو غير نشط
	quality_status VARCHAR(20), -- تقييم الجودة (جيد/معيب/إلخ)

	-- معلومات التخزين
	temperature_zone VARCHAR(20), -- متطلبات التخزين (عادي/مبرد/مجمد)
	weight DECIMAL(10,2), -- وزن الوحدة
	dimensions VARCHAR(50), -- الأبعاد (طول×عرض×ارتفاع)
	hazard_class VARCHAR(20), -- تصنيف الخطورة إن وجد

	-- معلومات المورد والملكية
	owner_id VARCHAR(36), -- مالك المخزون (للشركات المتعددة)
	supplier_id VARCHAR(36), -- المورد الأساسي لهذا الصنف

	-- معلومات الجمارك
	customs_info TEXT, -- بيانات جمركية للمستوردات

	-- معلومات التعريف
	barcode VARCHAR(50), -- باركود الصنف
	rfid_tag VARCHAR(50), -- بطاقة RFID

	-- معلومات المراجعة والموافقة
	last_audit_date DATE, -- تاريخ آخر مراجعة
	audit_notes TEXT, -- ملاحظات المراجعة
	approval_date TIMESTAMP, -- تاريخ الموافقة
    approved_by VARCHAR(36), -- الشخص الذي وافق على المهمة -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- معلومات السجل الزمني
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- وقت إنشاء السجل
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- وقت آخر تحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)

	-- المفاتيح الخارجية
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36)  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by, approved_by using ALTER TABLE later if needed
);

CREATE TABLE inventory_movements (
	-- المفاتيح الأساسية والهويات
	movement_id VARCHAR(36) PRIMARY KEY, -- المعرف الفريد لحركة المخزون
	inventory_id VARCHAR(36) NOT NULL REFERENCES inventory(inventory_id), -- رقم العنصر في المخزون (مرتبط بجدول المخزون)

	-- معلومات المواقع
	source_location_id VARCHAR(35) REFERENCES locations(location_id), -- موقع المنشأ (مرتبط بجدول المواقع)
	destination_location_id VARCHAR(35) REFERENCES locations(location_id), -- موقع الوجهة (مرتبط بجدول المواقع)

	-- معلومات الكميات والنقل
	quantity DECIMAL(10,2) NOT NULL, -- الكمية المنقولة
	uom_id VARCHAR(10) NOT NULL REFERENCES units_of_measure(uom_id), -- وحدة القياس (مرتبط بجدول وحدات القياس)
	movement_type VARCHAR(20) NOT NULL, -- نوع الحركة (استلام/صرف/نقل/تعديل)
	movement_reason VARCHAR(50), -- سبب الحركة (تعديل/تصحيح/صرف عادي)

	-- معلومات المراجع
	reference_id VARCHAR(36), -- رقم المستند المرجعي (أمر شراء/بيع/إلخ)
	reference_type VARCHAR(20), -- نوع المستند المرجعي
	batch_number VARCHAR(50), -- رقم الدفعة إن وجد

	-- معلومات التنفيذ
	movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ التنفيذ
    performed_by VARCHAR(36), -- المسؤول عن التنفيذ (مرتبط بجدول المستخدمين) -- !! CHANGED: Removed FOREIGN KEY for initial creation
	system_generated BOOLEAN DEFAULT FALSE, -- هل الحركة تلقائية؟

	-- معلومات الموافقة
	approval_status VARCHAR(20) DEFAULT 'pending', -- حالة الموافقة (معلق/معتمد/مرفوض)
	approval_date TIMESTAMP, -- تاريخ الموافقة
    approved_by VARCHAR(36), -- الشخص الذي وافق على المهمة -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- المعلومات المالية
	transaction_value DECIMAL(12,2), -- القيمة المالية للحركة
	currency VARCHAR(3), -- العملة المستخدمة
	movement_cost DECIMAL(10,2), -- تكلفة تنفيذ الحركة

	-- معلومات النقل والشحن
	transport_mode VARCHAR(20), -- وسيلة النقل المستخدمة
	carrier_id VARCHAR(36), -- معرف الناقل
	tracking_number VARCHAR(50), -- رقم تتبع الشحنة
	expected_arrival TIMESTAMP, -- تاريخ الوصول المتوقع
	actual_arrival TIMESTAMP, -- تاريخ الوصول الفعلي

	-- معلومات السجل
	notes TEXT, -- ملاحظات إضافية
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ الإنشاء
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)

	-- المفاتيح الخارجية
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36)  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by, performed_by, approved_by using ALTER TABLE later if needed
);

CREATE TABLE inventory_counts (
	-- المفاتيح الأساسية والهويات
	count_id VARCHAR(36) PRIMARY KEY, -- المعرف الفريد لعملية الجرد
	warehouse_id VARCHAR(10) NOT NULL REFERENCES warehouses(warehouse_id), -- المستودع المستهدف (مرتبط بجدول المستودعات)

	-- معلومات أساسية عن الجرد
	count_name VARCHAR(100), -- اسم أو وصف عملية الجرد
	count_type VARCHAR(20) NOT NULL, -- نوع الجرد (دوري/كامل/جزئي)
	status VARCHAR(20) DEFAULT 'planned', -- حالة العملية (مخطط/قيد التنفيذ/مكتمل/ملغى)

	-- تواريخ الجرد
	start_date TIMESTAMP, -- تاريخ البدء الفعلي
	end_date TIMESTAMP, -- تاريخ الانتهاء الفعلي
	expected_completion TIMESTAMP, -- التاريخ المتوقع للانتهاء

	-- معلومات الفريق
	team_leader VARCHAR(36), -- قائد فريق الجرد -- !! CHANGED: Removed FOREIGN KEY for initial creation
	count_team TEXT, -- قائمة أعضاء فريق الجرد

	-- إعدادات الجرد
	count_method VARCHAR(20), -- طريقة الجرد (يدوي/ماسح ضوئي/إلخ)
	count_frequency VARCHAR(20), -- التكرار (يومي/أسبوعي/شهري/إلخ)
	count_zone VARCHAR(20), -- المنطقة المستهدفة في المستودع
	count_category VARCHAR(20), -- الفئة المستهدفة (صنف معين/كل الأصناف)
	variance_threshold DECIMAL(5,2), -- نسبة التباين المقبولة

	-- معلومات الموافقة
	is_approved BOOLEAN DEFAULT FALSE, -- حالة الموافقة على الجرد
	approved_at TIMESTAMP, -- تاريخ الموافقة
    approved_by VARCHAR(36), -- المسؤول عن الموافقة -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- معلومات الجرد المعاد
	is_recount BOOLEAN DEFAULT FALSE, -- هل هذه عملية جرد معاد؟
	original_count_id VARCHAR(36), -- معرف الجرد الأصلي في حال كان معاداً

	-- معلومات إضافية
	priority VARCHAR(10), -- مستوى الأولوية (عالي/متوسط/منخفض)
	notes TEXT, -- ملاحظات وملاحظات إضافية

	-- معلومات السجل الزمني
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ إنشاء السجل
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ آخر تحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)

	-- المفاتيح الخارجية
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36)  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by, team_leader, approved_by using ALTER TABLE later if needed
);

CREATE TABLE inventory_count_details (
	-- المفاتيح الأساسية والهويات
	count_detail_id VARCHAR(36) PRIMARY KEY, -- المعرف الفريد لتفاصيل الجرد
	count_id VARCHAR(36) NOT NULL REFERENCES inventory_counts(count_id), -- معرف عملية الجرد (مرتبط بجدول الجرد)
	inventory_id VARCHAR(36) NOT NULL REFERENCES inventory(inventory_id), -- معرف العنصر في المخزون (مرتبط بجدول المخزون)

	-- معلومات الكميات
	expected_quantity DECIMAL(10,2), -- الكمية المتوقعة حسب السجلات
	counted_quantity DECIMAL(10,2), -- الكمية الفعلية المعدودة
	recount_quantity DECIMAL(10,2), -- الكمية في حالة إعادة العد
	uom_id VARCHAR(10) NOT NULL REFERENCES units_of_measure(uom_id), -- وحدة القياس (مرتبط بجدول وحدات القياس)

	-- معلومات التباين
	variance DECIMAL(10,2), -- الفرق بين المتوقع والمعدود
	variance_percentage DECIMAL(10,2), -- نسبة التباين بين المتوقع والمعدود

	-- معلومات عملية العد
	status VARCHAR(20) DEFAULT 'pending', -- حالة العد (معلق/معدود/معدل)
	count_method VARCHAR(20), -- الطريقة المستخدمة في العد
	device_id VARCHAR(36), -- الجهاز المستخدم في عملية العد

	-- معلومات المسؤولين عن العد
    counted_by VARCHAR(36), -- الشخص الذي قام بالعد الأولي -- !! CHANGED: Removed FOREIGN KEY for initial creation
	counted_at TIMESTAMP, -- تاريخ ووقت العد الأولي
    recount_by VARCHAR(36), -- المسؤول عن إعادة العد -- !! CHANGED: Removed FOREIGN KEY for initial creation
	recount_at TIMESTAMP, -- تاريخ ووقت إعادة العد
	recount_status VARCHAR(20), -- حالة عملية إعادة العد

	-- معلومات التعديلات
	adjustment_id VARCHAR(36), -- معرف سجل التعديل
    adjustment_by VARCHAR(36), -- المسؤول عن التعديل -- !! CHANGED: Removed FOREIGN KEY for initial creation
	adjustment_date TIMESTAMP, -- تاريخ التعديل

	-- معلومات التحقق
	location_verified BOOLEAN, -- هل تم التحقق من صحة الموقع؟
	batch_verified BOOLEAN, -- هل تم التحقق من صحة الدفعة؟
	expiry_verified BOOLEAN, -- هل تم التحقق من تاريخ الصلاحية؟
	item_condition VARCHAR(20), -- حالة العنصر أثناء العد (جيد/تالف/إلخ)

	-- معلومات إضافية
	notes TEXT, -- ملاحظات إضافية حول عملية العد

	-- معلومات السجل الزمني
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ إنشاء السجل
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ آخر تحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)

	-- المفاتيح الخارجية
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36)  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by, counted_by, recount_by, adjustment_by using ALTER TABLE later if needed
);

CREATE TABLE inventory_reservations (
	-- المعلومات الأساسية
	reservation_id VARCHAR(36) PRIMARY KEY,
	reservation_number VARCHAR(50) UNIQUE NOT NULL,

	-- العلاقات بالجداول الأخرى
	product_id VARCHAR(20) NOT NULL REFERENCES products(product_id),
	inventory_id VARCHAR(36) REFERENCES inventory(inventory_id),
	location_id VARCHAR(35) REFERENCES locations(location_id),

	-- معلومات الكمية
	quantity DECIMAL(10,2) NOT NULL,
	uom_id VARCHAR(10) NOT NULL REFERENCES units_of_measure(uom_id),

	-- معلومات الحجز
	reservation_type VARCHAR(20) NOT NULL CHECK (reservation_type IN ('sale', 'transfer', 'production', 'quality_check')),
	status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'released', 'fulfilled', 'cancelled')),

	-- المراجع
	reference_id VARCHAR(36), -- يمكن أن يكون order_id, transfer_id, etc.
	reference_type VARCHAR(30), -- نوع المرجع مثل 'sales_order', 'purchase_order'

	-- التواريخ
	reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	expires_at TIMESTAMP,
	released_at TIMESTAMP,

	-- معلومات المستخدم
	reserved_by VARCHAR(36) NOT NULL, -- !! CHANGED: Removed FOREIGN KEY for initial creation
	released_by VARCHAR(36), -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- معلومات إضافية
	notes TEXT,
	priority INTEGER DEFAULT 5,

	-- التتبع
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36),  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by, reserved_by, released_by using ALTER TABLE later if needed

	-- القيود
	CONSTRAINT chk_inv_res_quantity CHECK (quantity > 0), -- Renamed constraint
	CONSTRAINT chk_inv_res_dates CHECK (expires_at IS NULL OR expires_at > reserved_at) -- Renamed constraint
);

CREATE TABLE bin_types (
	type_id VARCHAR(20) PRIMARY KEY, -- المعرف الفريد لنوع الصندوق
	type_code VARCHAR(10) UNIQUE NOT NULL, -- كود مختصر لنوع الصندوق
	type_name VARCHAR(50) NOT NULL, -- الاسم الرسمي للنوع
	description TEXT, -- وصف عام للنوع
	storage_class VARCHAR(20), -- فئة التخزين (A, B, C)

	-- المواصفات القياسية
	standard_length DECIMAL(6,2) NOT NULL, -- الطول القياسي بالسنتيمتر
	standard_width DECIMAL(6,2) NOT NULL, -- العرض القياسي بالسنتيمتر
	standard_height DECIMAL(6,2) NOT NULL, -- الارتفاع القياسي بالسنتيمتر
	standard_volume DECIMAL(10,2), -- الحجم القياسي (محسوب تلقائياً)
	standard_weight DECIMAL(10,2), -- الوزن القياسي للصندوق فارغ
	max_payload DECIMAL(10,2) NOT NULL, -- أقصى حمولة مسموحة

	-- خصائص التخزين
	is_stackable BOOLEAN DEFAULT TRUE, -- هل يمكن تكديس هذا النوع؟
	max_stack_count INTEGER DEFAULT 1, -- أقصى عدد للتكديس
	stackable_with JSONB, -- أنواع الصناديق التي يمكن تكديسها معها

	-- الخصائص المادية
	material VARCHAR(30) NOT NULL, -- المادة المصنوعة منها (بلاستيك، معدن، خشب)
	color VARCHAR(20), -- اللون الأساسي
	is_transparent BOOLEAN DEFAULT FALSE, -- هل الصندوق شفاف؟
	is_foldable BOOLEAN DEFAULT FALSE, -- هل يمكن طي الصندوق؟

	-- متطلبات خاصة
	requires_cleaning BOOLEAN DEFAULT FALSE, -- هل يحتاج تنظيفاً دورياً؟
	cleaning_frequency_days INTEGER, -- عدد الأيام بين كل تنظيف
	is_hazardous_material BOOLEAN DEFAULT FALSE, -- هل يستخدم للمواد الخطرة؟
	temperature_range VARCHAR(20), -- المدى الحراري (مثل "0-40 درجة")

	-- الترميز البصري
	default_barcode_prefix VARCHAR(10), -- بادئة باركود افتراضية
	default_color_code VARCHAR(10), -- كود لون افتراضي
	label_position VARCHAR(20), -- موقع الملصق (أعلى، جانب، إلخ)

	-- التكاليف والمعلومات المالية
	average_cost DECIMAL(12,2), -- متوسط سعر الشراء
	expected_lifespan_months INTEGER, -- العمر الافتراضي بالأشهر
	depreciation_rate DECIMAL(5,2), -- نسبة الإهلاك السنوية

	-- معلومات إضافية
	custom_fields JSONB, -- حقول مخصصة إضافية
	notes TEXT, -- ملاحظات إضافية

	-- التواريخ
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ ووقت آخر تحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)
	is_active BOOLEAN DEFAULT TRUE, -- هل هذا النوع نشط؟
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36)  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed

	-- COMMENT ON TABLE bin_types IS 'جدول يحوي المواصفات القياسية لأنواع الصناديق المختلفة المستخدمة في المستودع';
);

CREATE TABLE bins (
	bin_id VARCHAR(20) PRIMARY KEY, -- المعرف الفريد للصندوق (مثل: BIN-001)
	bin_barcode VARCHAR(50) UNIQUE, -- الباركود الفريد للصندوق
	qr_code VARCHAR(50), -- كود QR للصندوق
	rfid_tag VARCHAR(50), -- رقم بطاقة RFID إن وجدت
	bin_name VARCHAR(100), -- اسم وصفي للصندوق
	bin_category VARCHAR(20), -- فئة الصندوق (قياسي، كبير، مبرد، إلخ)
	bin_status VARCHAR(20) DEFAULT 'متاح', -- (متاح، مشغول، معطّل، تحت الصيانة، مفقود)
	current_location_id VARCHAR(35) REFERENCES locations(location_id), -- الموقع الحالي للصندوق -- !! CHANGED: Data type VARCHAR(20) to VARCHAR(35)
	bin_type VARCHAR(20) REFERENCES bin_types(type_id), -- نوع الصندوق

	-- المواصفات الفيزيائية
	length DECIMAL(6,2), -- الطول بالسنتيمتر
	width DECIMAL(6,2), -- العرض بالسنتيمتر
	height DECIMAL(6,2), -- الارتفاع بالسنتيمتر
	volume DECIMAL(10,2), -- الحجم بالمتر المكعب
	tare_weight DECIMAL(10,2), -- وزن الصندوق فارغ
	max_weight DECIMAL(10,2), -- أقصى وزن يحمله
	max_volume DECIMAL(10,2), -- أقصى حجم يستوعبه

	-- إضافة حقول للتحسين
	optimal_fill_percentage DECIMAL(5,2), -- النسبة المثالية للملء
	current_fill_percentage DECIMAL(5,2), -- النسبة الحالية للملء

	-- معلومات التصنيع
	manufacturer VARCHAR(100), -- اسم الشركة المصنعة
	manufacturing_date DATE, -- تاريخ التصنيع
	material VARCHAR(50), -- المادة المصنوع منها (بلاستيك، معدن، خشب)
	serial_number VARCHAR(50), -- الرقم التسلسلي

	-- معلومات السلامة
	is_hazardous BOOLEAN DEFAULT FALSE, -- هل يستخدم لمواد خطرة؟
	requires_cleaning BOOLEAN DEFAULT FALSE, -- هل يحتاج تنظيما دوريا؟
	last_cleaned_date DATE, -- تاريخ آخر تنظيف

	-- معلومات التتبع
	is_active BOOLEAN DEFAULT TRUE, -- هل الصندوق نشط؟
	owned_by VARCHAR(50), -- مالك الصندوق (قد يكون شركة أو قسم)
	purchase_date DATE, -- تاريخ الشراء
	purchase_price DECIMAL(12,2), -- سعر الشراء
	expected_lifespan_months INTEGER, -- العمر المتوقع بالأشهر

	-- معلومات إضافية
	custom_fields JSONB, -- حقول مخصصة إضافية
	notes TEXT, -- ملاحظات عامة

	-- التواريخ
	last_inventory_check TIMESTAMP, 												-- آخر تاريخ جرد للصندوق
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ ووقت آخر تحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)

	-- المفاتيح الخارجية
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36)  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed

	--COMMENT ON TABLE bins IS 'جدول تفاصيل الصناديق/الحاويات القابلة للنقل في المستودع';
);

-- Now that 'bins' table exists, add the FK constraint to 'locations' if needed
-- ALTER TABLE locations ADD CONSTRAINT fk_location_bin FOREIGN KEY (current_bin_id) REFERENCES bins(bin_id); -- Uncomment if this column is used


CREATE TABLE bin_movements (
	movement_id BIGSERIAL PRIMARY KEY, -- رقم تسلسلي للحركة
	bin_id VARCHAR(20) NOT NULL REFERENCES bins(bin_id), -- الصندوق المنقول

	-- معلومات الموقع المصدر والهدف
	from_location_id VARCHAR(35) REFERENCES locations(location_id), -- الموقع الأصلي (قد يكون NULL لأول مرة) -- !! CHANGED: Data type VARCHAR(20) to VARCHAR(35)
	from_location_type VARCHAR(20), -- نوع الموقع المصدر
	to_location_id VARCHAR(35) NOT NULL REFERENCES locations(location_id), -- الموقع الجديد -- !! CHANGED: Data type VARCHAR(20) to VARCHAR(35)
	to_location_type VARCHAR(20), -- نوع الموقع الهدف

	-- تفاصيل الحركة
	movement_type VARCHAR(30) NOT NULL, -- (نقل، انتقاء، إعادة تخزين، جرد، تنظيف)
	movement_reason VARCHAR(100), -- سبب الحركة (تعديل مخزون، إعادة ترتيب، إلخ)
	movement_method VARCHAR(20), -- طريقة النقل (يدوي، روبوت، رافعة)

	-- المسؤول عن الحركة
    moved_by VARCHAR(36), -- المستخدم الذي قام بالنقل -- !! CHANGED: Removed FOREIGN KEY for initial creation
	team_id VARCHAR(20), -- الفريق المسؤول

	-- معلومات الجلسة/العملية
	session_id VARCHAR(50), -- جلسة العمل المرتبطة
	work_order_id VARCHAR(50), -- رقم أمر العمل
	reference_doc VARCHAR(50), -- مستند مرجعي (أمر تحويل، إلخ)

	-- بيانات الحركة
	distance_moved DECIMAL(10,2), -- المسافة المقطوعة بالأمتار
	movement_duration_seconds INTEGER, -- مدة الحركة بالثواني

	-- حالة الحركة
	status VARCHAR(20) DEFAULT 'مكتمل', -- (مخطط، قيد التنفيذ، مكتمل، فاشل)
	is_verified BOOLEAN DEFAULT FALSE, -- هل تم التحقق من الحركة؟
	verification_method VARCHAR(20), -- طريقة التحقق (بصمة، مسح، إلخ)
    approved_by VARCHAR(36), -- الشخص الذي وافق على المهمة -- !! CHANGED: Removed FOREIGN KEY for initial creation

	-- معلومات إضافية
	equipment_used VARCHAR(50), -- المعدات المستخدمة (رافعة رقم X)
	temperature_at_move DECIMAL(5,2), -- درجة الحرارة أثناء النقل
	notes TEXT, -- ملاحظات إضافية
	custom_fields JSONB, -- حقول مخصصة
	-- movement_path GEOGRAPHY, -- مسار الحركة (للتتبع المكاني) -- !! COMMENTED OUT: Requires PostGIS extension
	movement_priority INTEGER, -- أولوية الحركة (1-10)

	-- التواريخ
	scheduled_time TIMESTAMP, -- الوقت المخطط للحركة
	movement_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- وقت التنفيذ الفعلي
	completed_time TIMESTAMP, -- وقت الانتهاء
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)

	-- المفاتيح الخارجية
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36)  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by, moved_by, approved_by using ALTER TABLE later if needed

	-- COMMENT ON TABLE bin_movements IS 'جدول تفاصيل حركات الصناديق بين المواقع في المستودع';
);

CREATE TABLE bin_contents (
	content_id BIGSERIAL PRIMARY KEY, -- المعرف الفريد لمحتوى الصندوق
	bin_id VARCHAR(20) NOT NULL REFERENCES bins(bin_id), -- الصندوق المرتبط
	product_id VARCHAR(20) NOT NULL REFERENCES products(product_id), -- المنتج المخزّن
	batch_number VARCHAR(50), -- رقم الدفعة (إن وجد)
	serial_number VARCHAR(50), -- الرقم التسلسلي (إن وجد)

	-- معلومات الكمية
	quantity DECIMAL(10,2) NOT NULL, -- الكمية الحالية
	uom VARCHAR(10) NOT NULL REFERENCES units_of_measure(uom_id), -- وحدة القياس

	min_quantity DECIMAL(10,2), -- الحد الأدنى للكمية
	max_quantity DECIMAL(10,2), -- الحد الأقصى للكمية

	-- معلومات التخزين
	storage_condition VARCHAR(20), -- ظروف التخزين (عادي، مبرد، مجمد)
	putaway_date TIMESTAMP, -- تاريخ التخزين الأول
	last_accessed TIMESTAMP, -- تاريخ آخر وصول
	expiration_date DATE, -- تاريخ انتهاء الصلاحية

	-- معلومات الجودة
	quality_status VARCHAR(20) DEFAULT 'جيد', -- حالة الجودة
	inspection_required BOOLEAN DEFAULT FALSE, -- هل يحتاج فحصاً؟
	last_inspection_date TIMESTAMP, -- تاريخ آخر فحص
	inspection_due_date DATE, -- تاريخ الفحص القادم

	-- معلومات التتبع
	source_document VARCHAR(50), -- المستند المصدر (أمر شراء، إلخ)
	source_reference VARCHAR(50), -- المرجع المصدر
	is_locked BOOLEAN DEFAULT FALSE, -- هل المحتوى مقفل؟
	lock_reason TEXT, -- سبب القفل

	-- إضافة حقول للتحليل
	turnover_rate DECIMAL(10,2), -- معدل الدوران
	days_in_stock INTEGER, -- الأيام في المخزون

	-- معلومات إضافية
	custom_fields JSONB, -- حقول مخصصة
	notes TEXT, -- ملاحظات
	last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- تاريخ آخر تحديث
	deleted_at TIMESTAMP,                                  -- تاريخ الحذف (لدعم Soft Delete)

	-- المفاتيح الخارجية
    created_by VARCHAR(36), -- المستخدم الذي أنشأ السجل -- !! CHANGED: Removed FOREIGN KEY for initial creation
    updated_by VARCHAR(36), -- المستخدم الذي قام بالتحديث -- !! CHANGED: Removed FOREIGN KEY for initial creation
    deleted_by VARCHAR(36),  -- المستخدم الذي قام بالحذف -- !! CHANGED: Removed FOREIGN KEY for initial creation
	-- Add FOREIGN KEY constraints for created_by, updated_by, deleted_by using ALTER TABLE later if needed

	-- القيود
	CONSTRAINT positive_quantity CHECK (quantity >= 0),
	UNIQUE(bin_id, product_id, batch_number, serial_number) -- لمنع التكرار

	-- COMMENT ON TABLE bin_contents IS 'جدول تفصيلي لمحتويات الصناديق يُظهر العلاقة بين الصناديق والمنتجات المخزنة فيها';
);