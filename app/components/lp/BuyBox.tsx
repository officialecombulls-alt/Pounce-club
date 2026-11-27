import type { FormEvent } from "react";

import { type BundleOffer, formatMoney, formatSaving, projectorCount } from "./bundles";

/** Text for the buy buttons (hero and sticky bar). */
export function buyLabel(offer: BundleOffer | undefined, pending: boolean) {
  if (pending) return "Opening checkout…";
  return offer ? `Buy now · ${formatMoney(offer.total, offer.currencyCode)}` : "Sold out";
}

export function BuyBox({
  title,
  offers,
  selected,
  onSelect,
  onBuy,
  pending,
  error,
  available,
}: {
  title: string;
  offers: BundleOffer[];
  selected: BundleOffer | undefined;
  onSelect: (quantity: number) => void;
  onBuy: () => void;
  pending: boolean;
  error?: string;
  available: boolean;
}) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onBuy();
  };

  return (
    <div className="buyarea">
      <div className="category">Indoor play</div>
      <h1>{title}</h1>

      {selected ? (
        <div className="priceLine" aria-live="polite">
          <strong>{formatMoney(selected.total, selected.currencyCode)}</strong>
          {selected.saving > 0 ? (
            <>
              <del>{formatMoney(selected.regularTotal, selected.currencyCode)}</del>
              <b>Save {formatSaving(selected.saving, selected.currencyCode)}</b>
            </>
          ) : null}
        </div>
      ) : null}

      <ul className="benefits">
        <li>A moving mouse game on your own floor</li>
        <li>Plug-in power with one-button control</li>
      </ul>

      <form onSubmit={submit}>
        <fieldset id="shop">
          <legend>Choose your pack</legend>
          {offers.map((offer) => (
            <label className="option" key={offer.quantity}>
              <input
                type="radio"
                name="pack"
                value={offer.quantity}
                checked={selected?.quantity === offer.quantity}
                onChange={() => onSelect(offer.quantity)}
              />
              <span>
                <strong>{projectorCount(offer.quantity)}</strong>
                <small>{offer.name} pack</small>
              </span>
              {offer.saving > 0 ? (
                <b className="deal">Save {formatSaving(offer.saving, offer.currencyCode)}</b>
              ) : null}
              <span className="amt">
                <strong>{formatMoney(offer.total, offer.currencyCode)}</strong>
                <small>{formatMoney(offer.each, offer.currencyCode)} each</small>
              </span>
            </label>
          ))}
        </fieldset>
        <button
          id="buy"
          className="cta"
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
      <div className="under">
        <span>One-time purchase · {selected?.currencyCode ?? "USD"}</span>
        <a href="#ordering">Shipping &amp; returns</a>
      </div>
    </div>
  );
}
