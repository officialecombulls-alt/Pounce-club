import type { BundleTier } from "~/lib/lp-config";

import type { LpVariant } from "./useLpCheckout";

export type BundleOffer = BundleTier & {
  /** Price per projector after the pack discount. */
  each: number;
  /** What the pack costs. */
  total: number;
  /** Regular price of the same number of projectors (compare-at, else the variant price). */
  regularTotal: number;
  /** regularTotal − total; 0 when there is no saving to show. */
  saving: number;
  currencyCode: string;
};

const cents = (amount: number) => Math.round(amount * 100) / 100;

/** Per-pack prices from the variant's Storefront API price and compare-at price. */
export function bundleOffers(tiers: BundleTier[], variant: LpVariant): BundleOffer[] {
  const price = Number.parseFloat(variant.price.amount);
  const compareAt = variant.compareAtPrice ? Number.parseFloat(variant.compareAtPrice.amount) : null;
  const regular = compareAt && compareAt > price ? compareAt : price;
  return tiers.map((tier) => {
    const each = cents(Math.max(0, price - tier.discountPerUnit));
    const total = cents(each * tier.quantity);
    const regularTotal = cents(regular * tier.quantity);
    return {
      ...tier,
      each,
      total,
      regularTotal,
      saving: Math.max(0, cents(regularTotal - total)),
      currencyCode: variant.price.currencyCode,
    };
  });
}

/** "$39.99", always with cents (prices, as in the reference). */
export function formatMoney(amount: number, currencyCode: string, locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode }).format(amount);
}

/** "$10", or "$10.50" when there are cents (savings, as in the reference). */
export function formatSaving(amount: number, currencyCode: string, locale = "en-US") {
  const whole = Math.abs(amount - Math.round(amount)) < 0.005;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

/** "1 projector", "2 projectors". */
export function projectorCount(quantity: number) {
  return `${quantity} ${quantity === 1 ? "projector" : "projectors"}`;
}
