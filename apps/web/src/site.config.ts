// Site-wide settings. Everything a non-developer is likely to change lives in /src/content.
import { audiencePages } from './content/index.ts';
import type { NavItem, NavKey, ProductDesk } from './lib/types.ts';

export interface SiteConfig {
  name: string;
  legalLine: string;
  tagline: string;
  contactEmail: string;
  careersEmail: string;
  formEndpoint: string;
  basePath: string;
  loginUrl: string;
  trustCenterUrl: string;
  menus: { id: string; label: string; to: string; keys: NavKey[]; items: NavItem[] }[];
  lockups: Partial<Record<NavKey, string>>;
  loginOn: NavKey[];
  footer: { title: string; links: NavItem[] }[];
}

// A desk's nav tabs are its personalised client-type pages, in the order the
// content file lists them. Add an audience there and its tab appears here.
const tabs = (desk: ProductDesk): NavItem[] =>
  audiencePages.filter((a) => a.desk === desk).map((a) => ({ label: a.nav, to: `${desk}/${a.id}` }));

// The Vanta trust center, as linked from the live eunice.ai footer.
const TRUST_CENTER = 'https://app.eu.vanta.com/eunice.ai/trust/siy0j28scq653o6k5baea';

const config: SiteConfig = {
  name: 'Eunice',
  legalLine: 'Reasoon Limited, trading as Eunice · London · SOC 2 Type II · GDPR · FCA regulatory sandbox',
  tagline: 'Due diligence, disclosure and monitoring for regulated finance.',

  // Where "Talk to us" submissions go. formEndpoint is intake's POST /v1/submissions;
  // it is set per build with PUBLIC_FORM_ENDPOINT, and a production build refuses it
  // until there is a privacy page (ADR-0007). While it is empty, the form opens the
  // visitor's mail app addressed to contactEmail. TODO: confirm it before going live.
  contactEmail: 'hello@eunice.ai',
  // Job applications go to each role's application form (roles in content/index.ts).
  // This address is for everyone else who wants to work with us, as on eunice.ai.
  careersEmail: 'career@eunice.ai',
  formEndpoint: '',

  // Path the site is served from. '/' on a custom domain (eunice.ai);
  // '/<repo-name>/' while it lives at <user>.github.io/<repo-name>. Only the 404 page uses it.
  basePath: process.env['BASE_PATH'] || '/',

  loginUrl: 'https://app.eunice.ai', // TODO: confirm
  trustCenterUrl: TRUST_CENTER,

  // One header on every page: three menus, each a landing page with a dropdown of
  // the sections and pages under it. `keys` are the page groups the menu is
  // highlighted on; `lockups` names the desk beside the logo on its own pages.
  menus: [
    {
      id: 'welcome',
      label: 'Welcome to Eunice',
      to: '',
      keys: ['company'],
      items: [
        { label: 'Team', to: '', hash: 'team' },
        { label: 'Firm history', to: '', hash: 'history' },
        { label: 'What we stand for', to: '', hash: 'values' },
        { label: 'Eunice AI Trust Centre', to: '', hash: 'trust' },
        { label: 'Careers', to: 'careers' },
      ],
    },
    {
      id: 'private-markets',
      label: 'Private Markets',
      to: 'private-markets',
      keys: ['private-markets'],
      items: [
        { label: 'Operational Due Diligence', to: 'private-markets', hash: 'odd' },
        { label: 'Portfolio Monitoring', to: 'private-markets', hash: 'monitoring' },
        { label: 'Data Gap Analysis', to: 'private-markets', hash: 'data-gaps' },
        { label: 'Bespoke Reporting', to: 'private-markets', hash: 'reporting' },
      ],
    },
    {
      id: 'crypto',
      label: 'Crypto & RWA',
      to: 'digital-assets',
      keys: ['digital-assets', 'token-disclosure'],
      items: [
        { label: 'Listing diligence', to: 'digital-assets', hash: 'listing' },
        { label: 'Monitoring', to: 'digital-assets', hash: 'monitoring' },
        { label: 'Token Disclosure', to: 'token-disclosure' },
        { label: 'MiCA Whitepaper', to: 'mica-whitepaper' },
        { label: 'The register', to: 'token-disclosure/register' },
      ],
    },
  ],
  lockups: {
    'private-markets': 'Private Markets',
    'digital-assets': 'Digital Assets',
    'token-disclosure': 'Token Disclosure',
  },
  // The product sign-in is for digital assets clients only, so it shows on those pages.
  loginOn: ['digital-assets', 'token-disclosure'],

  footer: [
    { title: 'Private markets', links: tabs('private-markets') },
    {
      title: 'Digital assets',
      links: [
        { label: 'Listing diligence', to: 'digital-assets', hash: 'listing' },
        { label: 'Monitoring', to: 'digital-assets', hash: 'monitoring' },
        ...tabs('digital-assets'),
      ],
    },
    {
      title: 'Token disclosure',
      links: [
        ...tabs('token-disclosure'),
        { label: 'MiCA Whitepaper', to: 'mica-whitepaper' },
        { label: 'The register', to: 'token-disclosure/register' },
      ],
    },
    {
      title: 'Insights',
      links: [
        { label: 'Digital assets', to: 'insights', query: 'digital-assets' },
        { label: 'Token disclosure', to: 'insights', query: 'token-disclosure' },
        { label: 'Company news', to: 'insights', query: 'company' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', to: '', hash: 'history' },
        { label: 'Careers', to: 'careers' },
        { label: 'Blog', to: 'blog' },
        { label: 'Security', to: 'security' },
        { label: 'Contact', form: 'general' },
      ],
    },
    // The links in the live eunice.ai footer, at the same addresses.
    {
      title: 'Connect',
      links: [
        { label: 'Trust Center', href: TRUST_CENTER },
        { label: 'Support', href: 'mailto:support@eunice.ai' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/euniceai/' },
        { label: 'X (Twitter)', href: 'https://x.com/eunice_ai1' },
      ],
    },
  ],
};

export default config;
