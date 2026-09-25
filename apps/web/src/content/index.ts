// All shared content. Edit here and every page that shows the item updates on the next build.
// Every value is checked against src/content/schema.ts when the site is built.
import { z } from 'zod';
import { AudiencePages, content, contentRecord, Desks, Event, Insight, Person, Quote, Role } from './schema.ts';

export const desks = content('desks', Desks, {
  'private-markets': { label: 'Private Markets' },
  'digital-assets': { label: 'Digital Assets' },
  'token-disclosure': { label: 'Token Disclosure' },
  company: { label: 'Company' },
});

// One personalised page per client type. Each entry becomes /<desk>/<id>/, supplies its
// desk's nav tab, and is what the audience card on the desk page links to — so a client
// type is written once here and never pasted into a page.
//   nav        the tab label in the desk nav
//   card       the title and one line shown on the desk page's card
//   now        what the week looks like without us; three lines, no more
//   work       what Eunice does about it; three, in the order they happen
export const audiencePages = content('audiencePages', AudiencePages, [
  {
    id: 'lps',
    desk: 'private-markets',
    nav: 'For LPs',
    card: {
      title: 'LPs and asset owners',
      text: 'Ten fund documents, one committee, and a question you have to answer by Thursday.',
    },
    title: 'Eunice for LPs and asset owners — operational due diligence',
    description:
      'Every fund document read against the ODD checklist you already use, every finding cited to its page, and the same questions asked again each quarter.',
    h1: 'Diligence on every fund, before the committee sits',
    lead: 'An agent does the messy work — chasing the data down and checking it is right. Investment and operational due diligence, then monitoring, against the checklist you already use.',
    now: [
      'Ten fund documents arrive, the committee date is fixed, and the answer you need is not in the summary.',
      'The same diligence runs again next quarter, and last quarter’s version is in somebody’s inbox.',
      'A finding without a page reference is a finding you have to verify yourself.',
    ],
    work: [
      {
        title: 'Your checklist, not ours',
        text: 'Every PPM, DDQ, LPA, valuation policy and audited statement read against the ODD checklist your committee already signed off.',
      },
      {
        title: 'What is missing is the finding',
        text: 'The gap is the output, not a summary of what is present. Every finding cites the page it came from, so the committee can check it.',
      },
      {
        title: 'Asked again each quarter',
        text: 'The same questions run across every fund you hold, as often as suits your cycle. What changed comes back as a diff.',
      },
    ],
    cta: {
      title: 'Talk to us about the fund you are reviewing now',
      text: 'A thirty-minute call with the desk. Bring the fund; we show you what Eunice reads, what it returns and how the quarterly cycle runs.',
    },
  },
  {
    id: 'managers',
    desk: 'private-markets',
    nav: 'For managers',
    card: { title: 'Fund managers', text: 'The same ODD questionnaire, asked eleven ways, by eleven different LPs.' },
    title: 'Eunice for fund managers — answer the diligence questionnaire once',
    description:
      'The same ODD questionnaire arrives eleven ways from eleven LPs. Eunice reads your own documents once and answers from them, with the page attached.',
    h1: 'Answer the same questionnaire once',
    lead: 'Eleven LPs, eleven formats, one set of facts. Eunice reads your own documents once and answers from them, so the version that goes out is the version you can stand behind.',
    now: [
      'The same question arrives in eleven shapes, and each one is answered from scratch.',
      'Two answers to the same question disagree, and nobody notices until an LP does.',
      'The people who know the answer are the people raising the next fund.',
    ],
    work: [
      {
        title: 'Read your side once',
        text: 'Your fund documents, policies and statements read into one structure, so every answer comes from the same place.',
      },
      {
        title: 'Answer in the LP’s format',
        text: 'The questionnaire in front of you filled from that structure, with the page each answer came from attached.',
      },
      {
        title: 'Stay true after the raise',
        text: 'When a document changes, the answers that depended on it are flagged rather than quietly going stale.',
      },
    ],
    cta: {
      title: 'Bring us the questionnaire on your desk',
      text: 'Send the one you are answering this week. We will show you what Eunice fills from your own documents, and what it leaves for you.',
    },
  },
  {
    id: 'family-offices',
    desk: 'private-markets',
    nav: 'For family offices',
    card: { title: 'Family offices', text: 'Enable you to do more with a lean team.' },
    title: 'Eunice for family offices — the diligence of a full team',
    description:
      'Run the diligence of a full team, whatever the size of yours. Fewer people, the same rigour, better decisions.',
    h1: 'The diligence of a full team, whatever the size of yours',
    lead: 'Fewer people, the same rigour. The work that would need a diligence team runs against your checklist, and what comes back is a memo your principals can read.',
    now: [
      'The diligence that decides the allocation is done by the person who also runs everything else.',
      'A fund is passed on because there was no week to read it properly, not because it failed.',
      'What was checked last time lives in one person’s memory.',
    ],
    work: [
      {
        title: 'One checklist, held for you',
        text: 'Your standard written down once and applied to every fund, so the bar does not move with whoever is free that week.',
      },
      {
        title: 'The reading done for you',
        text: 'The dataroom read in full, with the findings and their page references in a memo your principals can take to a meeting.',
      },
      {
        title: 'A record that outlasts the week',
        text: 'What was asked, what came back and what changed since, kept in one place rather than in an inbox.',
      },
    ],
    cta: {
      title: 'Put one fund through it',
      text: 'Pick a fund you are looking at now. We will run it and show you the memo, the findings and the page each one came from.',
    },
  },
  {
    id: 'consultants',
    desk: 'private-markets',
    nav: 'For consultants',
    card: {
      title: 'Investment consultants',
      text: 'Twenty managers to compare on terms that were never written the same way.',
    },
    title: 'Eunice for investment consultants — compare managers like for like',
    description:
      'Twenty managers, twenty document sets, and terms that were never written the same way. Eunice reads them into one shape so the comparison holds.',
    h1: 'Compare twenty managers on the same terms',
    lead: 'Twenty document sets, and no two of them written the same way. Eunice reads them into one shape, so the comparison your client sees is like for like.',
    now: [
      'The same term is called three things across three managers, and the comparison quietly stops being one.',
      'The differences that matter are on page 40, not in the summary.',
      'Every refresh of the screen means reading all of it again.',
    ],
    work: [
      {
        title: 'One shape for every manager',
        text: 'Each set read against the same framework, so the fee, the term and the governance line up in a column rather than a paragraph.',
      },
      {
        title: 'The difference, with its page',
        text: 'Where two managers differ, the finding says where in each document it differs, so your recommendation can be checked.',
      },
      {
        title: 'Refresh without re-reading',
        text: 'When a document is replaced, only what changed comes back to you.',
      },
    ],
    cta: {
      title: 'Bring us a screen you are running now',
      text: 'Send the managers you are comparing. We will read them into one shape and show you where they actually differ.',
    },
  },
  {
    id: 'exchanges',
    desk: 'digital-assets',
    nav: 'For exchanges',
    card: { title: 'Exchanges', text: 'A listing queue that grows faster than the team reviewing it.' },
    title: 'Eunice for exchanges — listing diligence your committee signs off',
    description:
      'One report per asset covering the team, the code, the reserve and the jurisdiction, in the shape a listing committee already signs off.',
    h1: 'A listing queue the review team can keep up with',
    lead: 'One report per asset — the team, the code, the reserve and the jurisdiction — in the shape your listing committee already signs off.',
    now: [
      'The queue grows faster than the team reviewing it, and the backlog is the product decision.',
      'Two analysts review the same asset to two different standards.',
      'An asset cleared under one regime is cleared again from scratch under the next.',
    ],
    work: [
      {
        title: 'One report per asset',
        text: 'Team, code, reserve and jurisdiction in a single document, in the format the committee already reads.',
      },
      {
        title: 'The same standard every time',
        text: 'The review runs the same way whoever is on the desk, and every claim carries the source it came from.',
      },
      {
        title: 'Cleared once, across regimes',
        text: 'MiCA, the UK regime, MAS and VARA in one view, so a cleared asset is not re-cleared from nothing.',
      },
    ],
    cta: {
      title: 'Put one asset through it',
      text: 'Pick a token in your queue now. We will run it and show you the report and the monitoring feed side by side.',
    },
  },
  {
    id: 'custodians',
    desk: 'digital-assets',
    nav: 'For custodians',
    card: { title: 'Custodians', text: 'You hold the asset. You are the last to hear when something moves.' },
    title: 'Eunice for custodians — monitoring that reaches you first',
    description:
      'Exploits, protocol changes, enforcement actions and reserve movements, surfaced the hour they land with the source attached.',
    h1: 'Hear it before the trade press does',
    lead: 'You hold the asset, so you should not be the last to know. Exploits, protocol changes, enforcement actions and reserve movements, surfaced the hour they land with the source attached.',
    now: [
      'The first notice of an exploit is a client asking about it.',
      'The asset was reviewed at onboarding, and the review is as old as the relationship.',
      'An alert with no source behind it cannot be passed to a client.',
    ],
    work: [
      {
        title: 'Watched, not sampled',
        text: 'Every asset you hold monitored continuously rather than revisited at review time.',
      },
      {
        title: 'The hour it lands',
        text: 'Exploits, protocol changes, enforcement actions and reserve movements surfaced as they happen, each with its source named.',
      },
      {
        title: 'Something you can forward',
        text: 'What reaches you is specific enough to act on and sourced well enough to send to a client.',
      },
    ],
    cta: {
      title: 'Point it at what you hold',
      text: 'Give us a handful of the assets on your book. We will show you what the monitoring feed would have told you this quarter.',
    },
  },
  {
    id: 'market-makers',
    desk: 'digital-assets',
    nav: 'For market makers',
    card: { title: 'Market makers', text: 'Inventory in something whose disclosure changed this morning.' },
    title: 'Eunice for market makers — know what changed before the position does',
    description:
      'Inventory in an asset whose disclosure changed this morning is a risk you can price, if you hear about it in time.',
    h1: 'Know what changed before the position does',
    lead: 'Inventory in an asset whose disclosure changed this morning is a risk you can price — as long as you hear about it in time, and with the source attached.',
    now: [
      'The disclosure changed at 09:00 and the position was still on at noon.',
      'The research that justified the inventory is a quarter old.',
      'Risk asks why the book holds it, and the answer is in a chat thread.',
    ],
    work: [
      {
        title: 'A view per asset',
        text: 'The team, the code, the reserve and the jurisdiction in one place, so the reason for holding is written down.',
      },
      {
        title: 'Changes as they land',
        text: 'Protocol changes, enforcement actions and reserve movements surfaced the hour they happen, with the source named.',
      },
      {
        title: 'Defensible to risk',
        text: 'Every claim cites where it came from, so the position has a record behind it rather than a recollection.',
      },
    ],
    cta: {
      title: 'Run it against your book',
      text: 'Send us the assets you make markets in. We will show you what changed on them in the last quarter, and when we would have told you.',
    },
  },
  {
    id: 'issuers',
    desk: 'token-disclosure',
    nav: 'For issuers',
    card: { title: 'Issuers', text: 'A white paper that has to be accepted once, and stay true after that.' },
    title: 'Eunice for issuers — a MiCA white paper accepted once',
    description:
      'Drafted from a library of 1,000+ pre-filled papers, reviewed where a legal opinion is needed, notified to the authority and hosted where anyone can check it.',
    h1: 'A white paper accepted once',
    lead: 'Drafted from a library of 1,000+ pre-filled papers, reviewed where a legal opinion is needed, notified to the authority, and hosted on a page anyone can open.',
    now: [
      'The paper has to be right before it is filed, and there is no second first submission.',
      'Every exchange that might list the token asks for the same document a different way.',
      'A disclosure that was true at filing quietly stops being true.',
    ],
    work: [
      {
        title: 'Drafted from the library',
        text: 'A MiCA white paper drafted from 1,000+ pre-filled papers, so the starting point is a document that has already been through this.',
      },
      {
        title: 'Reviewed where it counts',
        text: 'CMS reviews the points that need a legal opinion, rather than a legal bill for the whole document.',
      },
      {
        title: 'Notified and hosted',
        text: 'Notified to the authority and hosted on a public page, so there is one address for the version that stands.',
      },
    ],
    cta: {
      title: 'Start a white paper',
      text: 'Tell us about the token and the jurisdiction. We will show you the draft the library produces and what would still need an opinion.',
    },
  },
  {
    id: 'counsel',
    desk: 'token-disclosure',
    nav: 'For counsel',
    card: { title: 'Counsel', text: 'A draft that arrives in the shape the regime asks for.' },
    title: 'Eunice for counsel — review the paper, not the boilerplate',
    description:
      'The draft arrives in the shape the regime asks for, so the hours go on the judgement calls rather than on assembling a document from nothing.',
    h1: 'Review the paper, not the boilerplate',
    lead: 'The draft arrives already in the shape the regime asks for, so your hours go on the judgement calls rather than on assembling a document from nothing.',
    now: [
      'The first draft is a blank page, and the first week goes on structure.',
      'The same recitals are rewritten for every client, slightly differently each time.',
      'Classification is the hard part, and it is the part with the least time left.',
    ],
    work: [
      {
        title: 'Structure already settled',
        text: 'The draft follows the regime’s own shape, drawn from 1,000+ pre-filled papers, so review starts at the substance.',
      },
      {
        title: 'Opinions where they are needed',
        text: 'CMS reviews the points that need one. UK token classification runs with gunnercooke, since July 2026.',
      },
      {
        title: 'A version you can point at',
        text: 'What was notified is hosted publicly, so advice given later refers to a document anyone can open.',
      },
    ],
    cta: {
      title: 'Put a live matter through it',
      text: 'Bring a paper you are drafting now. We will show you what the library fills and what it leaves to you.',
    },
  },
  {
    id: 'exchanges',
    desk: 'token-disclosure',
    nav: 'For exchanges',
    card: { title: 'Exchanges', text: 'Check what an issuer published, without asking them for it.' },
    title: 'Eunice for exchanges — check the disclosure yourself',
    description:
      'Every paper Eunice notifies is hosted on a public page, so a listing team can read what an issuer published without a request and a wait.',
    h1: 'Check the disclosure yourself',
    lead: 'Every paper Eunice notifies is hosted on a page anyone can open, so a listing team reads what the issuer published without sending a request and waiting on the answer.',
    now: [
      'The disclosure arrives as an attachment in a thread, and nobody is certain it is the current one.',
      'Confirming a filing means asking the issuer and waiting.',
      'The paper behind a listing decision is somewhere in an inbox.',
    ],
    work: [
      {
        title: 'One public address',
        text: 'A notified paper lives on a page anyone can open, so there is nothing to request and nothing to chase.',
      },
      {
        title: 'The version that stands',
        text: 'The hosted page carries the paper as it stands, so what a listing team reads is what is true today rather than an attachment from a thread.',
      },
      {
        title: 'Beside the listing report',
        text: 'The same desk produces the listing diligence report, so the disclosure and the review sit together.',
      },
    ],
    cta: {
      title: 'Look up a token you are reviewing',
      text: 'Name an asset in your queue. We will show you what the register holds on it, and what the listing report adds.',
    },
  },
]);

