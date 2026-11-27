import { AnalyticsEvent, gql } from "@shopify/hydrogen";
import { useCallback, useEffect, useMemo, useState } from "react";
import { data as dataResponse, redirect, useRouteLoaderData } from "react-router";

import { bundleOffers, formatMoney, projectorCount } from "~/components/lp/bundles";
import { BuySection, buyLabel } from "~/components/lp/BuyBox";
import { LpDefs } from "~/components/lp/LpArt";
import { LpFooter, LpNav, LpStrip, StickyBar } from "~/components/lp/LpChrome";
import {
  CareAndFaq,
  Closing,
  Gift,
  Hero,
  HowItWorks,
  type LpVideo,
  Watch,
  Specs,
  Why,
} from "~/components/lp/LpSections";
import { type LpCartLine, type LpVariant, useLpCheckout } from "~/components/lp/useLpCheckout";
import {
  BRAND,
  BUNDLE_TIERS,
  CHRISTMAS_CUTOFF,
  CHRISTMAS_CUTOFF_LABEL,
  DEFAULT_BUNDLE_QUANTITY,
  PRODUCT_SHORT_NAME,
} from "~/lib/lp-config";
import { storefrontClientContext } from "~/lib/storefront";
import type { loader as rootLoader } from "~/root";
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
      images(first: 10) {
        nodes {
          url
          altText
          width
          height
        }
      }
      # Up to 4 vertical clips for "Watch real cats hunt", uploaded on the product
      # in Shopify admin (Products → MouseDash → Metafields). Empty slots keep the
      # design's illustrated frame. Queried both ways so "One file" and "List of
      # files" definitions both work.
      lpClipVideos: metafield(namespace: "custom", key: "lp_clip_videos") {
        reference {
          ...LpVideo
        }
        references(first: 4) {
          nodes {
            ...LpVideo
          }
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
  fragment LpVideo on Video {
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
`);

/** The landing page renders its own header and footer. */
export const handle = { storeChrome: false };

export const links: Route.LinksFunction = () => [
  { rel: "stylesheet", href: lpStylesHref },
  // Above-the-fold fonts: the hero title and its text.
  { rel: "preload", href: "/fonts/lilita-one-latin.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
  { rel: "preload", href: "/fonts/nunito-sans-latin.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

export function meta({ data }: Route.MetaArgs) {
  if (!data?.product) return [{ title: BRAND.name }];
  return [
    { title: `${data.product.title} | ${BRAND.name}` },
    {
      name: "description",
      content:
        data.product.description?.slice(0, 160) ||
        "Glowing mice dart out of glowing holes across your floor, and your cat does the rest.",
    },
  ];
}

type MetafieldRef = Record<string, unknown> | null | undefined;

/** The video of a file metafield's reference; anything that isn't a video counts as empty. */
function asVideo(reference: MetafieldRef): LpVideo | null {
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
  const clipField = product.lpClipVideos;
  const clips = clipField?.references
    ? clipField.references.nodes.map((node) => asVideo(node as MetafieldRef))
    : [asVideo(clipField?.reference as MetafieldRef)];

  return {
    product: {
      id: product.id,
      title: product.title,
      vendor: product.vendor,
      description: product.description,
      images: product.images.nodes,
      priceRange: product.priceRange,
      variants: product.variants.nodes,
    },
    clips,
    christmasActive: Date.now() < CHRISTMAS_CUTOFF,
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
function ProductViewedTracker({
  product,
  variant,
}: {
  product: LpProduct;
  variant: LpProduct["variants"][number] | undefined;
}) {
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
  const { product, clips, christmasActive } = loaderData;
  const rootData = useRouteLoaderData<typeof rootLoader>("root");
  const paymentMethods = rootData?.shopInfo.paymentMethods ?? [];

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
  const single = offers.find((offer) => offer.quantity === 1) ?? offers[0];
  const duo = offers.find((offer) => offer.quantity === 2);

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

  const strip = christmasActive
    ? `Free tracked US shipping. Order by ${CHRISTMAS_CUTOFF_LABEL} to get it before Christmas.`
    : "Free tracked shipping on every US order.";

  return (
    <div className="lp" id="top">
      <ProductViewedTracker product={product} variant={variantNode} />
      <LpDefs />
      <LpStrip text={strip} />
      <LpNav />
      <main id="main-content" tabIndex={-1}>
        <Hero
          fromPrice={single ? formatMoney(single.total, single.currencyCode) : null}
          hasClips={clips.some(Boolean)}
        />
        <BuySection
          title={product.title}
          images={product.images}
          offers={offers}
          selected={selected}
          onSelect={setQuantity}
          onBuy={buy}
          pending={pending}
          error={error}
          available={available}
          paymentMethods={paymentMethods}
        />
        <Watch videos={clips} />
        <HowItWorks />
        <Why />
        <Specs />
        <Gift
          duoLabel={duo ? formatMoney(duo.total, duo.currencyCode) : null}
          onPickTwo={() => duo && setQuantity(2)}
          showCutoff={christmasActive}
        />
        <CareAndFaq showCutoff={christmasActive} />
        <Closing />
      </main>
      <LpFooter />
      <StickyBar
        name={`${PRODUCT_SHORT_NAME} projector`}
        packLabel={selected ? projectorCount(selected.quantity) : ""}
        buttonLabel={available ? buyLabel(selected, pending, "") : "Sold out"}
        onBuy={buy}
        disabled={!lines.length}
        pending={pending}
      />
    </div>
  );
}
