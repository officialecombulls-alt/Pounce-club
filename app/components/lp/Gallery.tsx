import { useEffect, useRef, useState } from "react";

import { LpMedia, type LpMediaSlot } from "./LpMedia";

/** Button labels under the gallery, by slot (the chase button gets a play glyph). */
const VIEW_LABELS: Record<string, string> = {
  product: "Product",
  chase: "Chase video",
  detail: "Projection",
  room: "Room setup",
  kit: "In the box",
};

const GALLERY_SIZES = "(max-width: 760px) calc(100vw - 32px), (max-width: 1280px) 55vw, 660px";

/**
 * Product gallery: one frame per view in a scroll-snap track (swipe on phones),
 * with the design's row of view buttons underneath.
 */
export function Gallery({ views }: { views: LpMediaSlot[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        if (el.clientWidth) setActive(Math.round(el.scrollLeft / el.clientWidth));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf.current);
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  const show = (index: number) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: index * el.clientWidth, behavior: reduce ? "auto" : "smooth" });
    setActive(index);
  };

  return (
    <div className="gallery">
      <div className="g-track" ref={track} aria-label="Product views" tabIndex={-1}>
        {views.map((view, index) => (
          <div className="g-slide" key={view.slot} aria-hidden={index === active ? undefined : "true"}>
            <LpMedia
              media={view}
              sizes={GALLERY_SIZES}
              eager={index === 0}
              caption={`${index + 1} / ${views.length}`}
            />
          </div>
        ))}
      </div>
      <div className="switches" aria-label="Product views">
        {views.map((view, index) => (
          <button
            key={view.slot}
            type="button"
            aria-pressed={index === active}
            onClick={() => show(index)}
          >
            {view.slot === "chase" ? (
              <>
                <i aria-hidden="true">▷</i>{" "}
              </>
            ) : null}
            {VIEW_LABELS[view.slot] ?? view.kind}
          </button>
        ))}
      </div>
    </div>
  );
}