// Portrait: drop a square JPG into /src/assets/img/people/ and set `photo` to its file name.
// Bio: shown when a visitor hovers or taps the name. Leave empty to show nothing.
export const people = contentRecord('people', Person, {
  yi: {
    name: 'Yi Luo',
    role: 'CEO and co-founder',
    owns: 'The company, its clients and its capital.',
    bio: '',
    photo: '',
  },
  philip: {
    name: 'Philip Lam',
    role: 'CTO and co-founder',
    owns: 'The platform, and how it reads a dataroom.',
    bio: '',
    photo: '',
  },
  petronela: {
    name: 'Petronela Pell',
    role: 'Head of Private Markets',
    owns: 'The private markets desk and its implementations.',
    bio: '16+ years’ financial services experience at Schroders Capital, Accenture, T. Rowe Price, Aberdeen and Investec. INSEAD MBA, Durham University BA (Hons) in Philosophy, Politics & Economics, both degrees under academic scholarships.',
    photo: '',
  },
  vinay: {
    name: 'Vinay Manektalla',
    role: 'Head of Engineering',
    owns: 'The engineering team, day to day.',
    bio: '',
    photo: '',
  },
  chrislyn: {
    name: 'Chrislyn Pereira',
    role: 'Chief of Staff',
    owns: 'Operations, security and how a client’s data is handled.',
    bio: '',
    photo: '',
  },
  winnie: { name: 'Winnie Chan', role: 'Frontend engineer', owns: 'The product interface.', bio: '', photo: '' },
  riley: { name: 'Riley Ward', role: 'Engineer', owns: 'The validation and monitoring pipelines.', bio: '', photo: '' },
});

