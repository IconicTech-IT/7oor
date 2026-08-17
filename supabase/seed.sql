-- Sample catalog data for 7oor Store.
-- Run once against a fresh project (not idempotent — uses generated UUIDs).

-- Categories
with cat_mobile as (
  insert into categories (name_ar, name_en, slug, sort_order) values ('إكسسوارات موبايل', 'Mobile Accessories', 'mobile-accessories', 1)
  returning id
), cat_stationery as (
  insert into categories (name_ar, name_en, slug, sort_order) values ('أدوات مكتبية', 'Stationery', 'stationery', 2)
  returning id
), cat_services as (
  insert into categories (name_ar, name_en, slug, sort_order) values ('خدمات', 'Services', 'services', 3)
  returning id
), cat_bundles as (
  insert into categories (name_ar, name_en, slug, sort_order) values ('عروض', 'Bundles', 'bundles', 4)
  returning id
), sub_chargers as (
  insert into categories (parent_id, name_ar, name_en, slug, sort_order)
    select id, 'شواحن', 'Chargers', 'chargers', 1 from cat_mobile returning id
), sub_cases as (
  insert into categories (parent_id, name_ar, name_en, slug, sort_order)
    select id, 'جرابات', 'Cases', 'cases', 2 from cat_mobile returning id
), sub_cables as (
  insert into categories (parent_id, name_ar, name_en, slug, sort_order)
    select id, 'كابلات', 'Cables', 'cables', 3 from cat_mobile returning id
), sub_pens as (
  insert into categories (parent_id, name_ar, name_en, slug, sort_order)
    select id, 'أقلام', 'Pens', 'pens', 1 from cat_stationery returning id
), sub_notebooks as (
  insert into categories (parent_id, name_ar, name_en, slug, sort_order)
    select id, 'كراسات', 'Notebooks', 'notebooks', 2 from cat_stationery returning id
), sub_printing as (
  insert into categories (parent_id, name_ar, name_en, slug, sort_order)
    select id, 'طباعة وتصوير', 'Printing & Copying', 'printing', 1 from cat_services returning id
)
select 1;

-- Products (simple)
insert into products (category_id, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit, low_stock_threshold)
select id, 'قلم جل كلاسيك', 'Classic Gel Pen', 'gel-pen-classic',
  'قلم جل سلس الكتابة، مثالي للاستخدام اليومي.', 'Smooth-writing gel pen, perfect for everyday use.',
  'قلم جل بحبر عالي الجودة، تصميم مريح للقبضة، متوفر بعدة ألوان. مناسب للكتابة اليومية والمذاكرة والمكتب.',
  'A high-quality gel ink pen with a comfortable grip, available in several colors. Great for everyday writing, studying, and office use.',
  5, 'item', 10
from categories where slug = 'pens';

insert into products (category_id, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit, low_stock_threshold)
select id, 'كراسة 100 ورقة', 'Notebook — 100 Pages', 'notebook-100',
  'كراسة مسطرة 100 ورقة، غلاف مقوى.', 'Ruled notebook, 100 pages, hard cover.',
  'كراسة مسطرة عالية الجودة بغلاف مقوى يتحمل الاستخدام اليومي، 100 ورقة بيضاء سميكة تمنع تداخل الحبر.',
  'A durable ruled notebook with a hard cover built for daily use — 100 thick white pages that resist ink bleed-through.',
  25, 'item', 8
from categories where slug = 'notebooks';

insert into products (category_id, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit, low_stock_threshold)
select id, 'شاحن سريع 20 وات', 'Fast Charger 20W', 'charger-20w',
  'شاحن سريع 20 وات، يدعم الشحن السريع لمعظم الأجهزة.', 'Fast 20W charger, supports quick charging for most phones.',
  'شاحن حائط 20 وات بتقنية الشحن السريع، متوافق مع أغلب أنواع الموبايلات الحديثة، تصميم مدمج وآمن.',
  'A 20W wall charger with fast-charging support, compatible with most modern phones. Compact and safety-certified design.',
  350, 'item', 5
from categories where slug = 'chargers';

insert into products (category_id, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit, low_stock_threshold)
select id, 'كابل USB-C طول متر', 'USB-C Cable 1m', 'usb-c-cable',
  'كابل USB-C متين طول متر واحد.', 'Durable 1-meter USB-C cable.',
  'كابل شحن ونقل بيانات USB-C بطول متر واحد، جودة تصنيع عالية تتحمل الانحناء المتكرر.',
  'A 1-meter USB-C charging and data cable, built to withstand repeated bending.',
  120, 'item', 10
from categories where slug = 'cables';

