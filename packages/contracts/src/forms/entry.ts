// Where a submission came from. The variant says what we asked; the entry point says
// which page and which button — the context ops needs to open the conversation well,
// and the dimension analytics groups the funnel by.
import { z } from 'zod';
import { singleLine } from './fields.ts';

/** Where on a page a form can be opened from. New placements are added here. */
export const PLACEMENTS = ['nav', 'hero', 'body', 'band', 'roles', 'closing', 'footer'] as const;
export type Placement = (typeof PLACEMENTS)[number];

export const EntryPoint = z.strictObject({
  /** The page path under the site root, as in the site's urls.json: '' for home. */
  page: z
    .string()
    .max(200)
    .regex(/^([a-z0-9-]+\/)*$/, 'must be a site path like "private-markets/lps/"'),
  placement: z.enum(PLACEMENTS),
  /** Set on a client-type page, e.g. "lps" on /private-markets/lps/. */
  audience: z
    .string()
    .regex(/^[a-z][a-z-]{0,39}$/)
    .optional(),
  /** Set when applying for a specific role. */
  role: singleLine(120).optional(),
});
export type EntryPoint = z.infer<typeof EntryPoint>;

/** A short, stable label for an entry point: "private-markets/lps/ · hero". */
export const describeEntry = (e: EntryPoint) =>
  `${e.page === '' ? 'home' : e.page.replace(/\/$/, '')} · ${e.placement}`;