// type: 'Article' | 'Note' | 'Video' | 'Press'. Newest first is not required; pages sort by date.
// url: where the piece lives today. Empty = not linked yet.
export const insights = content('insights', z.array(Insight), [
  {
    date: '2026-09-04',
    desk: 'private-markets',
    type: 'Note',
    featured: true,
    title: 'What allocators asked us three times at the BVCA Summit',
    standfirst:
      'The same three questions from six allocators in two days — on subscription lines, whole-fund reporting, and who signs off.',
  },
  {
    date: '2026-08-21',
    desk: 'private-markets',
    type: 'Article',
    title: 'Reading an LPA for the subscription line, and why it matters to net IRR',
  },
  {
    date: '2026-08-07',
    desk: 'private-markets',
    type: 'Note',
    title: 'Whole-fund reporting and the concentration you cannot see',
  },
  {
    date: '2026-07-23',
    desk: 'token-disclosure',
    type: 'Video',
    featured: true,
    title: 'Preparing for the new UK crypto regime: getting ahead on A&D and MARC',
    standfirst:
      'A session on the UK’s incoming regime for crypto-asset activities and disclosure, and what an issuer or an exchange should have ready before it lands.',
  },
  {
    date: '2026-07-21',
    desk: 'token-disclosure',
    type: 'Press',
    title: 'Eunice and gunnercooke partner to make UK token classification clearer',
  },
  {
    date: '2026-06-16',
    desk: 'company',
    type: 'Press',
    featured: true,
    title: 'Eunice is part of the London FinTech delegation to Singapore',
    standfirst: 'A week with the London delegation, meeting the exchanges and custodians that operate under MAS.',
  },
  { date: '2026-05-06', desk: 'company', type: 'Press', title: 'Eunice makes the Fintech 50' },
  {
    date: '2026-03-27',
    desk: 'company',
    type: 'Press',
    title: 'Eunice raises $8m to replace manual due diligence with institutional-grade AI infrastructure',
  },
  {
    date: '2025-11-28',
    desk: 'token-disclosure',
    type: 'Article',
    title: 'Eunice accepted into the FCA regulatory sandbox to advance digital asset disclosure standards',
  },
  {
    date: '2025-11-17',
    desk: 'digital-assets',
    type: 'Article',
    featured: true,
    title: 'Anatomy of a “legacy code” exploit: the $100M Balancer V2 failure',
    standfirst:
      'How an old contract, still live, became the largest failure of the year — and what monitoring should have flagged.',
  },
  {
    date: '2025-04-03',
    desk: 'company',
    type: 'Video',
    title: 'Unveiling Eunice: bridging gaps in crypto and AI-powered risk monitoring',
  },
  {
    date: '2024-10-16',
    desk: 'digital-assets',
    type: 'Video',
    featured: true,
    title: 'Macroeconomic drivers of crypto assets (ETHSofia 2024)',
    standfirst: 'A talk on rates, liquidity and the correlations that actually hold.',
  },
  {
    date: '2024-10-10',
    desk: 'digital-assets',
    type: 'Article',
    featured: true,
    title: 'What is the role of risk management in cryptoassets?',
    standfirst: 'Risk management as a function, not a dashboard. What a listing committee should own.',
  },
  { date: '2024-05-31', desk: 'digital-assets', type: 'Video', title: 'De-risking DeFi (Consensus 2024)' },
  { date: '2024-04-21', desk: 'digital-assets', type: 'Article', title: 'Eunice — Moody’s for tokens' },
]);

