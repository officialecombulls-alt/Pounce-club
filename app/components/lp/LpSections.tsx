import { useRef } from "react";

import { shopifyImageUrl } from "~/lib/image";
import {
  CHRISTMAS_CUTOFF_LABEL,
  DELIVERY_TIME,
  GUARANTEE_DAYS,
  HANDLING_TIME,
  PRODUCT_SHORT_NAME,
} from "~/lib/lp-config";

import { NightScene } from "./LpArt";

/** A video from a file metafield (`Video` reference). */
export type LpVideo = {
  sources: Array<{ url: string; mimeType: string; height?: number | null }>;
  previewImage?: { url: string } | null;
  alt?: string | null;
};

/** The mp4 Shopify serves closest to (not above) 1080p; browsers can't play its HLS source natively. */
function pickMp4(video: LpVideo) {
  const mp4 = video.sources.filter((source) => source.mimeType === "video/mp4");
  const fitting = mp4.filter((source) => (source.height ?? 0) <= 1080);
  const pool = fitting.length ? fitting : mp4;
  return [...pool].sort((a, b) => (b.height ?? 0) - (a.height ?? 0))[0] ?? null;
}

export function Hero({ fromPrice, hasClips }: { fromPrice: string | null; hasClips: boolean }) {
  return (
    <section className="hero" aria-label={`${PRODUCT_SHORT_NAME} projector`}>
      <div className="copy">
        <h1>Your floor becomes a mouse hunt.</h1>
        <div>
          <p>
            Plug it in, tap the button and dim the lights. Glowing mice dart out of glowing holes across your floor,
            and your cat does the rest.
          </p>
          <div className="row">
            <a className="btn" href="#buy">
              Choose your bundle
            </a>
            {fromPrice ? <span className="from">From {fromPrice}</span> : null}
          </div>
          {/* A promise about the videos, so it only shows once real clips are uploaded. */}
          {hasClips ? <span className="proof">Filmed with real cats in real homes. No AI in our videos.</span> : null}
        </div>
      </div>
      <div className="scene">
        <NightScene />
      </div>
      <div className="trust">
        <div>Free US shipping</div>
        <div>No batteries needed</div>
        <div>One-button setup</div>
        <div>{GUARANTEE_DAYS}-day money-back guarantee</div>
      </div>
    </section>
  );
}

const CLIP_COPY = [
  { title: "Lights down, mice out", text: "The plug-in, the dark room and the first mouse.", x: 30 },
  { title: "The first pounce", text: "Close on paws hitting a glowing hole.", x: 60 },
  { title: "Two cats, one hunt", text: "Each cat picks a hole and waits.", x: 45 },
  { title: "The 3 a.m. zoomies fix", text: "Ten minutes of chasing before bed.", x: 70 },
];

