import type { ReactNode } from "react";

import { LP_PRODUCT_HANDLE } from "~/lib/lp-config";

import { LpFooter, LpNav } from "./LpChrome";

/** Landing page path; header, footer and "Back to shop" links on other pages lead here. */
export const LP_HOME = `/lp/${LP_PRODUCT_HANDLE}`;

/**
 * Simple text page (policies, contact) in the landing page's look: its nav,
 * footer and styles. The route must load lp.css and set `handle: { storeChrome: false }`.
 */
export function LpPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="lp" id="top">
      <LpNav home={LP_HOME} />
      <main id="main-content" tabIndex={-1}>
        <article className="band policy">
          <div className="wrap">
            <a className="policy-back" href={LP_HOME}>
              ← Back to shop
            </a>
            <h1>{title}</h1>
            {children}
          </div>
        </article>
      </main>
      <LpFooter home={LP_HOME} />
    </div>
  );
}
