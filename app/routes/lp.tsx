import { AnalyticsEvent, gql } from "@shopify/hydrogen";
import { useCallback, useEffect, useMemo, useState } from "react";
import { data as dataResponse, redirect } from "react-router";

import { bundleOffers, formatSaving } from "~/components/lp/bundles";
import { buyLabel, BuyBox } from "~/components/lp/BuyBox";
import { Gallery } from "~/components/lp/Gallery";
import { LpFooter, LpHeader, LpPromo, StickyBar } from "~/components/lp/LpChrome";
import type { LpImage, LpMediaSlot, LpVideo } from "~/components/lp/LpMedia";
import { Demo, Faq, Intro, Kit, Setup } from "~/components/lp/LpSections";
import { type LpCartLine, type LpVariant, useLpCheckout } from "~/components/lp/useLpCheckout";
import { BRAND, BUNDLE_TIERS, DEFAULT_BUNDLE_QUANTITY, PRODUCT_SHORT_NAME } from "~/lib/lp-config";
import { storefrontClientContext } from "~/lib/storefront";
import lpStylesHref from "~/styles/lp.css?url";

import type { Route } from "./+types/lp";

const LP_PRODUCT_QUERY = gql(`
  query LandingPageProduct($handle: String!) {
    product(handle: $handle) {
      id
      handle
      title
      vendor
      description
      featuredImage {
        url
        altText
        width
        height
      }
      # Landing-page media, uploaded on the product in Shopify admin
      # (Products → MouseDash → Metafields). Empty slots show the design's placeholder.
      lpChaseVideo: metafield(namespace: "custom", key: "lp_chase_video") {
        reference {
          ... on Video {
            alt
            sources {
              url
              mimeType
              height
            }
            previewImage {
              url
            }
          }
        }
      }
      lpProjectionImage: metafield(namespace: "custom", key: "lp_projection_image") {
        reference {
          ...LpMetafieldImage
        }
      }
      lpRoomImage: metafield(namespace: "custom", key: "lp_room_image") {
        reference {
          ...LpMetafieldImage
        }
      }
      lpKitImage: metafield(namespace: "custom", key: "lp_kit_image") {
        reference {
          ...LpMetafieldImage
        }
      }
      priceRange {
        minVariantPrice {
          amount
          currencyCode
        }
      }
      variants(first: 25) {
        nodes {
          id
          title
          sku
          availableForSale
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
  fragment LpMetafieldImage on MediaImage {
    image {
      url
      altText
      width
      height
    }
  }
`);

/** The landing page renders its own header and footer. */
export const handle = { storeChrome: false };

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: lpStylesHref },
  {
    rel: "preload",
    href: "/fonts/inter-latin.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

export function meta({ data }: Route.MetaArgs) {
  if (!data?.product) return [{ title: BRAND.name }];
  return [
    { title: `${data.product.title} | ${BRAND.name}` },
    {
      name: "description",
      content:
        data.product.description?.slice(0, 160) ||
        "Little mice dart between projected holes on your floor. Your cat picks the next pounce.",
    },
  ];
}

type MetafieldRef = Record<string, unknown> | null | undefined;

/** The image of a file metafield's reference; anything that isn't an image counts as empty. */
function metafieldImage(reference: MetafieldRef): LpImage | null {
  return reference && "image" in reference ? (reference.image as LpImage | null) : null;
}

/** The video of a file metafield's reference; anything that isn't a video counts as empty. */
function metafieldVideo(reference: MetafieldRef): LpVideo | null {
  return reference && "sources" in reference ? (reference as unknown as LpVideo) : null;
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) throw new Response("Not Found", { status: 404 });

  const storefrontClient = context.get(storefrontClientContext);
  const { data, errors } = await storefrontClient.graphql(LP_PRODUCT_QUERY, {
    variables: { handle },
  });
  if (errors?.length) {
    console.error(`Landing page product query failed: ${errors.map((e) => e.message).join("\n")}`);
  }
  if (!data?.product) throw new Response("Not Found", { status: 404 });

  const { product } = data;
  const name = PRODUCT_SHORT_NAME;
  // The design's five media slots. The gallery shows all five; the sections reuse four.
  const media: Record<string, LpMediaSlot> = {
    product: {
      slot: "product",
      label: `${name} projector`,
      kind: "Product photo",
      tag: "Photo",
      image: product.featuredImage,
    },
    chase: {
      slot: "chase",
      label: "Cat chasing the projection",
      kind: "Demo video",
      tag: "Video",
      video: metafieldVideo(product.lpChaseVideo?.reference),
    },
    detail: {
      slot: "detail",
      label: "Mouse pattern on the floor",
      kind: "Projection close-up",
      tag: "Photo",
      image: metafieldImage(product.lpProjectionImage?.reference),
    },
    room: {
      slot: "room",
      label: "Projector placement on the floor",
      kind: "Room setup photo",
      tag: "Room view",
      image: metafieldImage(product.lpRoomImage?.reference),
    },
    kit: {
      slot: "kit",
      label: "Projector and cable, laid out together",
      kind: "Box contents photo",
      tag: "Kit photo",
      image: metafieldImage(product.lpKitImage?.reference),
    },
  };

  return {
    product: {
      id: product.id,
      title: product.title,
      vendor: product.vendor,
      description: product.description,
      priceRange: product.priceRange,
      variants: product.variants.nodes,
    },
    media,
  };
}

const LP_CHECKOUT_MUTATION = gql(`
  mutation LandingPageCheckout($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        checkoutUrl
      }
      userErrors {
        message
      }
    }
  }
`);

const VARIANT_GID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;