/** Four vertical clips from the product's `custom.lp_clip_videos` metafield; empty slots keep the design's frame. */
export function Watch({ videos }: { videos: Array<LpVideo | null> }) {
  const track = useRef<HTMLDivElement>(null);
  const hasClips = videos.some(Boolean);

  const step = (dir: number) => {
    const el = track.current;
    const clip = el?.querySelector<HTMLElement>(".clip");
    if (!el || !clip) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (clip.offsetWidth + 16), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="band night" id="watch">
      <div className="wrap">
        <div className="head">
          <div>
            <h2>Watch real cats hunt</h2>
            {hasClips ? (
              <p>
                Every clip is one take: plug in, lights down, first pounce. No edits that make the mice look brighter
                than they are.
              </p>
            ) : (
              <p>Plug in, lights down, first pounce. Here&apos;s what an evening with {PRODUCT_SHORT_NAME} looks like.</p>
            )}
          </div>
          <div className="arrows">
            <button type="button" aria-label="Previous clip" onClick={() => step(-1)}>
              &#8249;
            </button>
            <button type="button" aria-label="Next clip" onClick={() => step(1)}>
              &#8250;
            </button>
          </div>
        </div>
        <div
          className="clips"
          ref={track}
          tabIndex={0}
          aria-label="Video clips"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") step(1);
            if (event.key === "ArrowLeft") step(-1);
          }}
        >
          {CLIP_COPY.map((clip, index) => {
            const video = videos[index];
            const mp4 = video ? pickMp4(video) : null;
            const poster = video?.previewImage?.url;
            return (
              <article className="clip" key={clip.title}>
                <div className="frame">
                  {mp4 ? (
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      poster={poster ? shopifyImageUrl(poster, { width: 560 }) : undefined}
                      aria-label={video?.alt || clip.title}
                    >
                      <source src={mp4.url} type="video/mp4" />
                    </video>
                  ) : (
                    <>
                      <svg viewBox="0 0 90 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
                        <ellipse cx={clip.x} cy="128" rx="14" ry="4.5" fill="url(#hole)" />
                        <ellipse cx={100 - clip.x} cy="108" rx="10" ry="3.2" fill="url(#hole)" />
                        <use href="#mouse" x={clip.x - 22} y="114" width="20" height="10" />
                        <use href="#dev" x="2" y="112" width="34" height="42" />
                      </svg>
                      <span className="play" aria-hidden="true" />
                    </>
                  )}
                </div>
                <h3>{clip.title}</h3>
                <p>{clip.text}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="band" id="how">
      <div className="wrap">
        <h2>Set up in under a minute</h2>
        <ol className="steps">
          <li>
            <h3>Plug it in</h3>
            <p>Set it on open floor with the lens facing the room. Run the USB cable to the wall adapter.</p>
          </li>
          <li>
            <h3>Tap the top button</h3>
            <p>The holes light up and the first mouse peeks out. Tap again to switch it off.</p>
          </li>
          <li>
            <h3>Dim the lights</h3>
            <p>The mice glow brightest in a dark room. Your cat takes it from there.</p>
          </li>
        </ol>
      </div>
    </section>
  );
}

export function Why() {
  return (
    <section className="band panel">
      <div className="wrap why">
        <div>
          <h2>Why cats can&apos;t leave it alone</h2>
          <p>
            Cats are built to stalk, crouch and pounce. A mouse that keeps escaping into another hole gives them a
            reason to try again.
          </p>
        </div>
        <ul>
          <li>
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle cx="26" cy="26" r="25" fill="var(--bg)" />
              <ellipse cx="26" cy="32" rx="14" ry="5" fill="#2a0709" />
              <use href="#mouse" x="14" y="13" width="26" height="14" />
            </svg>
            <div>
              <h3>It moves like prey</h3>
              <p>Mice pop out, dart across the floor and vanish, so there is always a next target.</p>
            </div>
          </li>
          <li>
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle cx="26" cy="26" r="25" fill="var(--bg)" />
              <path
                d="M16 36h20M20 36V24l6-6 6 6v12"
                fill="none"
                stroke="var(--red)"
                strokeWidth="3"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <h3>It plays while you rest</h3>
              <p>No wand to wave or pointer to hold after a long day.</p>
            </div>
          </li>
          <li>
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle cx="26" cy="26" r="25" fill="var(--bg)" />
              <path d="M33 15a12 12 0 1 0 5 17 10 10 0 0 1-5-17z" fill="var(--red)" />
            </svg>
            <div>
              <h3>It takes the edge off evenings</h3>
              <p>A play session before bed can help with the 3 a.m. zoomies.</p>
            </div>
          </li>
          <li>
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle cx="26" cy="26" r="25" fill="var(--bg)" />
              <ellipse cx="17" cy="30" rx="7" ry="3" fill="#2a0709" />
              <ellipse cx="35" cy="22" rx="7" ry="3" fill="#2a0709" />
              <circle cx="17" cy="30" r="9" fill="none" stroke="var(--red)" strokeWidth="2" />
              <circle cx="35" cy="22" r="9" fill="none" stroke="var(--red)" strokeWidth="2" />
            </svg>
            <div>
              <h3>Room for two cats</h3>
              <p>Several holes light at once, so each cat can pick a spot.</p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}

export function Compare() {
  return (
    <section className="band" id="compare">
      <div className="wrap two">
        <div>
          <h2>How it compares</h2>
          <div className="scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    <span className="note">Feature</span>
                  </th>
                  <th scope="col">{PRODUCT_SHORT_NAME}</th>
                  <th scope="col">Laser pointer</th>
                  <th scope="col">Feather wand</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">You hold it</th>
                  <td className="us">No</td>
                  <td>Yes</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <th scope="row">Targets</th>
                  <td className="us">Several mice and holes</td>
                  <td>One dot</td>
                  <td>One lure</td>
                </tr>
                <tr>
                  <th scope="row">Power</th>
                  <td className="us">USB cable</td>
                  <td>Batteries</td>
                  <td>None</td>
                </tr>
                <tr>
                  <th scope="row">Best for</th>
                  <td className="us">Evening play, two cats</td>
                  <td>Short bursts with you</td>
                  <td>Play together</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2>Specs and box</h2>
          <dl>
            <dt>Size</dt>
            <dd>6.3 in (16 cm) tall</dd>
            <dt>Power</dt>
            <dd>USB cable to a wall adapter, no batteries</dd>
            <dt>Controls</dt>
            <dd>One button on top</dd>
            <dt>Floors</dt>
            <dd>Clear, smooth floors in a dim room</dd>
            <dt>In the box</dt>
            <dd>Projector, USB cable and wall adapter</dd>
          </dl>
        </div>
      </div>
    </section>
  );
}

export function Gift({
  duoLabel,
  onPickTwo,
  showCutoff,
}: {
  duoLabel: string | null;
  onPickTwo: () => void;
  showCutoff: boolean;
}) {
  return (
    <section className="band gift">
      <div className={showCutoff ? "wrap" : "wrap solo"}>
        <div>
          <h2>A gift for the cat mom who has everything</h2>
          <p>
            It looks like a little black cat by the TV, not a plastic toy in a basket. Get two and keep one for your
            own cat.
          </p>
          <a className="btn" href="#buy" onClick={onPickTwo}>
            {duoLabel ? `Get two for ${duoLabel}` : "Get two"}
          </a>
        </div>
        {showCutoff ? (
          <div className="date">
            <span>Order by</span>
            <b>{CHRISTMAS_CUTOFF_LABEL}</b>
            <span>for delivery before Christmas</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function CareAndFaq({ showCutoff }: { showCutoff: boolean }) {
  return (
    <section className="band">
      <div className="wrap care">
        <div>
          <h2>Let them win at the end</h2>
          <p>
            Light toys never get caught. Finish each session by tossing a real toy your cat can grab, so the hunt ends
            with a catch.
          </p>
          <p>
            Play in 10 to 15 minute sessions, stay in the room, and unplug it between games. Keep the cable away from
            cats that chew, and don&apos;t point the lens at anyone&apos;s eyes. Not a toy for children under 3.
          </p>
        </div>
        <div className="faq" id="faq">
          <h2>Questions</h2>
          <details>
            <summary>Does it need batteries?</summary>
            <p>No. It runs from a USB cable plugged into the wall adapter in the box, so there is nothing to charge.</p>
          </details>
          <details>
            <summary>Does it work with the lights on?</summary>
            <p>It works best in a dim room. In bright daylight the mice are faint, so evening is the best time to play.</p>
          </details>
          <details>
            <summary>Will my cat play with it?</summary>
            <p>
              Most cats chase moving light, but every cat is different. Start when your cat is awake and curious, and
              give it a few sessions.
            </p>
          </details>
          <details>
            <summary>When will it arrive?</summary>
            <p>
              We prepare orders in {HANDLING_TIME}. Delivery then takes {DELIVERY_TIME}, with a tracking link by email.
              Shipping is free on every US order.
              {showCutoff ? ` Order by ${CHRISTMAS_CUTOFF_LABEL} for Christmas.` : null}
            </p>
          </details>
          <details>
            <summary>What if it arrives damaged?</summary>
            <p>
              Email us within {GUARANTEE_DAYS} days of delivery with a photo or short video, and we will send a
              replacement or refund you.
            </p>
          </details>
          <details>
            <summary>What&apos;s your guarantee?</summary>
            <p>
              Every order comes with a {GUARANTEE_DAYS}-day money-back guarantee. The details are in our{" "}
              <a href="/policies/refund-policy">Refund policy</a>.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}

export function Closing() {
  return (
    <section className="band night close">
      <div className="wrap">
        <h2>Ready for the first hunt?</h2>
        <p>Free tracked US shipping and a {GUARANTEE_DAYS}-day money-back guarantee on every order.</p>
        <a className="btn" href="#buy">
          Choose your bundle
        </a>
      </div>
    </section>
  );
}
