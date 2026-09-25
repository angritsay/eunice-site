// The shapes the generator passes around. Content types come from content/schema.ts.
import type { Desk, ProductDesk } from '../content/schema.ts';
import type { Html } from './html.ts';

export type { Desk, ProductDesk };

/** Which navigation a page shows: the company's, or a product desk's. */
export type NavKey = 'company' | ProductDesk;

/** Everything a page needs to know about where it is being rendered. */
export interface Ctx {
  /** The page's path under the site root, e.g. 'private-markets/lps'; '' for home. */
  readonly slug: string;
  /** YYYY-MM-DD. Fixed per build, so the output is reproducible. */
  readonly today: string;
  /** Rendering into the one-file preview rather than the site. */
  readonly preview: boolean;
  /** A link to another page, relative to this one. */
  link(to?: string, hash?: string | null, query?: string | null): string;
  /** The URL of a file under assets/. */
  asset(path: string): string;
}

export interface Page {
  readonly slug: string;
  readonly nav: NavKey;
  readonly title: string;
  readonly description: string;
  /** Set on a client-type page; recorded with any form sent from it. */
  readonly audience?: string;
  render(ctx: Ctx): Html;
}

/** A link in the navigation or footer: to a page, to an external URL, or opening a form. */
export interface NavItem {
  readonly label: string;
  readonly to?: string | undefined;
  readonly hash?: string | undefined;
  readonly query?: string | undefined;
  /** An external URL, or 'login' for the product's sign-in page. */
  readonly href?: string | undefined;
  /** Opens the contact dialog with this form variant. */
  readonly form?: string | undefined;
}
