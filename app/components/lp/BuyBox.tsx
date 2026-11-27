import { useEffect, useRef, useState, type FormEvent } from "react";

import { shopifyImageUrl, srcSetForWidths } from "~/lib/image";
import { DELIVERY_TIME, GUARANTEE_DAYS, HANDLING_TIME } from "~/lib/lp-config";

import { type BundleOffer, formatMoney, projectorCount } from "./bundles";

export type LpImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/** Text for the buy buttons. */
export function buyLabel(offer: BundleOffer | undefined, pending: boolean, prefix = "Buy now, ") {
  if (pending) return "Opening checkout…";
  return offer ? `${prefix}${formatMoney(offer.total, offer.currencyCode)}` : "Sold out";
}

/** "card, Apple Pay or Shop Pay" style list. */
function joinOr(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

const STAGE_WIDTHS = [400, 600, 800, 1000, 1200];

/**
 * Product photos from Shopify in the design's dark stage; swipeable, with
 * arrows when there is more than one. Without photos it shows the design's
 * projector illustration.
 */
function ProductStage({ images, title }: { images: LpImage[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => el.clientWidth && setActive(Math.round(el.scrollLeft / el.clientWidth)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (index: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(images.length - 1, index));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  if (!images.length) {
    return (
      <div className="stage">
        <svg
          viewBox="-80 -110 160 190"
          role="img"
          aria-label="The MouseDash projector: a small black cat head with glowing red ears, pixel eyes and a red lens"
        >
          <use href="#dev" x="-80" y="-110" width="160" height="190" />
        </svg>
      </div>
    );
  }

  return (
    <div className="stage has-photo">
      <div className="s-track" ref={track} aria-label="Product photos" tabIndex={-1}>
        {images.map((image, index) => (
          <div className="s-slide" key={image.url} aria-hidden={index === active ? undefined : "true"}>
            <img
              src={shopifyImageUrl(image.url, { width: 800 })}
              srcSet={srcSetForWidths(image.url, STAGE_WIDTHS, image.width)}
              sizes="(max-width: 900px) calc(100vw - 32px), 48vw"
              width={image.width ?? undefined}
              height={image.height ?? undefined}
              alt={image.altText || title}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <div className="arrows s-arrows">
          <button type="button" aria-label="Previous photo" onClick={() => go(active - 1)} disabled={active === 0}>
            &#8249;
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => go(active + 1)}
            disabled={active === images.length - 1}
          >
            &#8250;
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function BuySection({
  title,
  images,
  offers,
  selected,
  onSelect,
  onBuy,
  pending,
  error,
  available,
  paymentMethods,
}: {
  title: string;
  images: LpImage[];
  offers: BundleOffer[];
  selected: BundleOffer | undefined;
  onSelect: (quantity: number) => void;
  onBuy: () => void;
  pending: boolean;
  error?: string;
  available: boolean;
  paymentMethods: string[];
}) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onBuy();
  };

  return (
    <section className="band" id="buy">
      <div className="wrap buy">
        <ProductStage images={images} title={title} />
        <div>
          <h2>{title}</h2>
          <p className="lede">
            A 6.3-inch cat head that sits on the floor and projects glowing mice popping in and out of mouse holes.
            Get one for your cat, or one to keep and one to give.
          </p>
          <form onSubmit={submit}>
            <fieldset className="opts">
              <legend className="note">Pick how many</legend>
              {offers.map((offer) => (
                <label className="opt" key={offer.quantity}>
                  <input
                    type="radio"
                    name="bundle"
                    value={offer.quantity}
                    checked={selected?.quantity === offer.quantity}
                    onChange={() => onSelect(offer.quantity)}
                  />
                  <div>
                    <b>
                      {projectorCount(offer.quantity)}
                      {offer.tag ? <em className="tag">{offer.tag}</em> : null}
                    </b>
                    <span>
                      {offer.note}
                      {offer.saving > 0 ? `, save ${formatMoney(offer.saving, offer.currencyCode)}` : null}
                    </span>
                  </div>
                  <div className="pr">
                    {formatMoney(offer.total, offer.currencyCode)}
                    {offer.saving > 0 ? <s>{formatMoney(offer.regularTotal, offer.currencyCode)}</s> : null}
                  </div>
                </label>
              ))}
            </fieldset>
            <button
              className="btn add"
              id="buy-button"
              type="submit"
              disabled={pending || !available || !selected}
              aria-busy={pending || undefined}
            >
              {available ? buyLabel(selected, pending) : "Sold out"}
            </button>
            {error ? (
              <p className="buyError" role="alert">
                {error}
              </p>
            ) : null}
          </form>
          <ul className="facts">
            {/* One span per line: each li is a flex row (dot + text). */}
            <li>
              <span>
                Ships in {HANDLING_TIME}, then arrives in {DELIVERY_TIME} with tracking. Free on US orders.
              </span>
            </li>
            <li>
              <span>
                {GUARANTEE_DAYS}-day money-back guarantee. <a href="/policies/refund-policy">See how it works</a>.
              </span>
            </li>
            {paymentMethods.length ? (
              <li>
                <span>Pay with {joinOr(paymentMethods)}.</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
