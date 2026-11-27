import { useEffect, useState, type FormEvent } from "react";

import { ARRIVAL_BUSINESS_DAYS, GUARANTEE_DAYS } from "~/lib/lp-config";

import { type BundleOffer, formatMoney, projectorCount } from "./bundles";
import { useReducedMotion } from "./LpArt";

/**
 * "Choose your bundle" picker, ported from reference/bundle.html: picking a
 * pack switches its card to the night floor with mice running. Every price
 * and saving comes from the Shopify price and compare-at price
 * (see bundleOffers); the pack discounts mirror Shopify automatic discounts.
 */

const HOLES: Array<[number, number]> = [
  [22, 70],
  [52, 80],
  [88, 74],
  [114, 82],
  [40, 60],
  [100, 62],
  [70, 86],
];
const PATHS = ["M22 70Q40 60 52 80", "M88 74Q102 64 114 82", "M40 60Q70 52 100 62"];

/** Card scene: a "day" layer (lights on) and a "night" layer (lights off, mice running) with n projectors. */
function CardScene({ n, animate }: { n: number; animate: boolean }) {
  const xs = n === 1 ? [66] : n === 2 ? [40, 92] : [26, 66, 106];
  const devices =
    n === 1 ? (
      <use href="#devS" x="44" y="12" width="44" height="52" />
    ) : (
      xs.map((x) => <use key={x} href="#devS" x={x - 17} y="34" width="34" height="40" />)
    );
  return (
    <svg viewBox="0 0 132 88" aria-hidden="true">
      <g className="b-day">
        <rect width="132" height="88" fill="url(#studio)" />
        <ellipse cx="66" cy="76" rx={24 + n * 14} ry="5" fill="#000" opacity=".1" />
        {devices}
      </g>
      <g className="b-night">
        <rect width="132" height="88" fill="url(#planksS)" />
        <rect width="132" height="88" fill="#100806" opacity=".35" />
        <ellipse cx="66" cy="70" rx="80" ry="34" fill="url(#poolS)" />
        {HOLES.slice(0, n * 2 + 1).map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <ellipse cx={x} cy={y} rx="13" ry="5" fill="url(#haloS)" />
            <ellipse cx={x} cy={y} rx="7" ry="2.6" fill="url(#holeS)" />
          </g>
        ))}
        {/* Mice only run on the picked card, and never with reduced motion. */}
        {animate
          ? PATHS.slice(0, n).map((path, i) => (
              <g key={path} opacity="0">
                <use href="#mouseS" x="-6" y="-3" width="12" height="6" />
                <animateMotion
                  dur={`${2.4 + i * 0.5}s`}
                  begin={`${i * 0.6}s`}
                  repeatCount="indefinite"
                  rotate="auto"
                  path={path}
                />
                <animate
                  attributeName="opacity"
                  dur={`${2.4 + i * 0.5}s`}
                  begin={`${i * 0.6}s`}
                  repeatCount="indefinite"
                  values="0;1;1;0;0"
                  keyTimes="0;.12;.78;.9;1"
                />
              </g>
            ))
          : null}
        {devices}
      </g>
    </svg>
  );
}

/** Adds business days (Mon–Fri) to a date. */
function addBusinessDays(from: Date, days: number) {
  const date = new Date(from);
  let left = days;
  while (left > 0) {
    date.setDate(date.getDate() + 1);
    const weekday = date.getDay();
    if (weekday !== 0 && weekday !== 6) left--;
  }
  return date;
}

/** "Arrives Dec 7 to Dec 16" from today's date; the server renders the business-day range instead. */
function useArrivalText() {
  const [min, max] = ARRIVAL_BUSINESS_DAYS;
  const [text, setText] = useState(`Arrives in ${min} to ${max} business days`);
  useEffect(() => {
    const format = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const today = new Date();
    setText(`Arrives ${format(addBusinessDays(today, min))} to ${format(addBusinessDays(today, max))}`);
  }, [min, max]);
  return text;
}

/** "Visa, Mastercard or Shop Pay". */
function joinOr(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
}

export function BundlePicker({
  offers,
  selected,
  onSelect,
  onBuy,
  pending,
  error,
  available,
  paymentMethods,
}: {
  offers: BundleOffer[];
  selected: BundleOffer | undefined;
  onSelect: (quantity: number) => void;
  onBuy: () => void;
  pending: boolean;
  error?: string;
  available: boolean;
  paymentMethods: string[];
}) {
  const reduced = useReducedMotion();
  const arrival = useArrivalText();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onBuy();
  };

  let buttonText = "Sold out";
  if (available && selected) buttonText = pending ? "Opening checkout…" : `Buy ${selected.quantity} now`;

  return (
    <form className="picker" aria-labelledby="pickTitle" onSubmit={submit}>
      <div className="top">
        <h3 id="pickTitle">Choose your bundle</h3>
        <span>Free tracked shipping on all</span>
      </div>

      <fieldset className="cards">
        <legend className="sr">Bundle</legend>
        {offers.map((offer) => (
          <label className="card" key={offer.quantity}>
            <input
              type="radio"
              name="bundle"
              value={offer.quantity}
              checked={selected?.quantity === offer.quantity}
              onChange={() => onSelect(offer.quantity)}
            />
            <span className="b-scene">
              <CardScene n={offer.quantity} animate={!reduced && selected?.quantity === offer.quantity} />
            </span>
            <span>
              <span className="name">
                {projectorCount(offer.quantity)}
                {offer.tag ? <span className={offer.tagRed ? "b-tag red" : "b-tag"}>{offer.tag}</span> : null}
              </span>
              <span className="desc">{offer.note}</span>
              {offer.saving > 0.005 ? (
                <span className="save">You save {formatMoney(offer.saving, offer.currencyCode)}</span>
              ) : null}
            </span>
            <span className="amt">
              <b>{formatMoney(offer.total, offer.currencyCode)}</b>
              {offer.saving > 0.005 ? <s>{formatMoney(offer.regularTotal, offer.currencyCode)}</s> : null}
              <small>{offer.quantity > 1 ? `${formatMoney(offer.each, offer.currencyCode)} each` : "Single"}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="total">
        <div className="sum">
          <div>
            <span>Total</span>
            <br />
            <b>{selected ? formatMoney(selected.total, selected.currencyCode) : "—"}</b>
          </div>
          <span className="you">
            {selected && selected.saving > 0.005
              ? `You save ${formatMoney(selected.saving, selected.currencyCode)}`
              : "Shipping included"}
          </span>
        </div>
        <button
          className="btn add"
          id="buy-button"
          type="submit"
          disabled={pending || !available || !selected}
          aria-busy={pending || undefined}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 8h14l-1.2 12H6.2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>{buttonText}</span>
        </button>
        {error ? (
          <p className="buyError" role="alert">
            {error}
          </p>
        ) : null}
        <div className="meta">
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
            <a href="/policies/refund-policy">{GUARANTEE_DAYS}-day money-back guarantee</a>
          </span>
          <span>
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M2 6h12v10H2zM14 10h4l3 3v3h-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span>{arrival}</span>
          </span>
        </div>
        {paymentMethods.length ? <p className="pay">Pay with {joinOr(paymentMethods)}.</p> : null}
      </div>
    </form>
  );
}
