# Graph Report - 7oor  (2026-08-19)

## Corpus Check
- Corpus is ~44,795 words - fits in a single context window. You may not need a graph.

## Summary
- 808 nodes · 1633 edges · 59 communities (31 shown, 28 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Storefront Public Pages
- Admin & Account Dashboards
- Admin CRUD Controls
- Project Docs & Security Rationale
- Purchasing & Suppliers Admin
- R2 Storage Cleanup Admin
- Core DB Schema (Migration 0001)
- Dev Tooling (devDependencies)
- TypeScript Config
- Contact & Requests Email Flow
- Admin Requests Management
- Cart & Checkout Flow
- Auth: Login & Register
- Site Header & Nav
- Settings & Delivery Fee
- Domain Constants & Enums
- Product Detail & Grid
- Customer Order History
- Admin Layout & Branding
- Checkout Validation Schemas
- Root Locale Layout & Providers
- Invoice PDF Generation
- Admin Orders Realtime List
- i18n Routing & Proxy Middleware
- Admin Order Detail
- Misc Dependencies (S3, PDF)
- OG Image Generation
- Admin Purchases List
- App Icon
- Policy Page
- Migration 0003: IDOR/Privilege-Escalation Fix
- Next.js Config
- Dependency: AWS S3 Client
- Dependency: date-fns
- ESLint Config
- Dependency: Formik
- Dependency: Framer Motion
- Dependency: GSAP
- Dependency: GSAP React
- Dependency: lucide-react
- Dependency: Next.js
- Dependency: next-intl
- Dependency: next-themes
- Dependency: Nodemailer
- Dependency: React
- Dependency: React DOM
- Dependency: server-only
- Dependency: sharp
- Dependency: Sonner
- Dependency: @supabase/ssr
- Dependency: supabase-js
- Dependency: tailwind-merge
- Dependency: Yup
- Dependency: Zod
- Dependency: Zustand
- PostCSS Config

## God Nodes (most connected - your core abstractions)
1. `createClient()` - 84 edges
2. `validateBoth()` - 28 edges
3. `formatEGP()` - 25 edges
4. `isUuid()` - 21 edges
5. `compilerOptions` - 16 edges
6. `localized()` - 15 edges
7. `createPublicClient()` - 13 edges
8. `AdminAccountingPage()` - 10 edges
9. `getCategoryTree()` - 10 edges
10. `getAllProductsAdmin()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AdminLayout()` --calls--> `createClient()`  [EXTRACTED]
  app/[locale]/admin/layout.tsx → lib/supabase/server.ts
- `AccountLayout()` --calls--> `createClient()`  [EXTRACTED]
  app/[locale]/account/layout.tsx → lib/supabase/server.ts
- `AccountRequestsPage()` --calls--> `createClient()`  [EXTRACTED]
  app/[locale]/account/requests/page.tsx → lib/supabase/server.ts
- `AdminAccountingPage()` --calls--> `formatEGP()`  [EXTRACTED]
  app/[locale]/admin/accounting/page.tsx → lib/currency.ts
- `AdminCategoriesPage()` --calls--> `getCategoryTree()`  [EXTRACTED]
  app/[locale]/admin/categories/page.tsx → lib/data/categories.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **State-changing RPCs re-checking role inside the function body** — readme_security_definer_rpc, readme_create_sales_order, readme_confirm_sales_order, readme_cancel_sales_order, readme_mark_sales_order_done, readme_receive_purchase_order, readme_adjust_stock, readme_app_role [EXTRACTED 1.00]
- **IDOR / privilege-escalation fixes shipped in migration 0003** — readme_idor_privilege_escalation_migration, readme_role_self_escalation_fix, readme_price_tampering_prevention, readme_invoice_forgery_fix, readme_open_redirect_fix, readme_null_role_bypass_bug, readme_rls_row_level_security [EXTRACTED 1.00]
- **Dual-validation write path (Formik+Yup client, Zod in Server Action)** — readme_dual_validation, readme_validators, readme_validate_both, readme_server_actions, readme_supabase_clients [INFERRED 0.85]

## Communities (59 total, 28 thin omitted)

### Community 0 - "Storefront Public Pages"
Cohesion: 0.05
Nodes (62): AdminCategoriesPage(), dynamic, dynamic, EditProductPage(), dynamic, NewProductPage(), AdminProductsPage(), dynamic (+54 more)

### Community 1 - "Admin & Account Dashboards"
Cohesion: 0.05
Nodes (54): AccountLayout(), AccountRequestsPage(), dynamic, STATUS_COLORS, AdminAccountingPage(), dynamic, startOfMonth(), today() (+46 more)

### Community 2 - "Admin CRUD Controls"
Cohesion: 0.07
Nodes (41): CancelOrderButton(), handleCancel(), CategoriesManager(), handleDelete(), CategoryForm(), Props, slugify(), DeleteProductButton() (+33 more)

### Community 3 - "Project Docs & Security Rationale"
Cohesion: 0.06
Nodes (52): generate-agent-files.js, Next.js Agent Rules Block, node_modules/next/dist/docs Guides, 7oor Project Instructions (CLAUDE.md), 7oor Store, adjust_stock() RPC, First Admin Bootstrap Procedure, Admin Layout Role Gate (admin/layout.tsx) (+44 more)

### Community 4 - "Purchasing & Suppliers Admin"
Cohesion: 0.07
Nodes (40): dynamic, PurchaseOrderDetailPage(), STATUS_COLORS, dynamic, NewPurchaseOrderPage(), AdminSuppliersPage(), dynamic, PurchaseOrderActions() (+32 more)

### Community 5 - "R2 Storage Cleanup Admin"
Cohesion: 0.08
Nodes (42): AdminStoragePage(), dynamic, ImageUploadField(), handleFile(), Props, formatBytes(), OrphanedImage, OrphanedImagesPanel() (+34 more)

### Community 6 - "Core DB Schema (Migration 0001)"
Cohesion: 0.12
Nodes (28): auth, auth.users, app_role(), categories, confirm_sales_order(), deduct_fifo(), get_available_qty(), handle_new_user() (+20 more)

### Community 7 - "Dev Tooling (devDependencies)"
Cohesion: 0.06
Nodes (31): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, prettier, prettier-plugin-tailwindcss, tailwindcss (+23 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "Contact & Requests Email Flow"
Cohesion: 0.14
Nodes (19): ContactForm(), initialValues, FormValues, Props, RequestForm(), ContactInput, submitContactAction(), RequestActionResult (+11 more)

### Community 10 - "Admin Requests Management"
Cohesion: 0.14
Nodes (18): AdminRequestDetailPage(), dynamic, FULFILLMENT_KEY, AdminRequestsPage(), dynamic, STATUS_COLORS, RequestAttachmentViewer(), handleView() (+10 more)

### Community 11 - "Cart & Checkout Flow"
Cohesion: 0.19
Nodes (16): CartButton(), CartDrawer(), CheckoutForm(), STEPS, OrderSummary(), Props, placeOrderAction(), getSlideVariants() (+8 more)

### Community 12 - "Auth: Login & Register"
Cohesion: 0.16
Nodes (14): LoginForm(), RegisterForm(), loginAction(), LoginInput, logoutAction(), registerAction(), RegisterInput, loginSchema (+6 more)

### Community 13 - "Site Header & Nav"
Cohesion: 0.17
Nodes (11): HeaderNav(), NavLink, LanguageSwitcher(), ThemeToggle(), Props, UserMenu(), handleLogout(), Props (+3 more)

### Community 14 - "Settings & Delivery Fee"
Cohesion: 0.17
Nodes (12): AdminSettingsPage(), dynamic, CheckoutPage(), dynamic, DeliveryFeeForm(), schema, ActionResult, updateDeliveryFeeAction() (+4 more)

### Community 15 - "Domain Constants & Enums"
Cohesion: 0.13
Nodes (14): FULFILLMENT_METHODS, FulfillmentMethod, PAYMENT_METHODS, PaymentMethod, PRODUCT_TYPES, ProductType, PURCHASE_ORDER_STATUSES, PurchaseOrderStatus (+6 more)

### Community 16 - "Product Detail & Grid"
Cohesion: 0.19
Nodes (9): ProductDetailClient(), ProductDetailData, Props, VariantData, ProductGrid(), CUSTOM_WRITING_SLUG, fade, fadeUp (+1 more)

### Community 17 - "Customer Order History"
Cohesion: 0.26
Nodes (9): dynamic, OrderDetailPage(), AccountOrdersPage(), dynamic, STATUS_COLORS, ProductCard(), formatEGP(), getMyOrders() (+1 more)

### Community 18 - "Admin Layout & Branding"
Cohesion: 0.21
Nodes (8): AdminLayout(), AdminSidebar(), NAV, NavItem, Role, AnimatedLogoMark(), Logo(), SiteFooter()

### Community 19 - "Checkout Validation Schemas"
Cohesion: 0.23
Nodes (10): PlaceOrderResult, checkoutItemSchema, checkoutItemsSchema, checkoutItemsZodSchema, checkoutItemZodSchema, checkoutSchema, CheckoutValues, checkoutZodSchema (+2 more)

### Community 20 - "Root Locale Layout & Providers"
Cohesion: 0.22
Nodes (5): cairo, inter, SiteHeader(), ThemeProvider(), ToastProvider()

### Community 21 - "Invoice PDF Generation"
Cohesion: 0.33
Nodes (7): GET(), runtime, getInvoiceData(), InvoiceData, InvoiceDocument(), money(), styles

### Community 22 - "Admin Orders Realtime List"
Cohesion: 0.24
Nodes (8): AdminOrdersPage(), dynamic, FULFILLMENT_KEY, Order, OrdersRealtimeList(), PAYMENT_METHOD_KEY, STATUS_COLORS, getAllOrdersAdmin()

### Community 23 - "i18n Routing & Proxy Middleware"
Cohesion: 0.31
Nodes (6): { Link, redirect, usePathname, useRouter, getPathname }, routing, config, intlMiddleware, proxy(), stripLocale()

### Community 24 - "Admin Order Detail"
Cohesion: 0.29
Nodes (6): AdminOrderDetailPage(), dynamic, FULFILLMENT_KEY, PAYMENT_METHOD_KEY, OrderStatusActions(), getOrderDetailAdmin()

### Community 25 - "Misc Dependencies (S3, PDF)"
Cohesion: 0.29
Nodes (7): @aws-sdk/s3-request-presigner, clsx, dependencies, @aws-sdk/s3-request-presigner, clsx, @react-pdf/renderer, @react-pdf/renderer

### Community 26 - "OG Image Generation"
Cohesion: 0.33
Nodes (4): contentType, size, STORE_NAME, TAGLINE

### Community 27 - "Admin Purchases List"
Cohesion: 0.50
Nodes (4): AdminPurchasesPage(), dynamic, STATUS_COLORS, getAllPurchaseOrders()

## Ambiguous Edges - Review These
- `proxy.ts (Next 16 middleware.ts replacement)` → `No Live Browser QA in Build Environment`  [AMBIGUOUS]
  README.md · relation: references

## Knowledge Gaps
- **237 isolated node(s):** `dynamic`, `dynamic`, `STATUS_COLORS`, `dynamic`, `STATUS_COLORS` (+232 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `proxy.ts (Next 16 middleware.ts replacement)` and `No Live Browser QA in Build Environment`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `createClient()` connect `Admin & Account Dashboards` to `Storefront Public Pages`, `Admin CRUD Controls`, `Purchasing & Suppliers Admin`, `R2 Storage Cleanup Admin`, `Contact & Requests Email Flow`, `Admin Requests Management`, `Cart & Checkout Flow`, `Auth: Login & Register`, `Site Header & Nav`, `Settings & Delivery Fee`, `Customer Order History`, `Admin Layout & Branding`, `Checkout Validation Schemas`, `Root Locale Layout & Providers`, `Invoice PDF Generation`, `Admin Orders Realtime List`, `Admin Order Detail`, `Admin Purchases List`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **Why does `validateBoth()` connect `Admin CRUD Controls` to `Admin & Account Dashboards`, `Purchasing & Suppliers Admin`, `Contact & Requests Email Flow`, `Admin Requests Management`, `Cart & Checkout Flow`, `Auth: Login & Register`, `Settings & Delivery Fee`, `Checkout Validation Schemas`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `formatEGP()` connect `Customer Order History` to `Storefront Public Pages`, `Admin & Account Dashboards`, `Purchasing & Suppliers Admin`, `Cart & Checkout Flow`, `Product Detail & Grid`, `Admin Orders Realtime List`, `Admin Order Detail`, `Admin Purchases List`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `dynamic`, `dynamic`, `STATUS_COLORS` to the rest of the system?**
  _237 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Storefront Public Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.05346164127238706 - nodes in this community are weakly interconnected._
- **Should `Admin & Account Dashboards` be split into smaller, more focused modules?**
  _Cohesion score 0.05146242132543503 - nodes in this community are weakly interconnected._