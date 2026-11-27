import { useEffect, useRef, useState } from "react";

import { shopifyImageUrl } from "~/lib/image";

import type { LpImage } from "./BuyBox";

/**
 * Customer reviews from Shopify: "Review" metaobject entries
 * (Content → Metaobjects → Review). Only real entries are shown, and the whole
 * section (and the rating link under the product title) stays hidden until
 * there is at least one.
 */
export type Review = {
  id: string;
  name: string;
  rating: number;
  body: string;
  location: string | null;
  date: string | null;
  photo: LpImage | null;
  verified: boolean;
};

export type ReviewSummary = { average: number; count: number };

export function reviewSummary(reviews: Review[]): ReviewSummary | null {
  if (!reviews.length) return null;
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return { average: Math.round(average * 10) / 10, count: reviews.length };
}

/** Five stars filled to `rating` (fractions allowed for the average). */
export function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const percent = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <span className={`stars stars-${size}`} role="img" aria-label={`${rating} out of 5 stars`}>
      <span className="stars-base" aria-hidden="true">
        ★★★★★
      </span>
      <span className="stars-fill" aria-hidden="true" style={{ width: `${percent}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

/** "★★★★★ 4.8 (12 reviews)" under the product title; jumps to the reviews section. */
export function RatingLink({ summary }: { summary: ReviewSummary | null }) {
  if (!summary) return null;
  return (
    <a href="#reviews" className="rating-link">
      <Stars rating={summary.average} />
      <span>
        {summary.average.toFixed(1)} ({summary.count} {summary.count === 1 ? "review" : "reviews"})
      </span>
    </a>
  );
}

function formatReviewDate(date: string): string {
  const parsed = new Date(`${date.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

const PHOTO_WIDTHS = [320, 480, 640, 800];

function ReviewCard({ review }: { review: Review }) {
  const photo = review.photo;
  const cropped = (width: number) =>
    photo ? shopifyImageUrl(photo.url, { width, height: Math.round((width * 3) / 4), crop: "center" }) : "";
  const widths = photo?.width ? PHOTO_WIDTHS.filter((w) => w <= photo.width!) : PHOTO_WIDTHS;
  const list = widths.length ? widths : PHOTO_WIDTHS.slice(0, 1);

  return (
    <article className="review">
      {photo ? (
        <img
          className="rev-photo"
          src={cropped(list[Math.min(1, list.length - 1)])}
          srcSet={list.map((w) => `${cropped(w)} ${w}w`).join(", ")}
          sizes="(max-width: 720px) 78vw, (max-width: 900px) 46vw, 380px"
          width={list[list.length - 1]}
          height={Math.round((list[list.length - 1] * 3) / 4)}
          alt={photo.altText || `Photo from ${review.name}`}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <Stars rating={review.rating} />
      <p className="rev-body">{review.body}</p>
      <footer>
        <span className="rev-avatar" aria-hidden="true">
          {review.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="rev-who">
          <b>{review.name}</b>
          <span className="rev-meta">
            {review.verified ? <span className="rev-verified">✓ Verified buyer</span> : null}
            {review.location ? <span>{review.location}</span> : null}
            {review.date ? <time dateTime={review.date.slice(0, 10)}>{formatReviewDate(review.date)}</time> : null}
          </span>
        </span>
      </footer>
    </article>
  );
}

export function Reviews({ reviews }: { reviews: Review[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const summary = reviewSummary(reviews);

  // Arrows only when the row is wider than the screen.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setOverflowing(el.scrollWidth > el.clientWidth + 1);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [reviews.length]);

  if (!summary) return null;

  const counts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => Math.round(review.rating) === stars).length,
  }));

  const step = (dir: number) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>(".review");
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + 16), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="band" id="reviews" aria-labelledby="reviewsTitle">
      <div className="wrap">
        <div className="head">
          <h2 id="reviewsTitle">What cat owners say</h2>
          {overflowing ? (
            <div className="arrows rev-arrows">
              <button type="button" aria-label="Previous reviews" onClick={() => step(-1)}>
                &#8249;
              </button>
              <button type="button" aria-label="Next reviews" onClick={() => step(1)}>
                &#8250;
              </button>
            </div>
          ) : null}
        </div>

        <div className="rev-top">
          <div className="rev-score">
            <strong>{summary.average.toFixed(1)}</strong>
            <Stars rating={summary.average} size="lg" />
            <span>
              Based on {summary.count} {summary.count === 1 ? "review" : "reviews"}
            </span>
          </div>
          <ul className="rev-bars" aria-label="Rating breakdown">
            {counts.map(({ stars, count }) => (
              <li key={stars}>
                <span className="rev-bar-label">{stars} ★</span>
                <span className="rev-bar" aria-hidden="true">
                  <i style={{ width: `${(count / summary.count) * 100}%` }} />
                </span>
                <span className="rev-bar-count">
                  {count}
                  <span className="sr"> {count === 1 ? "review" : "reviews"} with {stars} stars</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rev-row" ref={track} tabIndex={0} aria-label="Customer reviews">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}