insert into products (category_id, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit, low_stock_threshold)
select id, 'جراب سيليكون', 'Silicone Phone Case', 'phone-case-silicone',
  'جراب سيليكون ناعم يحمي موبايلك من الخدوش.', 'Soft silicone case that protects your phone from scratches.',
  'جراب سيليكون طري بمقاس دقيق، يحمي من الصدمات والخدوش مع الحفاظ على شكل الموبايل الأصلي.',
  'A soft-touch, precision-fit silicone case that protects against drops and scratches while keeping your phone slim.',
  180, 'item', 6
from categories where slug = 'cases';

insert into products (category_id, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit, low_stock_threshold)
select id, 'باور بانك 10000 مللي أمبير', 'Power Bank 10000mAh', 'power-bank-10000',
  'باور بانك بسعة 10000 مللي أمبير لشحن موبايلك في أي مكان.', '10000mAh power bank to charge your phone on the go.',
  'باور بانك بسعة 10000 مللي أمبير مزود بمخرجين للشحن، مناسب لشحن موبايلين مرة واحدة.',
  'A 10000mAh power bank with dual outputs, capable of charging two phones at once.',
  650, 'item', 4
from categories where slug = 'chargers';

insert into products (category_id, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit)
select id, 'تصوير أبيض وأسود', 'Photocopy (B&W)', 'photocopy-bw',
  'تصوير مستندات أبيض وأسود، السعر للصفحة الواحدة.', 'Black & white document photocopying, priced per page.',
  'خدمة تصوير مستندات أبيض وأسود بجودة عالية، السعر محسوب لكل صفحة.',
  'High-quality black & white document photocopying, priced per page.',
  1, 'page'
from categories where slug = 'printing';

insert into products (category_id, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit)
select id, 'طباعة ألوان', 'Color Print', 'color-print',
  'طباعة ملونة عالية الجودة، السعر للصفحة الواحدة.', 'High-quality color printing, priced per page.',
  'خدمة طباعة ملونة بجودة عالية لمستنداتك أو صورك، السعر محسوب لكل صفحة.',
  'High-quality color printing for your documents or photos, priced per page.',
  3, 'page'
from categories where slug = 'printing';

insert into products (category_id, type, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit)
select id, 'custom_request', 'كتابة مخصصة', 'Custom Writing (Page Write)', 'page-write',
  'اطلب كتابة أو طباعة نص مخصص — كل شغلة ليها تفاصيلها.', 'Request custom writing or printing — every job is unique.',
  'محتاج حد يكتبلك حاجة معينة أو يطبعلك نص مخصص؟ ابعتلنا التفاصيل أو صورة للنص المطلوب وهنتواصل معاك بعرض السعر.',
  'Need something custom written or printed? Send us the details or a photo of the text and we will follow up with a quote.',
  0, 'job'
from categories where slug = 'printing';

-- Variants
insert into product_variants (product_id, name_ar, name_en, sku, color_hex, price, sort_order)
select id, 'أسود', 'Black', 'PEN-BLK', '#000000', 5, 1 from products where slug = 'gel-pen-classic';
insert into product_variants (product_id, name_ar, name_en, sku, color_hex, price, sort_order)
select id, 'أزرق', 'Blue', 'PEN-BLU', '#1e40af', 5, 2 from products where slug = 'gel-pen-classic';
insert into product_variants (product_id, name_ar, name_en, sku, color_hex, price, sort_order)
select id, 'أحمر', 'Red', 'PEN-RED', '#dc2626', 6, 3 from products where slug = 'gel-pen-classic';

insert into product_variants (product_id, name_ar, name_en, sku, price, sort_order)
select id, 'Type-C', 'Type-C', 'CHG20-C', 350, 1 from products where slug = 'charger-20w';
insert into product_variants (product_id, name_ar, name_en, sku, price, sort_order)
select id, 'لايتننج', 'Lightning', 'CHG20-L', 380, 2 from products where slug = 'charger-20w';

insert into product_variants (product_id, name_ar, name_en, sku, color_hex, price, sort_order)
select id, 'أسود', 'Black', 'CASE-BLK', '#111111', 180, 1 from products where slug = 'phone-case-silicone';
insert into product_variants (product_id, name_ar, name_en, sku, color_hex, price, sort_order)
select id, 'شفاف', 'Clear', 'CASE-CLR', '#e5e7eb', 180, 2 from products where slug = 'phone-case-silicone';
insert into product_variants (product_id, name_ar, name_en, sku, color_hex, price, sort_order)
select id, 'أزرق', 'Blue', 'CASE-BLU', '#2563eb', 190, 3 from products where slug = 'phone-case-silicone';

