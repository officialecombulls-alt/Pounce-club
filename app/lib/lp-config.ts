/**
 * Landing-page settings that are not Shopify data.
 * Prices, compare-at prices, variants, the product title and images always come
 * from the Storefront API; never put them here.
 */

/** Brand details used by the header, footer, contact page and page titles. */
export const BRAND = {
  name: "Pounce Club",
  /**
   * Customer-service email. While empty, the Contact page and its footer link
   * stay hidden (a contact page with no way to reach anyone is worse than none).
   */
  contactEmail: "contact@pounceclub.store",
};

/** Short product name for the promo bar and sticky bar ("MouseDash"). */
export const PRODUCT_SHORT_NAME = "MouseDash";

/**
 * Shopify handle of the MouseDash product (the end of its product URL in admin).
 * The homepage and /products/<handle> redirect to /lp/<handle>.
 */
export const LP_PRODUCT_HANDLE = "mousedash-floor-projector-for-cats";

/** Money-back guarantee, in days (FAQ, contact page). Must match the Refund policy in Shopify. */
export const GUARANTEE_DAYS = 45;

/** While true, the homepage (/) redirects to the landing page. Set false to bring the store homepage back. */
export const HOME_IS_LANDING_PAGE: boolean = true;

/**
 * Temporary (302) redirect to the landing page. The query string is kept so
 * ad parameters (utm_*, fbclid, gclid) survive the hop.
 */
export function redirectToLandingPage(request: Request) {
  const { search } = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: { Location: `/lp/${LP_PRODUCT_HANDLE}${search}` },
  });
}

export type BundleTier = {
  /** Projectors in the pack. */
  quantity: number;
  /** "Single", "Duo", "Trio" (shown as "Duo pack"). */
  name: string;
  /** Sticky-bar note, e.g. "Two projectors". */
  note: string;
  /** Money off each projector, in the store currency (mirror of the Shopify automatic discount). */
  discountPerUnit: number;
};

/**
 * Pack options for the "Choose your pack" picker.
 *
 * Prices are never set here: each projector costs the variant's Storefront API
 * price. `discountPerUnit` only DISPLAYS the pack saving; Shopify charges it at
 * checkout through automatic discounts, which must match exactly:
 *   Discounts → Create discount → Amount off products → Automatic discount,
 *   "Fixed amount" per item, minimum quantity of items, applies to MouseDash:
 *     • "MouseDash Duo"  minimum 2 items → $5.00 off each
 *     • "MouseDash Trio" minimum 3 items → $10.00 off each
 * At $39.99 each that makes Duo $69.98 (save $10) and Trio $89.97 (save $30).
 * If you change an amount here, change the Shopify discount too (and vice versa).
 */
export const BUNDLE_TIERS: BundleTier[] = [
  { quantity: 1, name: "Single", note: "One projector", discountPerUnit: 0 },
  { quantity: 2, name: "Duo", note: "Two projectors", discountPerUnit: 5 },
  { quantity: 3, name: "Trio", note: "Three projectors", discountPerUnit: 10 },
];

/** Pack selected when the page loads. */
export const DEFAULT_BUNDLE_QUANTITY = 1;
