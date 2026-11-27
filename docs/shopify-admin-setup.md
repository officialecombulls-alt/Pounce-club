# Pounce Club: Shopify admin setup for the MouseDash page

Everything the landing page needs that only you can set up in Shopify admin.
Every key and amount below is copied from the code (`app/routes/lp.tsx` and
`app/lib/lp-config.ts`). If you change one in Shopify, it has to change in the code too.

**What updates by itself** once it's saved in Shopify: price, compare-at price, product
title, product photos, the 4 clip videos, the "Why" photo, reviews, the payment methods line and the policies.
**What needs a code change:** wording on the page, the pack discounts shown on the page,
delivery times, the Christmas date, layout and new sections.

---

## 0. Still open on the live site (checked 27 Nov 2026)
1. ~~Prices in NPR~~: **fixed**, the live page now shows USD ($39.00, compare-at $65.00).
2. **The product shows "Sold out".** Open the product and check:
   - **Inventory:** "Track quantity" is on with 0 in stock. Add stock, or untick "Track quantity", or tick "Continue selling when out of stock".
   - **Markets:** the product is included in the United States market.
   - **Sales channels:** the Hydrogen storefront is ticked.
3. **`www.pounceclub.store` goes to the checkout domain.** In **Sales channels → Hydrogen → Pounce Club → Storefront settings → Domains**, add `www.pounceclub.store` to **Production** too.
4. **Refund, Shipping and Terms policies aren't saved**, so those footer links show "not found". Paste them from `docs/policies.md`.

## 1. Store basics
1. **Online Store → Preferences → Password protection:** off. While it's on, checkout sends buyers to the password page.
2. **Settings → Payments:** a payment provider is active. The page's "Pay with …" line lists the cards and wallets Shopify reports, and hides itself if there are none.
3. **Settings → Store details:** business name and address are correct (checkout and emails show them).

## 2. The MouseDash product
**Products → MOUSEDASH Floor Projector for Cats:**
1. **Title** is the big heading in the buy section. It's currently all caps ("MOUSEDASH Floor Projector for Cats"); change it to "MouseDash Floor Projector for Cats" if you prefer. No code change is needed.
2. **Price** and **Compare-at price:** every price on the page comes from these. With compare-at $65 and price $39, every pack shows the $65-each price crossed out. Only use a compare-at price you have really charged.
3. **Shipping:** tick **"This is a physical product"** and enter the packed weight. Without this, checkout only asks for a billing address.
4. **Handle:** `mousedash-floor-projector-for-cats`. It has to match `LP_PRODUCT_HANDLE`. Don't change it without telling me, or the homepage breaks.
5. **Media:** all product photos appear in the buy section's dark rounded frame, cropped to fill it: square on laptops, 4:3 on phones. Keep the product centered. With more than one photo, arrows appear and phones can swipe.

## 3. Clip videos (one product metafield)
The "Watch real cats hunt" section has 4 vertical clip frames.
**Settings → Metafields and metaobjects → Products → Add definition:**

| Name | Namespace and key | Type | Accepts | Storefronts access |
|---|---|---|---|---|
| LP Clip videos | `custom.lp_clip_videos` | File · **List of files** | Videos | **On** |

Shopify fills in the key from the name; **edit it so it matches exactly**.
Then open the product, scroll to **Metafields → LP Clip videos**, upload up to 4 vertical (9:16) MP4 clips **in this order**, and **Save**:

| # | Title on the page | What to film |
|---|---|---|
| 1 | Lights down, mice out | The plug-in, the dark room and the first mouse |
| 2 | The first pounce | Close on paws hitting a glowing hole |
| 3 | Two cats, one hunt | Each cat picks a hole and waits |
| 4 | The 3 a.m. zoomies fix | Ten minutes of chasing before bed |

Empty frames keep the design's illustration. **Once at least one clip is uploaded**, the page also shows
"Filmed with real cats in real homes. No AI in our videos." and "Every clip is one take… No edits that make
the mice look brighter than they are." Only upload clips that make those true.

If you created the earlier metafields (`lp_chase_video`, `lp_projection_image`, `lp_room_image`, `lp_kit_image`), the new design doesn't use them. You can delete them.

