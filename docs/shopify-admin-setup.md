# Pounce Club: Shopify admin setup for the MouseDash page

Everything the landing page needs that only you can set up in Shopify admin.
Every key and amount below is copied from the code (`app/routes/lp.tsx` and
`app/lib/lp-config.ts`). If you change one in Shopify, it has to change in the code too.

**What updates by itself** once it's saved in Shopify: price, compare-at price,
product title, product photo, the 4 section images and the video, and the policies.
**What needs a code change:** wording on the page, the pack discounts shown on the page,
layout and new sections.

---

## 0. Fix these first (found on the live site, 27 Nov 2026)
1. **Prices show in NPR, not USD.** The page asks Shopify for United States prices, but they come back as
   "NPR 39.00", so the store's currency is Nepalese rupees. To sell at $39.99 in the US, either:
   - **Settings → General → Store defaults → Currency display: change the store currency to USD** (only possible before the first sale; simplest if you sell only in the US), then set the price to `39.99`; or
   - **Settings → Markets → add a "United States" market** with currency **USD**, and set a **fixed US price** of $39.99 on the product (Markets → United States → Products and pricing).
   The pack discounts ($5 and $10 off each) are in the store currency too, so they only work out once prices are in USD.
2. **The product shows "Sold out".** Open the product and check:
   - **Inventory:** "Track quantity" is on with 0 in stock. Add stock, or untick "Track quantity", or tick "Continue selling when out of stock".
   - **Markets:** the product is included in the United States market.
   - **Sales channels:** the Hydrogen storefront is ticked.
3. **`www.pounceclub.store` goes to the checkout domain.** In **Sales channels → Hydrogen → Pounce Club → Storefront settings → Domains**, add `www.pounceclub.store` to **Production** too. `pounceclub.store` already works, and `checkout.pounceclub.store` is right as the Online Store's primary domain.

## 1. Store basics
1. **Online Store → Preferences → Password protection:** off. While it's on, checkout sends buyers to the password page.
2. **Settings → Payments:** a payment provider is active. Without one, checkout says "This store can't accept payments right now".
3. **Settings → Store details:** business name and address are correct (checkout and emails show them).

## 2. The MouseDash product
**Products → MouseDash Cat Projector:**
1. **Title:** `MouseDash Cat Projector` (shown as the big heading next to the gallery).
2. **Price:** `39.99`. **Compare-at price:** leave empty unless the regular price really is higher. When it's set, the page shows it crossed out on every pack.
3. **Shipping:** tick **"This is a physical product"** and enter the packed weight. Without this, checkout only asks for a billing address and charges no shipping.
4. **Handle** (Search engine listing → URL handle): `mousedash-floor-projector-for-cats`. It has to match `LP_PRODUCT_HANDLE` in `app/lib/lp-config.ts`. Don't change it without telling me, or the homepage breaks.
5. **Media:** the **first** product image is the "Product" view in the gallery and the first thing people see. Frames are light grey (`#efefef`) and photos are shown whole, not cropped, so a photo on a light grey or transparent background blends in best. Use landscape, at least 1400 px wide.
6. **Sales channels:** make sure the product is available on the Hydrogen storefront.

## 3. Media slots (product metafields)
**Settings → Metafields and metaobjects → Products → Add definition**, once per row.
Shopify fills in the key from the name automatically. **Edit the key so it matches exactly.**

| Name | Namespace and key | Type | Accepts | Storefronts access |
|---|---|---|---|---|
| LP Chase video | `custom.lp_chase_video` | File · **One file** | Videos | **On** |
| LP Projection close-up | `custom.lp_projection_image` | File · **One file** | Images | **On** |
| LP Room setup | `custom.lp_room_image` | File · **One file** | Images | **On** |
| LP Box contents | `custom.lp_kit_image` | File · **One file** | Images | **On** |

Then open **Products → MouseDash Cat Projector**, scroll to **Metafields**, upload one file per slot, and **Save**:

| Field | What to upload | Where it shows |
|---|---|---|
| LP Chase video | A cat chasing the projected mouse. MP4, landscape, short (10–30 s). | Gallery "Chase video" + "Follow the mouse." (large frame) |
| LP Projection close-up | The mouse-and-holes pattern on the floor, close up | Gallery "Projection" + "Follow the mouse." (small frame) |
| LP Room setup | The projector on the floor in a room, lens facing open space | Gallery "Room setup" + "Ready for the first pounce?" |
| LP Box contents | Projector and power cable laid out together | Gallery "In the box" + "What comes with MouseDash?" |

An empty slot shows the design's grey placeholder (icon and label), so you can see which ones are still missing. **Fill all four before launch.**

## 4. Pack discounts (Duo and Trio)
The page shows Duo and Trio prices, but **Shopify only charges them if these discounts exist**.
**Discounts → Create discount → Amount off products → Method: Automatic discount**, one each:

| Title | Discount value | Applies to | Minimum purchase requirement | Combinations |
|---|---|---|---|---|
| MouseDash Duo | Fixed amount **$5.00**, **"Apply discount to each eligible item"** (not "once per order") | Specific products → MouseDash Cat Projector | Minimum quantity of items: **2** | leave all unticked |
| MouseDash Trio | Fixed amount **$10.00**, **"Apply discount to each eligible item"** | Specific products → MouseDash Cat Projector | Minimum quantity of items: **3** | leave all unticked |

With 3 items both discounts qualify, and Shopify applies the better one (Trio).
Checkout totals should then be: **1 = $39.99, 2 = $69.98, 3 = $89.97**.
Tell me when they're saved and I'll check all three totals with test carts. That doesn't place any orders.

## 5. Shipping and Markets
1. **Settings → Shipping and delivery → General shipping rates:** create zones and rates that match what you promise (countries, price, delivery time). Name the rate so customers understand it, e.g. "Standard shipping (5–8 business days)".
2. **Settings → Markets:** every country in a shipping zone must be in an **active** market, or it can't check out.
3. The FAQ answer "What are the shipping and return terms?" links to your Shipping and Refund policies, so keep those in sync with the rates.

## 6. Policies
**Settings → Policies:** save text in **Refund policy, Shipping policy, Privacy policy and Terms of service**.
The footer links to all four, and a policy that isn't saved gives a 404 page. If you like, I can draft them from your shipping and return terms.

## 7. Contact email
Send me the customer-service email. Until it's set in `app/lib/lp-config.ts` (`BRAND.contactEmail`),
the Contact page and its footer link stay hidden.

## 8. Connect the storefront and domain
1. **Sales channels → Hydrogen → Create storefront → connect the GitHub repo `officialecombulls-alt/Pounce-club`.**
   Shopify adds a deploy workflow to the repo. **From then on, every push to `main` goes live.**
2. **Hydrogen → Pounce Club → Storefront settings → Domains:** assign your domain and `www.` to **Production**.
   (If the domain is attached to the Online Store instead, it shows the theme, not this page.)
3. **Checkout on your own domain:** add `checkout.<your-domain>` and make it the **Online Store's primary domain**. Otherwise checkout runs on `*.myshopify.com`.
4. "View your store" in admin opens the Online Store theme, **not** this page. Check the Hydrogen production domain instead.

## 9. Brand at checkout
**Settings → Checkout → Customize:** logo, and the page's red `#b3122a` as the accent and button color, so checkout looks like the page.
