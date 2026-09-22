// All shared content. Edit here and every page that shows the item updates on the next build.
// Desks: 'private-markets' | 'digital-assets' | 'token-disclosure' | 'company'

export const desks = {
  'private-markets': { label: 'Private Markets' },
  'digital-assets': { label: 'Digital Assets' },
  'token-disclosure': { label: 'Token Disclosure' },
  company: { label: 'Company' },
};

// Portrait: drop a square JPG into /src/assets/img/people/ and set `photo` to its file name.
// Bio: shown when a visitor hovers or taps the name. Leave empty to show nothing.
export const people = {
  yi: {
    name: 'Yi Luo', role: 'CEO and co-founder',
    owns: 'The company, its clients and its capital.',
    bio: '', photo: '',
  },
  philip: {
    name: 'Philip Lam', role: 'CTO and co-founder',
    owns: 'The platform, and how it reads a dataroom.',
    bio: '', photo: '',
  },
  petronela: {
    name: 'Petronela Pell', role: 'Head of Private Markets',
    owns: 'The private markets desk and its implementations.',
    bio: '16+ years’ financial services experience at Schroders Capital, Accenture, T. Rowe Price, Aberdeen and Investec. INSEAD MBA, Durham University BA (Hons) in Philosophy, Politics & Economics, both degrees under academic scholarships.',
    photo: '',
  },
  vinay: {
    name: 'Vinay Manektalla', role: 'Head of Engineering',
    owns: 'The engineering team, day to day.',
    bio: '', photo: '',
  },
  chrislyn: {
    name: 'Chrislyn Pereira', role: 'Chief of Staff',
    owns: 'Operations, security and how a client’s data is handled.',
    bio: '', photo: '',
  },
  winnie: { name: 'Winnie Chan', role: 'Frontend engineer', owns: 'The product interface.', bio: '', photo: '' },
  riley: { name: 'Riley Ward', role: 'Engineer', owns: 'The validation and monitoring pipelines.', bio: '', photo: '' },
};

// type: 'Article' | 'Note' | 'Video' | 'Press'. Newest first is not required; pages sort by date.
// url: where the piece lives today. Empty = not linked yet.
export const insights = [
  { date: '2026-09-04', desk: 'private-markets', type: 'Note', featured: true,
    title: 'What allocators asked us three times at the BVCA Summit',
    standfirst: 'The same three questions from six allocators in two days — on subscription lines, whole-fund reporting, and who signs off.' },
  { date: '2026-08-21', desk: 'private-markets', type: 'Article',
    title: 'Reading an LPA for the subscription line, and why it matters to net IRR' },
  { date: '2026-08-07', desk: 'private-markets', type: 'Note',
    title: 'Whole-fund reporting and the concentration you cannot see' },
  { date: '2026-07-23', desk: 'token-disclosure', type: 'Video', featured: true,
    title: 'Preparing for the new UK crypto regime: getting ahead on A&D and MARC',
    standfirst: 'A session on the UK’s incoming regime for crypto-asset activities and disclosure, and what an issuer or an exchange should have ready before it lands.' },
  { date: '2026-07-21', desk: 'token-disclosure', type: 'Press',
    title: 'Eunice and gunnercooke partner to make UK token classification clearer' },
  { date: '2026-06-16', desk: 'company', type: 'Press', featured: true,
    title: 'Eunice is part of the London FinTech delegation to Singapore',
    standfirst: 'A week with the London delegation, meeting the exchanges and custodians that operate under MAS.' },
  { date: '2026-05-06', desk: 'company', type: 'Press', title: 'Eunice makes the Fintech 50' },
  { date: '2026-03-27', desk: 'company', type: 'Press',
    title: 'Eunice raises $8m to replace manual due diligence with institutional-grade AI infrastructure' },
  { date: '2025-11-28', desk: 'token-disclosure', type: 'Article',
    title: 'Eunice accepted into the FCA regulatory sandbox to advance digital asset disclosure standards' },
  { date: '2025-11-17', desk: 'digital-assets', type: 'Article', featured: true,
    title: 'Anatomy of a “legacy code” exploit: the $100M Balancer V2 failure',
    standfirst: 'How an old contract, still live, became the largest failure of the year — and what monitoring should have flagged.' },
  { date: '2025-04-03', desk: 'company', type: 'Video',
    title: 'Unveiling Eunice: bridging gaps in crypto and AI-powered risk monitoring' },
  { date: '2024-10-16', desk: 'digital-assets', type: 'Video', featured: true,
    title: 'Macroeconomic drivers of crypto assets (ETHSofia 2024)',
    standfirst: 'A talk on rates, liquidity and the correlations that actually hold.' },
  { date: '2024-10-10', desk: 'digital-assets', type: 'Article', featured: true,
    title: 'What is the role of risk management in cryptoassets?',
    standfirst: 'Risk management as a function, not a dashboard. What a listing committee should own.' },
  { date: '2024-05-31', desk: 'digital-assets', type: 'Video', title: 'De-risking DeFi (Consensus 2024)' },
  { date: '2024-04-21', desk: 'digital-assets', type: 'Article', title: 'Eunice — Moody’s for tokens' },
];

// month: 'YYYY-MM'. desks: which product pages list it (the home page lists every past event).
export const events = [
  { month: '2026-10', desks: ['private-markets'], name: 'Grow London Germany Trade Mission',
    note: 'Petronela Pell attending a week of meetings with local institutional clients & prospects.' },
  { month: '2026-06', desks: ['private-markets', 'digital-assets'], name: 'London FinTech delegation to Singapore',
    note: 'A week of meetings with the exchanges and custodians that operate under MAS.' },
  { month: '2024-10', desks: ['digital-assets'], name: 'ETHSofia, Sofia', note: 'Talk: macroeconomic drivers of crypto assets.' },
  { month: '2024-05', desks: ['digital-assets'], name: 'Consensus, Austin', note: 'Panel: de-risking DeFi.' },
];

export const quotes = {
  fof: { desk: 'private-markets',
    text: 'Eunice turns our data rooms into structured reports fully aligned with our internal process.',
    who: 'Investment committee member, European fund-of-funds' },
  falconx: { desk: 'digital-assets',
    text: 'Speed without accountability isn’t an option in compliance. Eunice enables us to run faster, more rigorous token listing reviews — with the consistency to scale confidently across jurisdictions.',
    who: 'Vanessa Zhang, Global Chief Compliance Officer, FalconX' },
  zodia: { desk: 'digital-assets',
    text: 'Innovative solutions like Eunice AI support our mission to set new benchmarks for compliance, transparency and operational resilience in digital asset custody.',
    who: 'Risk & Compliance team, Zodia Custody' },
};

export const partners = ['Coinbase', 'Copper', 'Crypto.com', 'Zodia Custody', 'FalconX', 'CMS', 'gunnercooke'];

export const roles = [
  { id: 'gtm-da', title: 'GTM Lead, Digital Assets', where: 'London · remote-friendly',
    what: 'Own the exchange, custodian and market-maker pipeline. You have sold into a risk or compliance team before.' },
  { id: 'impl-pm', title: 'Client Implementation Consultant, Private Markets', where: 'London · remote-friendly',
    what: 'Sit with LPs and fund managers while Eunice reads their first dataroom. You have run diligence yourself.' },
  { id: 'eng', title: 'Senior Software / AI Engineer', where: 'London · remote-friendly',
    what: 'Your code ships into regulated financial workflows, where every output has to be defensible.' },
];
