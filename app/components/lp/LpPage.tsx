import type { ReactNode } from "react";

import { LP_PRODUCT_HANDLE } from "~/lib/lp-config";

import { LpFooter, LpHeader } from "./LpChrome";

/** Landing page path; header, footer and "Back to shop" links on other pages lead here. */
export const LP_HOME = `/lp/${LP_PRODUCT_HANDLE}`;

/**
 * Simple text page (policies, contact) in the landing page's look: its header,
 * footer and styles. The route must load lp.css and set `handle: { storeChrome: false }`.
 */
export function LpPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="lp">
      <LpHeader home={LP_HOME} />
      <main id="main-content" tabIndex={-1}>
        <article className="wrap section policy">
          <a className="policy-back" href={LP_HOME}>
            ← Back to shop
          </a>
          <h1>{title}</h1>
          {children}
        </article>
      </main>
      <LpFooter home={LP_HOME} />
    </div>
  );
}