-- Combo product
insert into products (category_id, type, name_ar, name_en, slug, short_description_ar, short_description_en, description_ar, description_en, price, pricing_unit)
select id, 'combo', 'عرض العودة للمدارس', 'Back to School Combo', 'back-to-school-combo',
  'كراسة + قلم جل، بسعر مميز.', 'Notebook + gel pen, bundled and discounted.',
  'عرض خاص يجمع كراسة 100 ورقة مع قلم جل أسود بسعر أقل من شرائهم منفصلين.',
  'A special bundle combining a 100-page notebook with a black gel pen, priced below buying them separately.',
  28, 'item'
from categories where slug = 'bundles';

insert into product_combo_components (combo_product_id, component_product_id, component_variant_id, qty)
select combo.id, notebook.id, null, 1
from products combo, products notebook
where combo.slug = 'back-to-school-combo' and notebook.slug = 'notebook-100';

insert into product_combo_components (combo_product_id, component_product_id, component_variant_id, qty)
select combo.id, pen.id, v.id, 1
from products combo
join products pen on pen.slug = 'gel-pen-classic'
join product_variants v on v.product_id = pen.id and v.sku = 'PEN-BLK'
where combo.slug = 'back-to-school-combo';

-- Supplier + a received purchase order, so stock_lots pre-exist for testing
insert into suppliers (name, phone, email) values ('القاهرة للجملة', '01000000000', 'sales@cairo-wholesale.example');

insert into purchase_orders (supplier_id, status, ordered_at)
select id, 'draft', now() from suppliers where name = 'القاهرة للجملة';

insert into purchase_order_items (purchase_order_id, product_id, variant_id, qty_ordered, unit_cost)
select po.id, p.id, v.id, 40, 3.2
from purchase_orders po, products p
join product_variants v on v.product_id = p.id and v.sku = 'PEN-BLK'
where p.slug = 'gel-pen-classic'
order by po.created_at desc limit 1;

insert into purchase_order_items (purchase_order_id, product_id, variant_id, qty_ordered, unit_cost)
select po.id, p.id, v.id, 30, 3.2
from purchase_orders po, products p
join product_variants v on v.product_id = p.id and v.sku = 'PEN-BLU'
where p.slug = 'gel-pen-classic'
order by po.created_at desc limit 1;

insert into purchase_order_items (purchase_order_id, product_id, variant_id, qty_ordered, unit_cost)
select po.id, p.id, null, 25, 14
from purchase_orders po, products p
where p.slug = 'notebook-100'
order by po.created_at desc limit 1;

insert into purchase_order_items (purchase_order_id, product_id, variant_id, qty_ordered, unit_cost)
select po.id, p.id, v.id, 15, 260
from purchase_orders po, products p
join product_variants v on v.product_id = p.id and v.sku = 'CHG20-C'
where p.slug = 'charger-20w'
order by po.created_at desc limit 1;

insert into purchase_order_items (purchase_order_id, product_id, variant_id, qty_ordered, unit_cost)
select po.id, p.id, null, 20, 85
from purchase_orders po, products p
where p.slug = 'usb-c-cable'
order by po.created_at desc limit 1;

insert into purchase_order_items (purchase_order_id, product_id, variant_id, qty_ordered, unit_cost)
select po.id, p.id, v.id, 12, 140
from purchase_orders po, products p
join product_variants v on v.product_id = p.id and v.sku = 'CASE-BLK'
where p.slug = 'phone-case-silicone'
order by po.created_at desc limit 1;

insert into purchase_order_items (purchase_order_id, product_id, variant_id, qty_ordered, unit_cost)
select po.id, p.id, null, 10, 480
from purchase_orders po, products p
where p.slug = 'power-bank-10000'
order by po.created_at desc limit 1;

-- Receive the PO: receive_purchase_order() checks app_role() against auth.uid(), which
-- is NULL outside a real authenticated session (e.g. this seed script) — so for seeding
-- we replicate its effect with direct inserts instead of calling the RPC.
with target_po as (
  select id from purchase_orders order by created_at desc limit 1
), lots as (
  insert into stock_lots (product_id, variant_id, qty_received, qty_remaining, unit_cost, purchase_order_item_id)
  select poi.product_id, poi.variant_id, poi.qty_ordered, poi.qty_ordered, poi.unit_cost, poi.id
  from purchase_order_items poi, target_po
  where poi.purchase_order_id = target_po.id
  returning id, product_id, variant_id, qty_received, unit_cost, purchase_order_item_id
)
insert into inventory_movements (product_id, variant_id, stock_lot_id, direction, qty, reason, unit_cost, source_type, source_id)
select product_id, variant_id, id, 'in', qty_received, 'purchase-received', unit_cost, 'purchase_order_item', purchase_order_item_id
from lots;

update purchase_order_items set qty_received = qty_ordered
where purchase_order_id = (select id from purchase_orders order by created_at desc limit 1);

update purchase_orders set status = 'received', ordered_at = now(), received_at = now()
where id = (select id from purchase_orders order by created_at desc limit 1);
