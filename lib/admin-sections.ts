/**
 * Sections staff visibility can be narrowed to. Accounting/staff-management/storage/settings
 * stay admin-only regardless — they were never staff-visible, so there's nothing to narrow.
 * Split out from admin-permissions.ts (which needs next/headers) so client components can
 * import these plain constants without pulling server-only code into the client bundle.
 */
export const ADMIN_SECTIONS = [
  "products",
  "categories",
  "orders",
  "requests",
  "inventory",
  "purchases",
  "suppliers",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

export function isAdminSection(value: string): value is AdminSection {
  return (ADMIN_SECTIONS as readonly string[]).includes(value);
}
