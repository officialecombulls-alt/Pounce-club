import { useEffect, useRef } from "react";

import { PRODUCT_SHORT_NAME } from "~/lib/lp-config";

import { LpMedia, type LpMediaSlot } from "./LpMedia";

export function Intro() {
  return (
    <div className="intro">
      <h2>A mouse hunt for indoor cats.</h2>
      <p>Little mice dart between projected holes on your floor. Your cat picks the next pounce.</p>
    </div>
  );
}

export function Demo({ chase, detail }: { chase: LpMediaSlot; detail: LpMediaSlot }) {
  return (
    <section className="band demo" id="chase">
      <div className="wrap">
        <div className="headrow">
          <div>
            <p className="category">See it in action</p>
            <h2>Follow the mouse.</h2>
          </div>
          <p>
            See the game from two angles. Watch the chase, then take a closer look at the pattern your cat sees.
          </p>
        </div>
        <div className="demoGrid">
          <LpMedia media={chase} sizes="(max-width: 760px) 56vw, 64vw" />
          <LpMedia media={detail} sizes="(max-width: 370px) calc(100vw - 32px), (max-width: 760px) 44vw, 36vw" />
        </div>
      </div>
    </section>
  );
}

export function Setup({ room }: { room: LpMediaSlot }) {
  return (
    <section id="play" className="wrap section setup">
      <div className="split">
        <LpMedia media={room} sizes="(max-width: 760px) calc(100vw - 32px), 50vw" />
        <div>
          <p className="category">How it works</p>
          <h2>Ready for the first pounce?</h2>
          <ol className="steps">
            <li>
              <div>
                <b>Find a clear spot</b>
                <p>Set {PRODUCT_SHORT_NAME} on the floor with the lens facing open space.</p>
              </div>
            </li>
            <li>
              <div>
                <b>Plug in and press play</b>
                <p>Lower the lights and tap the button on top.</p>
              </div>
            </li>
            <li>
              <div>
                <b>Let your cat take the lead</b>
                <p>Stay nearby. Finish the chase with a toy they can catch.</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Kit({ kit }: { kit: LpMediaSlot }) {
  return (
    <section className="band kit">
      <div className="wrap split">
        <div>
          <p className="category">In the box</p>
          <h2>What comes with {PRODUCT_SHORT_NAME}?</h2>
          <ul className="contents">
            <li>
              {PRODUCT_SHORT_NAME} cat projector <b>× 1</b>
            </li>
            <li>
              Power cable <b>× 1</b>
            </li>
          </ul>
          <p className="muted">Each projector in a multipack includes its own cable.</p>
        </div>
        <LpMedia media={kit} sizes="(max-width: 760px) calc(100vw - 32px), 50vw" />
      </div>
    </section>
  );
}

export function Faq() {
  const ordering = useRef<HTMLDetailsElement>(null);

  // "Shipping & returns" links jump to the last question and open it.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href="#ordering"]');
      if (link && ordering.current) ordering.current.open = true;
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <section className="wrap section faq" id="faq">
      <div>
        <p className="category">Before you order</p>
        <h2>Common questions.</h2>
        <a href="#shop" className="back">
          Choose your pack
        </a>
      </div>
      <div>
        <details className="fold">
          <summary>Which floors work best?</summary>
          <p>A clear, smooth floor in a dim room makes the mouse and its holes easier to see.</p>
        </details>
        <details className="fold">
          <summary>Does it need charging?</summary>
          <p>Keep the projector plugged in during play. The top button switches it on and off.</p>
        </details>
        <details className="fold">
          <summary>Can two cats use one projector?</summary>
          <p>Cats can share the same play area. A second projector is useful for another room or household.</p>
        </details>
        <details className="fold" id="ordering" ref={ordering}>
          <summary>What are the shipping and return terms?</summary>
          <p>
            Shipping fees and delivery times are in our <a href="/policies/shipping-policy">Shipping policy</a>.
            The return window and how returns work are in our{" "}
            <a href="/policies/refund-policy">Refund policy</a>.
          </p>
        </details>
      </div>
    </section>
  );
}
