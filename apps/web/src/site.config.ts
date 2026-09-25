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
  nav: Record<NavKey, { lockup?: string; top: NavItem[]; main: NavItem[] }>;
  footer: { title: string; links: NavItem[] }[];
}

// A desk's nav tabs are its personalised client-type pages, in the order the
// content file lists them. Add an audience there and its tab appears here.
const tabs = (desk: ProductDesk): NavItem[] =>
  audiencePages.filter((a) => a.desk === desk).map((a) => ({ label: a.nav, to: `${desk}/${a.id}` }));

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

  // Navigation changes per destination: the company pages show the products,
  // each product page shows its own audiences.
  nav: {
    company: {
      top: [{ label: 'Log in', href: 'login' }],
      main: [
        { label: 'Private Markets', to: 'private-markets' },
        { label: 'Digital Assets', to: 'digital-assets' },
        { label: 'Token Disclosure', to: 'token-disclosure' },
        { label: 'Insights', to: 'insights' },
        { label: 'Company', to: 'company' },
      ],
    },
    'private-markets': {
      lockup: 'Private Markets',
      top: [
        { label: 'Digital Assets', to: 'digital-assets' },
        { label: 'Company', to: 'company' },
        { label: 'Log in', href: 'login' },
      ],
      main: [
        ...tabs('private-markets'),
        { label: 'Insights', to: 'private-markets', hash: 'insights' },
        { label: 'Events', to: 'private-markets', hash: 'events' },
      ],
    },
    'digital-assets': {
      lockup: 'Digital Assets',
      top: [
        { label: 'Private Markets', to: 'private-markets' },
        { label: 'Company', to: 'company' },
        { label: 'Log in', href: 'login' },
      ],
      main: [
        ...tabs('digital-assets'),
        { label: 'Token Disclosure', to: 'token-disclosure' },
        { label: 'Insights', to: 'digital-assets', hash: 'insights' },
        { label: 'Events', to: 'digital-assets', hash: 'events' },
      ],
    },
    'token-disclosure': {
      lockup: 'Token Disclosure',
      top: [
        { label: 'Private Markets', to: 'private-markets' },
        { label: 'Digital Assets', to: 'digital-assets' },
        { label: 'Company', to: 'company' },
        { label: 'Log in', href: 'login' },
      ],
      main: [
        ...tabs('token-disclosure'),
        { label: 'MiCA Whitepaper', to: 'mica-whitepaper' },
        { label: 'The register', to: 'token-disclosure/register' },
        { label: 'Insights', to: 'token-disclosure', hash: 'insights' },
      ],
    },
  },

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
        { label: 'About us', to: 'company' },
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
        { label: 'Trust Center', href: 'https://app.eu.vanta.com/eunice.ai/trust/siy0j28scq653o6k5baea' },
        { label: 'Support', href: 'mailto:support@eunice.ai' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/company/euniceai/' },
        { label: 'X (Twitter)', href: 'https://x.com/eunice_ai1' },
      ],
    },
  ],
};

export default config;
