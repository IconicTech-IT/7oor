export const ROLES = ["admin", "staff", "customer"] as const;
export type Role = (typeof ROLES)[number];

export const PRODUCT_TYPES = ["simple", "combo", "custom_request"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const SALES_ORDER_STATUSES = ["new", "confirmed", "done", "cancelled"] as const;
export type SalesOrderStatus = (typeof SALES_ORDER_STATUSES)[number];

export const FULFILLMENT_METHODS = ["pickup", "delivery"] as const;
export type FulfillmentMethod = (typeof FULFILLMENT_METHODS)[number];

export const PAYMENT_METHODS = ["cash", "instapay", "vodafone_cash", "other_wallet"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const REQUEST_STATUSES = [
  "new",
  "in_review",
  "quoted",
  "accepted",
  "rejected",
  "completed",
] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const PURCHASE_ORDER_STATUSES = ["draft", "ordered", "received"] as const;
export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

/** Product with pricing_unit === 'job' routes to the Requests flow instead of Add to Cart. */
export const CUSTOM_WRITING_SLUG = "page-write";