### "Why cats can't leave it alone" photo
One more product metafield (**Settings → Metafields and metaobjects → Products → Add definition**):

| Name | Namespace and key | Type | Accepts | Storefronts access |
|---|---|---|---|---|
| LP Why image | `custom.lp_why_image` | File · **One file** | Images | **On** |

Upload one landscape photo, ideally a cat crouched or pouncing at the projected mice in a dim room. It shows
beside the heading, cropped to **4:3 from the center**, so keep the cat in the middle. Use at least 1440 px wide.
Until it's uploaded, the slot shows the design's illustration.

## 3b. Customer reviews (metaobject)
The "What cat owners say" section and the star rating under the product title read **Review** entries.
Both stay hidden until there is at least one **Active** review. Only add real customer reviews.

**Settings → Metafields and metaobjects → Metaobjects → Add definition**
- **Name:** `Review`. **Type (handle):** must be exactly **`review`**.
- **Fields** (the key is shown under each field name; edit it to match exactly):

| Field name | Key | Type | Required |
|---|---|---|---|
| Name | `name` | Single line text | Yes |
| Rating | `rating` | Rating (min 1, max 5) | Yes |
| Review | `review` | Multi-line text | Yes |
| Photo | `photo` | File, One file, Images | No |
| Location | `location` | Single line text | No |
| Date | `date` | Date | No |
| Verified | `verified` | True or false | No |

- **Options:** turn on **Storefronts access**, and turn on **Active-draft status**.
- **Save.**

**Add reviews:** **Content → Metaobjects → Review → Add entry**. Fill the fields, set the status to **Active**, then **Save**.
An entry left as Draft stays hidden.

How it shows: newest first (by Date, else by last edit), with average, star breakdown and a swipeable row
of cards. "✓ Verified buyer" shows when Verified is on. Photos are cropped to 4:3 from the center.

## 4. Pack discounts (2-pack and 3-pack)
The page shows 2-pack and 3-pack prices, but **Shopify only charges them if these discounts exist**.
**Discounts → Create discount → Amount off products → Method: Automatic discount**, one each:

| Title | Discount value | Applies to | Minimum purchase requirement | Combinations |
|---|---|---|---|---|
| MouseDash 2-pack | Fixed amount **$5.00**, **"Apply discount to each eligible item"** (not "once per order") | Specific products → MouseDash | Minimum quantity of items: **2** | leave all unticked |
| MouseDash 3-pack | Fixed amount **$10.00**, **"Apply discount to each eligible item"** | Specific products → MouseDash | Minimum quantity of items: **3** | leave all unticked |

With 3 items both discounts qualify, and Shopify applies the better one.
At today's $39.00 price, checkout totals should be: **1 = $39.00, 2 = $68.00, 3 = $87.00**.
Tell me when they're saved and I'll check all three totals with test carts. That doesn't place any orders.

## 5. Shipping and Markets
1. **Settings → Shipping and delivery:** a **free** US rate. The page promises **ships in 1 to 3 days, arrives in 5 to 10 business days, with tracking**, so name the rate to match, e.g. "Free tracked shipping (5–10 business days)".
2. **Settings → Markets:** the United States market is active.
3. **Christmas:** the page says "Order by Dec 8 for delivery before Christmas" until the end of Dec 8 (US Eastern), then drops it by itself.

## 6. Policies
**Settings → Policies:** paste the Refund, Shipping and Terms text from `docs/policies.md` and save.
In the Privacy policy, replace any personal email with `contact@pounceclub.store`.

## 7. Domains
1. **Hydrogen → Pounce Club → Storefront settings → Domains:** `pounceclub.store` and `www.pounceclub.store` both on **Production**.
2. `checkout.pounceclub.store` stays the **Online Store's primary domain**, so checkout runs on your own domain.
3. "View your store" in admin opens the Online Store theme, **not** this page. Check https://pounceclub.store instead.

## 8. Brand at checkout
**Settings → Checkout → Customize:** logo, and the page's red `#e3242b` as the accent and button color, so checkout looks like the page.