/** Validates the posted lines; returns null for anything malformed. */
function parseLines(raw: FormDataEntryValue | null): LpCartLine[] | null {
  if (typeof raw !== "string") return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 10) return null;
  const lines: LpCartLine[] = [];
  for (const line of parsed as Array<Record<string, unknown>>) {
    const { merchandiseId, quantity, attributes = [] } = line ?? {};
    if (typeof merchandiseId !== "string" || !VARIANT_GID.test(merchandiseId)) return null;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
    if (!Array.isArray(attributes)) return null;
    const cleanAttributes = [];
    for (const attribute of attributes as Array<Record<string, unknown>>) {
      if (typeof attribute?.key !== "string" || typeof attribute?.value !== "string") return null;
      cleanAttributes.push({ key: attribute.key, value: attribute.value });
    }
    lines.push({ merchandiseId, quantity, attributes: cleanAttributes });
  }
  return lines;
}

/**
 * Direct checkout: a fresh cart with only the posted lines, then straight to
 * Shopify checkout through its `checkoutUrl`. No store cart, no cart drawer.
 */
export async function action({ context, request }: Route.ActionArgs) {
  const lines = parseLines((await request.formData()).get("lines"));
  if (!lines) return dataResponse({ error: "Something went wrong. Please try again." }, { status: 400 });

  const storefrontClient = context.get(storefrontClientContext);
  const { data, errors } = await storefrontClient.graphql(LP_CHECKOUT_MUTATION, {
    variables: { lines },
  });
  const checkoutUrl = data?.cartCreate?.cart?.checkoutUrl;
  if (!checkoutUrl) {
    const messages = [...(errors ?? []), ...(data?.cartCreate?.userErrors ?? [])].map((e) => e.message);
    console.error(`Landing page checkout failed: ${messages.join("\n")}`);
    return dataResponse(
      {
        error:
          data?.cartCreate?.userErrors?.[0]?.message ?? "Checkout is unavailable right now. Please try again.",
      },
      { status: 502 },
    );
  }
  return redirect(checkoutUrl);
}

type LpProduct = Route.ComponentProps["loaderData"]["product"];

/** Same PRODUCT_VIEWED payload the PDP publishes (routes/product.tsx). */
function ProductViewedTracker({ product, variant }: { product: LpProduct; variant: LpProduct["variants"][number] | undefined }) {
  useEffect(() => {
    window.Shopify?.analytics?.publish(AnalyticsEvent.PRODUCT_VIEWED, {
      products: [
        {
          id: product.id,
          title: product.title,
          price: variant?.price ?? product.priceRange.minVariantPrice,
          vendor: product.vendor ?? "",
          variantId: variant?.id ?? product.id,
          variantTitle: variant?.title ?? product.title,
          quantity: 1,
          sku: variant?.sku,
        },
      ],
    });
  }, [product, variant]);
  return null;
}

export default function LandingPage({ loaderData }: Route.ComponentProps) {
  const { product, media } = loaderData;

  // Packs are quantities of the first available variant; Shopify automatic
  // discounts charge the pack price at checkout (see BUNDLE_TIERS).
  const variantNode = product.variants.find((candidate) => candidate.availableForSale) ?? product.variants[0];
  const available = Boolean(variantNode?.availableForSale);
  const variant: LpVariant | undefined = useMemo(
    () =>
      variantNode
        ? {
            id: variantNode.id,
            title: variantNode.title,
            price: variantNode.price,
            compareAtPrice: variantNode.compareAtPrice,
          }
        : undefined,
    [variantNode],
  );
  const offers = useMemo(() => (variant ? bundleOffers(BUNDLE_TIERS, variant) : []), [variant]);

  // "Save up to $30 on MouseDash bundles", from Shopify prices (no hard-coded amount).
  const best = offers.reduce<(typeof offers)[number] | null>(
    (top, offer) => (offer.saving > (top?.saving ?? 0) ? offer : top),
    null,
  );
  const promo = best
    ? `Save up to ${formatSaving(best.saving, best.currencyCode)} on ${PRODUCT_SHORT_NAME} bundles`
    : null;

  const [quantity, setQuantity] = useState(DEFAULT_BUNDLE_QUANTITY);
  const selected = offers.find((offer) => offer.quantity === quantity) ?? offers[0];

  const lines: LpCartLine[] = useMemo(
    () =>
      variant && selected && available
        ? [{ merchandiseId: variant.id, quantity: selected.quantity, attributes: [] }]
        : [],
    [variant, selected, available],
  );

  const { checkout, pending, error } = useLpCheckout();
  const buy = useCallback(() => checkout(lines), [checkout, lines]);

  const views = [media.product, media.chase, media.detail, media.room, media.kit];

  return (
    <div className="lp" id="top">
      <ProductViewedTracker product={product} variant={variantNode} />
      <a className="skip" href="#shop">
        Skip to purchase options
      </a>
      <LpPromo text={promo} href="#shop" />
      <LpHeader />
      <main id="main-content" tabIndex={-1}>
        <section id="product">
          <div className="wrap">
            <Intro />
            <div className="pdp">
              <Gallery views={views} />
              <BuyBox
                title={product.title}
                offers={offers}
                selected={selected}
                onSelect={setQuantity}
                onBuy={buy}
                pending={pending}
                error={error}
                available={available}
              />
            </div>
          </div>
        </section>
        <Demo chase={media.chase} detail={media.detail} />
        <Setup room={media.room} />
        <Kit kit={media.kit} />
        <Faq />
      </main>
      <StickyBar
        name={PRODUCT_SHORT_NAME}
        packLabel={selected ? `${selected.name} pack · ${selected.note}` : ""}
        buttonLabel={available ? buyLabel(selected, pending) : "Sold out"}
        onBuy={buy}
        disabled={!lines.length}
        pending={pending}
      />
      <LpFooter />
    </div>
  );
}
