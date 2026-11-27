import { useEffect, useState } from "react";

import { BRAND } from "~/lib/lp-config";

import { LogoMark } from "./LpArt";

/** One-line red strip above the nav. */
export function LpStrip({ text }: { text: string }) {
  return <div className="strip">{text}</div>;
}

/** `home` is the landing page path when rendered on another page (policies), so section links lead back to it. */
export function LpNav({ home = "" }: { home?: string }) {
  return (
    <header className="nav">
      <a className="logo" href={home || "#top"} aria-label={`${BRAND.name} home`}>
        <LogoMark />
        {BRAND.name}
      </a>
      <nav aria-label="Sections">
        <a href={`${home}#how`}>How it works</a>
        <a href={`${home}#watch`}>Watch it</a>
        <a href={`${home}#compare`}>Compare</a>
        <a href={`${home}#faq`}>FAQ</a>
      </nav>
      <a className="btn" href={`${home}#buy`}>
        Get yours
      </a>
    </header>
  );
}

export function LpFooter({ home = "" }: { home?: string }) {
  return (
    <footer className="lpFoot">
      <div className="wrap">
        <div>
          <a className="logo" href={home || "#top"}>
            {BRAND.name}
          </a>
          {BRAND.contactEmail ? (
            <p className="support">
              Support: <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>
            </p>
          ) : null}
        </div>
        <nav aria-label="Help">
          <a href="/policies/shipping-policy">Shipping</a>
          <a href="/policies/refund-policy">Refunds</a>
          {BRAND.contactEmail ? <a href="/contact">Contact</a> : null}
          <a href="/policies/privacy-policy">Privacy</a>
          <a href="/policies/terms-of-service">Terms</a>
        </nav>
      </div>
    </footer>
  );
}

/**
 * Phone-only sticky buy bar (design: `.bar`). Appears once the main buy button
 * has scrolled above the screen, so the first screens stay clean.
 */
export function StickyBar({
  name,
  packLabel,
  buttonLabel,
  onBuy,
  disabled,
  pending,
  watchId = "buy-button",
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
    <div className={visible ? "bar visible" : "bar"} aria-hidden={visible ? undefined : "true"}>
      <div>
        <b>{name}</b>
        <span>{packLabel}</span>
      </div>
      <button
        className="btn"
        type="button"
        onClick={onBuy}
        disabled={disabled || pending}
        aria-busy={pending || undefined}
        tabIndex={visible ? 0 : -1}
      >
        {buttonLabel}
      </button>
    </div>
  );
}
