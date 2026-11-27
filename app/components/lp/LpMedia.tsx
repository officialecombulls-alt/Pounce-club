import { shopifyImageUrl, srcSetForWidths } from "~/lib/image";

/** An image from Shopify (product image or `MediaImage.image` of a file metafield). */
export type LpImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

/** A video from a file metafield (`Video` reference). */
export type LpVideo = {
  sources: Array<{ url: string; mimeType: string; height?: number | null }>;
  previewImage?: { url: string } | null;
  alt?: string | null;
};

export type LpMediaSlot = {
  /** Design slot name: product, chase, detail, room, kit. */
  slot: string;
  /** Caption and accessible name, e.g. "Cat chasing the projection". */
  label: string;
  /** Placeholder label while empty, e.g. "Demo video". */
  kind: string;
  /** Small caption on the right, e.g. "Video". */
  tag: string;
  image?: LpImage | null;
  video?: LpVideo | null;
};

/** The mp4 Shopify serves closest to (but not above) 1080p; browsers can't play its HLS source natively. */
function pickMp4(video: LpVideo) {
  const mp4 = video.sources.filter((source) => source.mimeType === "video/mp4");
  const fitting = mp4.filter((source) => (source.height ?? 0) <= 1080);
  const pool = fitting.length ? fitting : mp4;
  return pool.sort((a, b) => (b.height ?? 0) - (a.height ?? 0))[0] ?? null;
}

const IMAGE_WIDTHS = [360, 540, 720, 960, 1200, 1440];

/**
 * One media frame of the design. Shows the image or video uploaded in Shopify;
 * while the slot is empty it shows the design's placeholder (icon + label), so
 * the page never looks broken and the merchant sees which upload is missing.
 */
export function LpMedia({
  media,
  sizes,
  eager = false,
  caption,
}: {
  media: LpMediaSlot;
  sizes: string;
  /** Above-the-fold image (LCP): load eagerly at high priority. */
  eager?: boolean;
  /** Right-hand caption override (gallery counter "1 / 5"). */
  caption?: string;
}) {
  const mp4 = media.video ? pickMp4(media.video) : null;

  let asset = null;
  if (mp4) {
    const poster = media.video?.previewImage?.url;
    asset = (
      <video
        controls
        playsInline
        preload="metadata"
        poster={poster ? shopifyImageUrl(poster, { width: 1200 }) : undefined}
        aria-label={media.label}
      >
        <source src={mp4.url} type="video/mp4" />
      </video>
    );
  } else if (media.image?.url) {
    const { url, width, height, altText } = media.image;
    asset = (
      <img
        src={shopifyImageUrl(url, { width: 960 })}
        srcSet={srcSetForWidths(url, IMAGE_WIDTHS, width)}
        sizes={sizes}
        width={width ?? undefined}
        height={height ?? undefined}
        alt={altText || media.label}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding={eager ? "sync" : "async"}
      />
    );
  }

  return (
    <figure className="frame" data-slot={media.slot} aria-label={media.label}>
      <span className="center" aria-hidden={asset ? "true" : undefined}>
        <i className="mediaIcon" aria-hidden="true" />
        <span className="kind">{media.kind}</span>
      </span>
      <figcaption>
        <span>{media.label}</span>
        <small>{caption ?? media.tag}</small>
      </figcaption>
      {asset}
    </figure>
  );
}