// month: 'YYYY-MM'. desks: which product pages list it (the home page lists every past event).
export const events = content('events', z.array(Event), [
  {
    month: '2026-10',
    desks: ['private-markets'],
    name: 'Grow London Germany Trade Mission',
    note: 'Petronela Pell attending a week of meetings with local institutional clients & prospects.',
  },
  {
    month: '2026-06',
    desks: ['private-markets', 'digital-assets'],
    name: 'London FinTech delegation to Singapore',
    note: 'A week of meetings with the exchanges and custodians that operate under MAS.',
  },
  {
    month: '2024-10',
    desks: ['digital-assets'],
    name: 'ETHSofia, Sofia',
    note: 'Talk: macroeconomic drivers of crypto assets.',
  },
  { month: '2024-05', desks: ['digital-assets'], name: 'Consensus, Austin', note: 'Panel: de-risking DeFi.' },
]);

export const quotes = contentRecord('quotes', Quote, {
  fof: {
    desk: 'private-markets',
    text: 'Eunice turns our data rooms into structured reports fully aligned with our internal process.',
    who: 'Investment committee member, European fund-of-funds',
  },
  falconx: {
    desk: 'digital-assets',
    text: 'Speed without accountability isn’t an option in compliance. Eunice enables us to run faster, more rigorous token listing reviews — with the consistency to scale confidently across jurisdictions.',
    who: 'Vanessa Zhang, Global Chief Compliance Officer, FalconX',
  },
  zodia: {
    desk: 'digital-assets',
    text: 'Innovative solutions like Eunice AI support our mission to set new benchmarks for compliance, transparency and operational resilience in digital asset custody.',
    who: 'Risk & Compliance team, Zodia Custody',
  },
});

