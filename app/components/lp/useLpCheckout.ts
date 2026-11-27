import { useCallback, useEffect, useState } from "react";
import { useFetcher } from "react-router";

/** A line for the landing page's direct checkout, in Storefront API `CartLineInput` shape. */
export type LpCartLine = {
  merchandiseId: string;
  quantity: number;
  attributes: Array<{ key: string; value: string }>;
};

/** Variant fields the landing page needs to label and price the selected lines. */
export type LpVariant = {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  compareAtPrice?: { amount: string; currencyCode: string } | null;
};

/**
 * One buy action for the whole landing page (hero button and sticky bar).
 *
 * Posts the lines to the landing page route's `action`, which creates a fresh
 * Storefront API cart holding only these lines and redirects to its
 * `checkoutUrl`. The store's cart (and cart drawer) is never touched, so going
 * back from checkout and buying again can't double the quantity.
 */
export function useLpCheckout() {
  const fetcher = useFetcher<{ error?: string }>();
  const [submitted, setSubmitted] = useState(false);
  const error = fetcher.state === "idle" ? fetcher.data?.error : undefined;

  // A failed checkout re-enables the buttons.
  useEffect(() => {
    if (error) setSubmitted(false);
  }, [error]);

  // Coming back from checkout via the back button restores this page from the
  // back/forward cache with the buttons still busy; re-enable them.
  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) setSubmitted(false);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const { submit } = fetcher;
  const checkout = useCallback(
    (lines: LpCartLine[]) => {
      if (!lines.length) return;
      setSubmitted(true);
      void submit({ lines: JSON.stringify(lines) }, { method: "post" });
    },
    [submit],
  );

  return { checkout, pending: submitted || fetcher.state !== "idle", error };
}
