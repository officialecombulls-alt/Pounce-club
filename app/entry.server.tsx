import { createContentSecurityPolicy } from "@shopify/hydrogen";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import { ServerRouter, type EntryContext, type RouterContextProvider } from "react-router";

import { NonceProvider } from "~/lib/csp";
import { envContext } from "~/lib/env";
import { SHOP_MEDIA_DOMAIN } from "~/lib/lp-config";
import { getMockShopDomain, getStoreDomain, shouldUseMockShop } from "~/lib/shop";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: RouterContextProvider,
) {
  const env = context.get(envContext);

  // Shopify serves uploaded videos from the Online Store's primary domain
  // (https://checkout.pounceclub.store/cdn/shop/videos/…), not cdn.shopify.com,
  // so the landing page's clips need that origin in media-src.
  const mediaDomains = [SHOP_MEDIA_DOMAIN, env.PUBLIC_CHECKOUT_DOMAIN].filter(
    (domain, index, all): domain is string => Boolean(domain) && all.indexOf(domain) === index,
  );
  const csp = createContentSecurityPolicy({
    shop: {
      storeDomain: shouldUseMockShop(env) ? getMockShopDomain(env) : getStoreDomain(env),
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
    },
    directives: {
      mediaSrc: mediaDomains.map((domain) => (domain.startsWith("https://") ? domain : `https://${domain}`)),
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider value={csp.nonce}>
      <ServerRouter context={reactRouterContext} url={request.url} nonce={csp.nonce} />
    </NonceProvider>,
    {
      nonce: csp.nonce,
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get("user-agent"))) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  csp.applyResponseHeaders(responseHeaders);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
