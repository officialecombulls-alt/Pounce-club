/**
 * Shopify CDN image sizing (Hydrogen ships no Image component; see the
 * hydrogen-image skill). Only Shopify CDN hosts are rewritten.
 */
type ShopifyImageOptions = {
  width?: number;
  height?: number;
  crop?: "center" | "top" | "bottom" | "left" | "right";
};

const SHOPIFY_CDN_HOSTS = ["cdn.shopify.com", "mock.shop"];

function isShopifyImageHost(hostname: string) {
  return SHOPIFY_CDN_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

export function shopifyImageUrl(url: string, options: ShopifyImageOptions = {}) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (!isShopifyImageHost(parsed.hostname)) return url;
  if (options.width) parsed.searchParams.set("width", String(options.width));
  if (options.height) parsed.searchParams.set("height", String(options.height));
  if (options.crop) parsed.searchParams.set("crop", options.crop);
  return parsed.toString();
}

/** Width-descriptor srcset, skipping widths larger than the original. */
export function srcSetForWidths(url: string, widths: number[], originalWidth?: number | null) {
  const usable = originalWidth ? widths.filter((width) => width <= originalWidth) : widths;
  const list = usable.length ? usable : widths.slice(0, 1);
  return list.map((width) => `${shopifyImageUrl(url, { width })} ${width}w`).join(", ");
}
