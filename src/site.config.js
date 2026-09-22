// Site-wide settings. Everything a non-developer is likely to change lives in /src/content.
import { audiencePages } from './content/index.js';

// A desk's nav tabs are its personalised client-type pages, in the order the
// content file lists them. Add an audience there and its tab appears here.
const tabs = (desk) => audiencePages
  .filter((a) => a.desk === desk)
  .map((a) => ({ label: a.nav, to: `${desk}/${a.id}` }));

export default {
  name: 'Eunice',
  legalLine: 'Reasoon Limited, trading as Eunice · London · SOC 2 Type II · GDPR · FCA regulatory sandbox',
  tagline: 'Due diligence, disclosure and monitoring for regulated finance.',

  // Where "Talk to us" and "Apply" submissions go.
  // formEndpoint: any service that accepts a JSON POST (Formspree, a Cloudflare Worker, etc).
  // While it is empty, the form opens the visitor's mail app addressed to contactEmail.
  // TODO: confirm both with the team before going live.
  contactEmail: 'hello@eunice.ai',
  careersEmail: 'careers@eunice.ai',
  formEndpoint: '',

  // Path the site is served from. '/' on a custom domain (eunice.ai);
  // '/<repo-name>/' while it lives at <user>.github.io/<repo-name>. Only the 404 page uses it.
  basePath: process.env.BASE_PATH || '/',

  loginUrl: 'https://app.eunice.ai', // TODO: confirm

  // Navigation changes per destination: the company pages show the products,
  // each product page shows its own audiences.
  nav: {
    company: {
      top: [{ label: 'Log in', href: 'login' }],
      main: [
        { label: 'Private Markets', to: 'private-markets' },
        { label: 'Digital Assets', to: 'digital-assets' },
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
        { label: 'Token Disclosure', to: 'digital-assets', hash: 'token-disclosure' },
        { label: 'Insights', to: 'digital-assets', hash: 'insights' },
        { label: 'Events', to: 'digital-assets', hash: 'events' },
      ],
    },
  },

  footer: [
    { title: 'Private markets', links: tabs('private-markets') },
    { title: 'Digital assets', links: [
      { label: 'Listing diligence', to: 'digital-assets', hash: 'listing' },
      { label: 'Monitoring', to: 'digital-assets', hash: 'monitoring' },
      { label: 'Token Disclosure', to: 'digital-assets', hash: 'token-disclosure' },
      { label: 'MiCA whitepaper library', to: 'digital-assets', hash: 'token-disclosure' },
    ] },
    { title: 'Insights', links: [
      { label: 'Private markets', to: 'insights', query: 'private-markets' },
      { label: 'Digital assets', to: 'insights', query: 'digital-assets' },
      { label: 'Token disclosure', to: 'insights', query: 'token-disclosure' },
      { label: 'Company news', to: 'insights', query: 'company' },
    ] },
    { title: 'Company', links: [
      { label: 'About us', to: 'company' },
      { label: 'Careers', to: 'careers' },
      { label: 'Security', to: 'company', hash: 'how-we-work' },
      { label: 'Contact', talk: 'general' },
    ] },
  ],
};
