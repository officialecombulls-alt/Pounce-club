import { useEffect, useState } from "react";

import { BRAND } from "~/lib/lp-config";

/** Text logo from the design: pounce<span>club</span><b>.</b> */
function Brand({ href }: { href: string }) {
  return (
    <a className="brand" href={href} aria-label={`${BRAND.name} home`}>
      pounce<span>club</span>
      <b>.</b>
    </a>
  );
}

/** One-line promo bar. `text` is computed from Shopify prices; nothing renders without it. */
export function LpPromo({ text, href }: { text: string | null; href: string }) {
  if (!text) return null;
  return (
    <a className="promo" href={href}>
      {text}
    </a>
  );
}

/** `home` is the landing page path when rendered on another page (policies), so section links lead back to it. */
export function LpHeader({ home = "" }: { home?: string }) {
  return (
    <header className="lpHead">
      <div className="wrap mast">
        <nav aria-label="Main menu">
          <a href={`${home}#product`}>Shop</a>
          <a href={`${home}#play`}>How it works</a>
          <a href={`${home}#faq`}>FAQ</a>
        </nav>
        <Brand href={home || "#top"} />
        <span aria-hidden="true" />
      </div>
    </header>
  );
}

export function LpFooter({ home = "" }: { home?: string }) {
  const year = new Date().getFullYear();
  return (
    <footer className="lpFoot">
      <div className="wrap foot">
        <Brand href={home || "#top"} />
        <small>
          © {year} {BRAND.name}
        </small>
        <nav aria-label="Store policies" className="footLinks">
          <a href="/policies/shipping-policy">Shipping</a>
          <a href="/policies/refund-policy">Refunds &amp; returns</a>
          {BRAND.contactEmail ? <a href="/contact">Contact</a> : null}
          <a href="/policies/privacy-policy">Privacy</a>
          <a href="/policies/terms-of-service">Terms</a>
        </nav>
      </div>
    </footer>
  );
}

/**
 * Sticky buy bar: appears once the hero buy button has scrolled above the
 * screen (as in the design), and hides again when it comes back.
 */
export function StickyBar({
  name,
  packLabel,
  buttonLabel,
  onBuy,
  disabled,
  pending,
  watchId = "buy",
}: {
  name: string;
  packLabel: string;
  buttonLabel: string;
  onBuy: () => void;
  disabled: boolean;
  pending: boolean;
  watchId?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(watchId);
    if (!target || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      setVisible(entries[0].boundingClientRect.bottom < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [watchId]);

  return (
    <div className={visible ? "sticky visible" : "sticky"} aria-hidden={visible ? undefined : "true"}>
      <div className="wrap">
        <b>{name}</b>
        <span>{packLabel}</span>
        <button
          type="button"
          className="cta"
          onClick={onBuy}
          disabled={disabled || pending}
          aria-busy={pending || undefined}
          tabIndex={visible ? 0 : -1}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
