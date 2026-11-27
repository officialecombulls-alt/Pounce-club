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

/** Short product name for headings, the sticky bar and the promo copy ("MouseDash"). */
export const PRODUCT_SHORT_NAME = "MouseDash";

/**
 * Shopify handle of the MouseDash product (the end of its product URL in admin).
 * The homepage and /products/<handle> redirect to /lp/<handle>.
 */
export const LP_PRODUCT_HANDLE = "mousedash-floor-projector-for-cats";

/** Money-back guarantee, in days. Must match the Refund policy in Shopify. */
export const GUARANTEE_DAYS = 45;

/** Order handling and US delivery times. Must match Settings → Shipping and the Shipping policy. */
export const HANDLING_TIME = "1 to 3 days";
export const DELIVERY_TIME = "5 to 10 business days";
/** Order-to-door window in business days (handling + delivery), for the bundle picker's "Arrives …" dates. */
export const ARRIVAL_BUSINESS_DAYS: [number, number] = [6, 13];

/**
 * Christmas delivery cutoff: orders placed before the end of Mon Dec 8 (US Eastern)
 * arrive before Christmas. After it, the promo bar, gift-section date card and the
 * FAQ line drop the Christmas wording by themselves.
 */
export const CHRISTMAS_CUTOFF = new Date("2026-12-09T04:59:59Z").getTime();
export const CHRISTMAS_CUTOFF_LABEL = "Dec 8";

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
  /** Line under the pack name, e.g. "Two rooms, or one to gift". */
  note: string;
  /** Pill next to the pack name, e.g. "Best value". */
  tag?: string;
  /** Red pill instead of the dark one. */
  tagRed?: boolean;
  /** Money off each projector, in the store currency (mirror of the Shopify automatic discount). */
  discountPerUnit: number;
};

/**
 * Pack options for the "Choose your bundle" picker.
 *
 * Prices are never set here: each projector costs the product's Shopify price,
 * and the crossed-out price is its compare-at price. `discountPerUnit` only
 * DISPLAYS the pack price; Shopify charges it at checkout through automatic
 * discounts, which must match exactly:
 *   Discounts → Create discount → Amount off products → Automatic discount,
 *   "Fixed amount", applied to each eligible item, minimum quantity of items,
 *   applies to MouseDash:
 *     • "MouseDash 2-pack"  minimum 2 items → $5.00 off each
 *     • "MouseDash 3-pack"  minimum 3 items → $10.00 off each
 * If you change an amount here, change the Shopify discount too (and vice versa).
 */
export const BUNDLE_TIERS: BundleTier[] = [
  { quantity: 1, note: "For one curious cat", discountPerUnit: 0 },
  { quantity: 2, note: "Two rooms, or one to gift", tag: "Great for gifting", discountPerUnit: 5 },
  { quantity: 3, note: "Multi-cat homes and gift lists", tag: "Best value", tagRed: true, discountPerUnit: 10 },
];

/** Pack selected when the page loads. */
export const DEFAULT_BUNDLE_QUANTITY = 2;
