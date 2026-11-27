import { LP_HOME, LpPage } from "~/components/lp/LpPage";
import { BRAND } from "~/lib/lp-config";
import { formatPageTitle, getShopNameFromRootMatch } from "~/lib/storefront-shop";
import lpStylesHref from "~/styles/lp.css?url";

import type { Route } from "./+types/contact";

/** Uses the landing page's header and footer instead of the store template's. */
export const handle = { storeChrome: false };

export const links: Route.LinksFunction = () => [{ rel: "stylesheet", href: lpStylesHref }];

export function meta({ matches }: Route.MetaArgs) {
  return [
    { title: formatPageTitle("Contact us", getShopNameFromRootMatch(matches[0])) },
    {
      name: "description",
      content: `Questions about your order, shipping or returns? Email ${BRAND.contactEmail}.`,
    },
  ];
}

/** Hidden (404) until a contact email is set in lp-config.ts. */
export function loader() {
  if (!BRAND.contactEmail) throw new Response("Not Found", { status: 404 });
  return { email: BRAND.contactEmail };
}

export default function ContactRoute({ loaderData }: Route.ComponentProps) {
  const { email } = loaderData;
  return (
    <LpPage title="Contact us">
      <p className="contact-lead">
        Questions about your order, shipping, returns or MouseDash? Email us and a real person will reply.
      </p>

      <div className="contact-card">
        <span className="category">Email us</span>
        <a className="contact-email" href={`mailto:${email}`}>
          {email}
        </a>
        <a className="cta contact-btn" href={`mailto:${email}`}>
          Send an email
        </a>
      </div>

      <div className="policy-body">
        <h2>To help us reply faster, include</h2>
        <ul>
          <li>Your order number, if you&apos;ve ordered (it&apos;s in your confirmation email)</li>
          <li>The email address you used at checkout</li>
          <li>A photo or short video, if something arrived damaged or isn&apos;t working</li>
        </ul>

        <h2>Quick answers</h2>
        <ul>
          <li>
            <a href="/policies/shipping-policy">Shipping policy</a>: where we ship, delivery times and tracking
          </li>
          <li>
            <a href="/policies/refund-policy">Refund policy</a>: returns and refunds
          </li>
          <li>
            <a href={`${LP_HOME}#faq`}>FAQs</a>: floors, power and multiple cats
          </li>
        </ul>
      </div>
    </LpPage>
  );
}
