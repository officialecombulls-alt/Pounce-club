/**
 * Pounce Club store policies, written from the landing page's promises.
 *
 * The /policies/:handle route serves these whenever the matching policy in
 * Shopify admin (Settings → Policies) is empty. Once a policy is saved in
 * Shopify, Shopify's version wins, so there is never a second copy to keep in
 * sync on the site. Pasting these same texts into Shopify (docs/policies.md) is
 * still recommended: Shopify checkout and order emails link to Shopify's copy.
 *
 * Keep these in step with lp-config.ts: GUARANTEE_DAYS, HANDLING_TIME,
 * DELIVERY_TIME and BRAND.contactEmail are used below.
 */
import { BRAND, DELIVERY_TIME, GUARANTEE_DAYS, HANDLING_TIME, PRODUCT_SHORT_NAME } from "~/lib/lp-config";

export type SitePolicy = { handle: string; title: string; body: string };

const EMAIL = BRAND.contactEmail;
const MAIL = `<a href="mailto:${EMAIL}">${EMAIL}</a>`;
const UPDATED = "<p><em>Last updated: November 27, 2026</em></p>";

const SHIPPING = `
${UPDATED}
<h2>Where we ship</h2>
<p>We currently ship to addresses in the United States.</p>

<h2>Free tracked shipping</h2>
<p>Shipping is free on every order. Every order ships with tracking.</p>

<h2>How long it takes</h2>
<p>We prepare and ship orders within ${HANDLING_TIME}. Delivery then takes ${DELIVERY_TIME}. Your estimated delivery date is also shown at checkout before you pay.</p>

<h2>Tracking your order</h2>
<p>As soon as your order ships, we'll email you a tracking link.</p>

<h2>Wrong address</h2>
<p>Please double-check your shipping address at checkout. If you spot a mistake, email us at ${MAIL} as soon as possible. We can update the address before your order ships, but not after.</p>

<h2>Lost or late packages</h2>
<p>If your tracking hasn't updated for 7 days, or your order hasn't arrived 14 days after the estimated delivery date, email ${MAIL} with your order number and we'll look into it. If the carrier confirms the package is lost, we'll send a free replacement or give you a full refund.</p>

<h2>Damaged or missing items</h2>
<p>If something arrives damaged or missing, see our <a href="/policies/refund-policy">Refund policy</a>. We'll send a replacement or refund you.</p>

<h2>Questions</h2>
<p>Email ${MAIL} and a real person will reply.</p>
`;

const REFUND = `
${UPDATED}
<h2>Our ${GUARANTEE_DAYS}-day money-back guarantee</h2>
<p>If your ${PRODUCT_SHORT_NAME} isn't right for you or your cat, email us within ${GUARANTEE_DAYS} days of delivery and we'll refund you.</p>

<h2>How to ask for a refund</h2>
<p>Email ${MAIL} with:</p>
<ul>
  <li>your order number</li>
  <li>a short note on why it didn't work for you</li>
</ul>
<p>That's all we need. You don't need to send the product back.</p>

<h2>What we refund</h2>
<p>We refund the full amount you paid for the items. Refunds go back to your original payment method. Once we've approved your refund, it usually takes your bank or card provider 5 to 10 business days to show it.</p>

<h2>Packs</h2>
<p>You can ask for a refund on a whole 2-pack or 3-pack, or just part of it. If you keep part of a pack, we'll refund the projectors you're not keeping at the per-projector price you paid.</p>

<h2>Damaged, faulty or missing items</h2>
<p>If your order arrives damaged, something doesn't work, or something is missing, email us within ${GUARANTEE_DAYS} days of delivery with your order number and a photo or short video of the problem. We'll send a free replacement or a full refund, whichever you prefer.</p>

<h2>Cancelling an order</h2>
<p>To cancel, email us before your order ships and we'll cancel it and refund you in full. Once it has shipped, you're still covered by the ${GUARANTEE_DAYS}-day guarantee above.</p>

<h2>Questions</h2>
<p>Email ${MAIL} and a real person will reply.</p>
`;

const TERMS = `
${UPDATED}
<h2>Overview</h2>
<p>This website and store are operated by ${BRAND.name} ("${BRAND.name}", "we", "us"). By using pounceclub.store or placing an order, you agree to these terms.</p>

<h2>Products and safety</h2>
<p>${PRODUCT_SHORT_NAME} is a toy for supervised play. Stay nearby while your cat plays, and unplug the projector between games. Keep the power cable out of reach of pets that chew, and don't point the lens at anyone's eyes. Not a toy for children under 3. Product photos and videos are for illustration.</p>

<h2>Prices and payment</h2>
<p>Prices are shown in US dollars and can change at any time. If an item is listed at the wrong price because of an error, we may cancel the order and give you a full refund. We may refuse or cancel any order, for example if we suspect fraud. If we cancel, you'll get a full refund.</p>

<h2>Shipping, returns and refunds</h2>
<p>Shipping is covered by our <a href="/policies/shipping-policy">Shipping policy</a>, and refunds by our <a href="/policies/refund-policy">Refund policy</a>. Both are part of these terms.</p>

<h2>Our content</h2>
<p>All text, images, videos, logos and designs on this site belong to ${BRAND.name} or are used with permission. You may not copy or reuse them without our written permission.</p>

<h2>Limitation of liability</h2>
<p>To the extent the law allows, ${BRAND.name} is not responsible for indirect or consequential losses arising from use of our products or website. Our total liability for any order is limited to the amount you paid for it. Nothing in these terms limits rights you have under consumer protection laws.</p>

<h2>Privacy</h2>
<p>How we handle your personal information is explained in our <a href="/policies/privacy-policy">Privacy policy</a>.</p>

<h2>Changes to these terms</h2>
<p>We may update these terms from time to time. The version on this page applies to any order placed while it is shown here.</p>

<h2>Governing law</h2>
<p>These terms are governed by the laws of the country where ${BRAND.name} is registered. This does not take away any consumer protection rights you have under the laws of the country where you live.</p>

<h2>Contact</h2>
<p>Questions about these terms? Email ${MAIL}.</p>
`;

/** Site-written policies by handle, used when Shopify's policy of that handle is empty. */
export const SITE_POLICIES: Record<string, SitePolicy> = {
  "shipping-policy": { handle: "shipping-policy", title: "Shipping policy", body: SHIPPING },
  "refund-policy": { handle: "refund-policy", title: "Refund policy", body: REFUND },
  "terms-of-service": { handle: "terms-of-service", title: "Terms of service", body: TERMS },
};

/** Free webmail addresses (an account owner's inbox) shown in a Shopify policy are swapped for the brand email. */
const WEBMAIL = /[\w.+-]+@(?:gmail|googlemail|yahoo|outlook|hotmail|live|icloud|me|aol|proton|protonmail)\.[a-z]{2,}(?:\.[a-z]{2,})?/gi;

export function withBrandEmail(html: string): string {
  return EMAIL ? html.replace(WEBMAIL, EMAIL) : html;
}