export const partners = content('partners', z.array(z.string().min(1)), [
  'Coinbase',
  'Copper',
  'Crypto.com',
  'Zodia Custody',
  'FalconX',
  'CMS',
  'gunnercooke',
]);

export const roles = content('roles', z.array(Role), [
  {
    id: 'gtm-da',
    slug: 'gtm-lead-digital-assets',
    title: 'GTM Lead, Digital Assets',
    where: 'London · remote-friendly',
    what: 'Own the exchange, custodian and market-maker pipeline. You have sold into a risk or compliance team before.',
    applyUrl: 'https://tally.so/r/VLdQOv',
  },
  {
    id: 'impl-pm',
    slug: 'client-implementation-consultant-private-markets',
    title: 'Client Implementation Consultant, Private Markets',
    where: 'London · remote-friendly',
    what: 'Sit with LPs and fund managers while Eunice reads their first dataroom. You have run diligence yourself.',
    applyUrl: 'https://tally.so/r/1Axdpb',
  },
  {
    id: 'eng',
    slug: 'software-ai-engineer',
    title: 'Senior Software / AI Engineer',
    where: 'London · remote-friendly',
    what: 'Your code ships into regulated financial workflows, where every output has to be defensible.',
    applyUrl: 'https://tally.so/r/PdBqJQ',
  },
]);
