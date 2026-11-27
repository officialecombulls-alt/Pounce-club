import { gql } from "@shopify/hydrogen";

import { LpPage } from "~/components/lp/LpPage";
import lpStylesHref from "~/styles/lp.css?url";

import { storefrontClientContext } from "~/lib/storefront";
import { formatPageTitle, getShopNameFromRootMatch } from "~/lib/storefront-shop";

import type { Route } from "./+types/policy";

/**
 * Store policies (/policies/refund-policy, shipping-policy, privacy-policy,
 * terms-of-service), written in Shopify admin under Settings → Policies.
 */
const POLICY_QUERY = gql(`
  query StorePolicies {
    shop {
      privacyPolicy {
        ...PolicyFields
      }
      refundPolicy {
        ...PolicyFields
      }
      shippingPolicy {
        ...PolicyFields
      }
      termsOfService {
        ...PolicyFields
      }
    }
  }
  fragment PolicyFields on ShopPolicy {
    id
    handle
    title
    body
  }
`);

/** Policies use the landing page's header and footer instead of the store template's. */
export const handle = { storeChrome: false };

export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: lpStylesHref }];

/**
 * Policies pasted as plain text start each section with a short title line
 * ("<p>What we refund<br>…"). Bold that line so sections read as headings.
 * Lines ending in punctuation are sentences, not titles, and stay as they are.
 */
function boldSectionTitles(html: string): string {
  return html.replace(/<p>([^<]{2,60}?)<br\s*\/?>/g, (match, title: string) =>
    /[.,:;!?]\s*$/.test(title) || title.trim().startsWith("-") ? match : `<p><strong>${title}</strong><br>`,
  );
}

export function meta({ data, matches }: Route.MetaArgs) {
  const shopName = getShopNameFromRootMatch(matches[0]);
  return [{ title: formatPageTitle(data?.policy.title ?? "Policy", shopName) }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const storefrontClient = context.get(storefrontClientContext);
  const { data, errors } = await storefrontClient.graphql(POLICY_QUERY);
  if (errors?.length) {
    console.error(`Policy query failed: ${errors.map((e) => e.message).join("\n")}`);
  }
  const shop = data?.shop;
  const policy = [shop?.privacyPolicy, shop?.refundPolicy, shop?.shippingPolicy, shop?.termsOfService].find(
    (candidate) => candidate?.handle === params.handle,
  );
  if (!policy) throw new Response("Not Found", { status: 404 });
  return { policy: { ...policy, body: boldSectionTitles(policy.body) } };
}

export default function PolicyRoute({ loaderData }: Route.ComponentProps) {
  const { policy } = loaderData;
  return (
    <LpPage title={policy.title}>
      {/* Policy HTML is authored by the merchant in Shopify admin. */}
      <div className="policy-body" dangerouslySetInnerHTML={{ __html: policy.body }} />
    </LpPage>
  );
}
