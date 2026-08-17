# 7oor Store

A bilingual (Arabic default/RTL, English/LTR) e-commerce site for mobile accessories,
chargers, stationery, and printing services — with a full Odoo-style admin panel
(products, categories, sales orders, FIFO inventory, purchases, accounting, requests),
dark/light mode, and SVG draw-in animations throughout.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 (with
`next-themes` dark mode) · Supabase (Postgres, Auth, Storage, Realtime) · GSAP + Framer
Motion + AOS · Formik + Yup (client) + Zod (independent server-side re-validation) ·
Nodemailer (Gmail SMTP) · @react-pdf/renderer.

---

## 1. Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API (anon/public key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (service_role key — **server only, never expose to the client**) |
| `GMAIL_SMTP_USER` | The Gmail address sending Request/Contact notifications |
| `GMAIL_SMTP_APP_PASSWORD` | A Gmail [App Password](https://myaccount.google.com/apppasswords) (not your normal password — requires 2FA enabled on the account) |
| `REQUESTS_NOTIFICATION_EMAIL` | Where Request/Contact notifications get sent (defaults to `GMAIL_SMTP_USER` if unset) |
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (e.g. `https://your-app.vercel.app`), `http://localhost:3000` locally |

The Supabase project, schema, and seed data for this build already live in the
`iconictech-it` Supabase org — see `supabase/migrations/*.sql` for the full schema
history and `supabase/seed.sql` for sample catalog data. To point at a **different**
Supabase project, run the migrations in order against it (via the Supabase SQL editor,
the CLI, or the MCP `apply_migration` tool) before running the seed script.

## 2. Local development

```bash
npm install
npm run dev
```

Arabic is served at `/` (RTL, default locale), English at `/en` (LTR).

## 3. Creating your first admin account

Registration always creates a `customer` profile — there's no signup flow that grants
`admin`/`staff` (a customer promoting themselves is exactly the privilege-escalation bug
this build closes off, see §5). Bootstrap your first admin manually:

1. Register a normal account at `/register`.
2. In the Supabase SQL editor, run:

   ```sql
   -- Temporarily disable the anti-escalation trigger to bootstrap the first admin
   alter table profiles disable trigger trg_prevent_role_escalation;

   update profiles set role = 'admin'
   where id = (select id from auth.users where email = 'you@example.com');

   alter table profiles enable trigger trg_prevent_role_escalation;
   ```

3. Log in again (or refresh) — the account now has an **Admin** link in the header
   menu and can reach `/admin`. From there, use `/admin` (no dedicated staff-management
   UI yet — promote additional `staff` accounts the same way, or extend
   `lib/actions/*` with an admin-only "set role" action).

## 4. Deploying to Vercel

1. Push this repo to GitHub (already done if you're reading this from the repo).
2. Import the project into Vercel.
3. Add all the environment variables from §1 in the Vercel project settings.
4. Deploy. The project is domain-agnostic — the free `*.vercel.app` URL works out of
   the box; attach a custom domain later with no code changes (just update
   `NEXT_PUBLIC_SITE_URL`).

No build-time network calls to Supabase are made — every Supabase-backed route is
marked `force-dynamic` and fetches at request time, so the build never depends on
database reachability.

## 5. Security notes

A few IDOR/privilege-escalation issues were found and fixed during development
(see `supabase/migrations/0003_fix_idor_privilege_escalation.sql` for the full detail):

- **Role self-escalation** — Postgres RLS is row-level, not column-level, so a policy
  like `auth.uid() = id` doesn't stop a customer from `PATCH`-ing their *own* profile's
  `role` column to `admin`. Fixed with a `BEFORE UPDATE` trigger that rejects any
  non-admin attempt to change `role`.
- **Price tampering** — a direct client `INSERT` into `sales_order_items` could set any
  `unit_price` it likes; RLS can only check row ownership, not price correctness.
  Fixed by dropping the direct-insert policies and routing all order creation through
  `create_sales_order()`, a `SECURITY DEFINER` RPC that prices every line from the
  `products`/`product_variants` tables itself — the client only ever sends product/variant
  ids and quantities.
- **Invoice forgery** — a direct client insert into `invoices` could set
  `status = 'paid'` on a self-created invoice. Fixed by dropping that policy; invoices
  are only ever created by `confirm_sales_order()`/`mark_sales_order_done()`.
- Every state-changing RPC (`confirm_sales_order`, `cancel_sales_order`,
  `mark_sales_order_done`, `receive_purchase_order`, `adjust_stock`, `create_sales_order`)
  re-checks the caller's role (or `auth.uid()`) *inside the function body* — being
  `SECURITY DEFINER` means it runs with elevated privileges regardless of the caller's
  RLS grants, so that internal check is the actual security boundary, not just a UI
  convenience. An earlier version of these checks had a bug where an *unauthenticated*
  caller (`app_role()` returning `NULL`) silently bypassed the check, because PL/pgSQL
  treats `IF NULL THEN` as `false` — fixed by wrapping in `coalesce(app_role(), '')`.

- **Open redirect** — login's `?next=` param was passed straight to `redirect()` with
  no check, which would have let a crafted login link send an authenticated user to an
  external URL. Fixed with `sanitizeRedirectPath()` (same-site relative paths only).

Every Server Action that writes to the database validates its input through **two
independent libraries** before touching Supabase: Formik+Yup client-side for UX, and
again with Zod inside the Server Action itself (`lib/validate.ts`'s `validateBoth`) —
a bug or omission in one library's schema can't by itself let malformed data through,
since both have to agree the input is valid. The client-side check is never trusted as
the only gate.

## 6. Known limitations

- **PDF invoices render in English/Latin only.** `@react-pdf/renderer`'s built-in fonts
  (Helvetica etc.) have no Arabic glyphs, and this project was built in a sandboxed
  environment with no network access to fetch an Arabic-capable font file. Add a bundled
  `.ttf` (e.g. Cairo or Tajawal) under `public/fonts/` and register it with
  `Font.register()` in `lib/pdf/InvoiceDocument.tsx` to localize it — the rest of the
  invoice logic doesn't change.
- **No live browser QA was possible in the build environment** — the sandbox's network
  egress policy blocks direct outbound connections to the Supabase project host from
  application code (confirmed via the proxy's own status log: explicit `403` policy
  denial on every attempt, not a code bug). This did **not** block schema/data work,
  since the Supabase MCP tool talks to Supabase through the harness's own infrastructure,
  outside that sandbox proxy — every migration, RPC, and the seed data were applied and
  verified for real. It only means the running dev server couldn't reach the database
  for a visual check inside this session. TypeScript, ESLint, and `next build` were all
  run clean after every phase; do a normal `npm run dev` locally (outside this sandbox)
  or check the Vercel deployment for the first live look.
- No automated test suite — verification here was type-checking, linting, production
  builds, and direct database queries/RPC calls through the Supabase tool.

## 7. Project structure

```
app/[locale]/            Public storefront + account pages (locale-prefixed routing)
app/[locale]/admin/      Admin panel (role-gated in proxy.ts + again in admin/layout.tsx)
app/api/invoices/[id]/   PDF invoice stream (@react-pdf/renderer)
components/              UI, grouped by feature (layout, home, products, cart, checkout,
                          admin, auth, contact, requests)
lib/actions/             Server Actions (mutations) — one file per domain
lib/data/                Read-only Supabase queries used by Server Components
lib/validators/          Yup + Zod schema pairs — Yup drives Formik client-side, Zod
                          re-checks the same input inside the matching Server Action
lib/validate.ts          validateBoth() — runs both schemas, throws if either rejects
lib/supabase/            client.ts (browser), server.ts (RSC/actions), admin.ts (service role)
i18n/                    next-intl routing/navigation config
messages/{ar,en}.json    Translation strings
supabase/migrations/     Full schema history, in order
supabase/seed.sql        Sample categories/products/variants/combo/PO for a fresh project
proxy.ts                 Next 16's `middleware.ts` replacement — locale routing, session
                          refresh, and role-gating for /admin, /account, /requests, /checkout
```
