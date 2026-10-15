// All shared content. Edit here and every page that shows the item updates on the next build.
// Every value is checked against src/content/schema.ts when the site is built.
import { z } from 'zod';
import {
  AudiencePages,
  content,
  contentRecord,
  Desks,
  Event,
  Firm,
  Insight,
  Integration,
  Person,
  Quote,
  Role,
  TeamFacts,
} from './schema.ts';

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
//   quote      the client quote it shows, when not the desk's own (a key in `quotes` below)
export const audiencePages = content('audiencePages', AudiencePages, [
  {
    id: 'lps',
    desk: 'private-markets',
    nav: 'For LPs',
    card: {
      title: 'LPs and Asset Owners',
      text: 'Ten fund documents, one committee, and a question you have to answer by Thursday.',
    },
    title: 'Eunice for LPs and Asset Owners — Operational Due Diligence',
    description:
      'Every fund document read against the ODD checklist you already use, every finding cited to its page, and the same questions asked again each quarter.',
    h1: 'Diligence on Every Fund, Before the Committee Sits',
    lead: 'An agent does the messy work — chasing the data down and checking it is right. Investment and operational due diligence, then monitoring, against the checklist you already use.',
    now: [
      'Ten fund documents arrive, the committee date is fixed, and the answer you need is not in the summary.',
      'The same diligence runs again next quarter, and last quarter’s version is in somebody’s inbox.',
      'A finding without a page reference is a finding you have to verify yourself.',
    ],
    work: [
      {
        title: 'Your Checklist, Not Ours',
        text: 'Every PPM, DDQ, LPA, valuation policy and audited statement read against the ODD checklist your committee already signed off.',
      },
      {
        title: 'What Is Missing Is the Finding',
        text: 'The gap is the output, not a summary of what is present. Every finding cites the page it came from, so the committee can check it.',
      },
      {
        title: 'Asked Again Each Quarter',
        text: 'The same questions run across every fund you hold, as often as suits your cycle. What changed comes back as a diff.',
      },
    ],
    cta: {
      title: 'Talk to Us About the Fund You Are Reviewing Now',
      text: 'A thirty-minute call with the desk. Bring the fund; we show you what Eunice reads, what it returns and how the quarterly cycle runs.',
    },
  },
  {
    id: 'managers',
    desk: 'private-markets',
    nav: 'For Managers',
    card: { title: 'Fund Managers', text: 'The same ODD questionnaire, asked eleven ways, by eleven different LPs.' },
    title: 'Eunice for Fund Managers — Answer the Diligence Questionnaire Once',
    description:
      'The same ODD questionnaire arrives eleven ways from eleven LPs. Eunice reads your own documents once and answers from them, with the page attached.',
    h1: 'Answer the Same Questionnaire Once',
    lead: 'Eleven LPs, eleven formats, one set of facts. Eunice reads your own documents once and answers from them, so the version that goes out is the version you can stand behind.',
    now: [
      'The same question arrives in eleven shapes, and each one is answered from scratch.',
      'Two answers to the same question disagree, and nobody notices until an LP does.',
      'The people who know the answer are the people raising the next fund.',
    ],
    work: [
      {
        title: 'Read Your Side Once',
        text: 'Your fund documents, policies and statements read into one structure, so every answer comes from the same place.',
      },
      {
        title: 'Answer in the LP’s Format',
        text: 'The questionnaire in front of you filled from that structure, with the page each answer came from attached.',
      },
      {
        title: 'Stay True After the Raise',
        text: 'When a document changes, the answers that depended on it are flagged rather than quietly going stale.',
      },
    ],
    cta: {
      title: 'Bring Us the Questionnaire on Your Desk',
      text: 'Send the one you are answering this week. We will show you what Eunice fills from your own documents, and what it leaves for you.',
    },
  },
  {
    id: 'family-offices',
    desk: 'private-markets',
    nav: 'For Family Offices',
    card: { title: 'Family Offices', text: 'Enable you to do more with a lean team.' },
    title: 'Eunice for Family Offices — The Diligence of a Full Team',
    description:
      'Run the diligence of a full team, whatever the size of yours. Fewer people, the same rigour, better decisions.',
    h1: 'The Diligence of a Full Team, Whatever the Size of Yours',
    lead: 'Fewer people, the same rigour. The work that would need a diligence team runs against your checklist, and what comes back is a memo your principals can read.',
    now: [
      'The diligence that decides the allocation is done by the person who also runs everything else.',
      'A fund is passed on because there was no week to read it properly, not because it failed.',
      'What was checked last time lives in one person’s memory.',
    ],
    work: [
      {
        title: 'One Checklist, Held for You',
        text: 'Your standard written down once and applied to every fund, so the bar does not move with whoever is free that week.',
      },
      {
        title: 'The Reading Done for You',
        text: 'The dataroom read in full, with the findings and their page references in a memo your principals can take to a meeting.',
      },
      {
        title: 'A Record That Outlasts the Week',
        text: 'What was asked, what came back and what changed since, kept in one place rather than in an inbox.',
      },
    ],
    cta: {
      title: 'Put One Fund Through It',
      text: 'Pick a fund you are looking at now. We will run it and show you the memo, the findings and the page each one came from.',
    },
  },
  {
    id: 'exchanges',
    desk: 'digital-assets',
    nav: 'For Exchanges',
    card: { title: 'Exchanges', text: 'A listing queue that grows faster than the team reviewing it.' },
    title: 'Eunice for Exchanges — Listing Diligence Your Committee Signs Off On',
    description:
      'One report per token covering the team, the code, the reserve where there is one, and the jurisdiction, in the shape a listing committee already signs off on.',
    h1: 'A Listing Queue the Review Team Can Keep Up With',
    lead: 'One report per token — the team, the code, the reserve where there is one, and the jurisdiction — in the shape your listing committee already signs off on.',
    now: [
      'The queue grows faster than the team reviewing it, and the backlog is the product decision.',
      'Two analysts review the same token to two different standards.',
      'An asset cleared under one regime is cleared again from scratch under the next.',
    ],
    work: [
      {
        title: 'One Report per Token',
        text: 'Team, code, reserve where there is one, and jurisdiction in a single document, in the format the committee already reads.',
      },
      {
        title: 'The Same Standard Every Time',
        text: 'The review runs the same way whoever is on the desk, and every claim carries the source it came from.',
      },
      {
        title: 'Cleared Once, Across Regimes',
        text: 'MiCA, the UK regime, MAS and VARA in one view, so a cleared asset is not re-cleared from nothing.',
      },
    ],
    cta: {
      title: 'Put One Token Through It',
      text: 'Pick a token in your queue now. We will run it and show you the report and the monitoring feed side by side.',
    },
  },
  {
    id: 'custodians',
    desk: 'digital-assets',
    nav: 'For Custodians',
    quote: 'zodia',
    card: { title: 'Custodians', text: 'You hold the asset. You are the last to hear when something moves.' },
    title: 'Eunice for Custodians — Monitoring with the Source Attached',
    description:
      'Exploits, protocol changes, enforcement actions and reserve movements, surfaced the same day, with the source attached.',
    h1: 'Hear It from the Source, Not from a Client',
    lead: 'You hold the asset, so you should not be the last to know. Exploits, protocol changes, enforcement actions and reserve movements, surfaced the same day, with the source attached.',
    now: [
      'The first notice of an exploit is a client asking about it.',
      'The asset was reviewed at onboarding, and the review is as old as the relationship.',
      'An alert with no source behind it cannot be passed to a client.',
    ],
    work: [
      {
        title: 'Watched, Not Sampled',
        text: 'Every token you hold monitored continuously rather than revisited at review time.',
      },
      {
        title: 'The Day It Lands',
        text: 'Exploits, protocol changes, enforcement actions and reserve movements surfaced the same day, each with its source named.',
      },
      {
        title: 'Something You Can Forward',
        text: 'What reaches you is specific enough to act on and sourced well enough to send to a client.',
      },
    ],
    cta: {
      title: 'Point It at What You Hold',
      text: 'Give us a handful of the assets on your book. We will show you what the monitoring feed would have told you this quarter.',
    },
  },
  {
    id: 'market-makers',
    desk: 'digital-assets',
    nav: 'For Market Makers',
    quote: 'libeara',
    card: { title: 'Market Makers', text: 'Inventory in something whose disclosure changed this morning.' },
    title: 'Eunice for Market Makers — Know What Changed Before the Position Does',
    description:
      'Inventory in an asset whose disclosure changed this morning is a risk you can price, if you hear about it in time.',
    h1: 'Know What Changed Before the Position Does',
    lead: 'Inventory in an asset whose disclosure changed this morning is a risk you can price — as long as you hear about it in time, and with the source attached.',
    now: [
      'The disclosure changed at 09:00 and the position was still on at noon.',
      'The research that justified the inventory is a quarter old.',
      'Risk asks why the book holds it, and the answer is in a chat thread.',
    ],
    work: [
      {
        title: 'A View per Token',
        text: 'The team, the code, the reserve where there is one, and the jurisdiction in one place, so the reason for holding is written down.',
      },
      {
        title: 'Changes as They Land',
        text: 'Protocol changes, enforcement actions and reserve movements surfaced the same day, with the source named.',
      },
      {
        title: 'Defensible to Risk',
        text: 'Every claim cites where it came from, so the position has a record behind it rather than a recollection.',
      },
    ],
    cta: {
      title: 'Run It Against Your Book',
      text: 'Send us the assets you make markets in. We will show you what changed on them in the last quarter, and when we would have told you.',
    },
  },
  {
    id: 'issuers',
    desk: 'token-disclosure',
    nav: 'For Issuers',
    card: { title: 'Issuers', text: 'A white paper that has to be accepted once, and stay true after that.' },
    title: 'Eunice for Issuers — A MiCA White Paper Accepted Once',
    description:
      'From the team behind 30+ MiCA white papers filed through 4 NCAs: drafted, reviewed where a legal opinion is needed, notified to the authority and hosted where anyone can check it.',
    h1: 'A White Paper Accepted Once',
    lead: 'From the team behind 30+ MiCA white papers filed through 4 NCAs: drafted, reviewed where a legal opinion is needed, notified to the authority, and hosted on a page anyone can open.',
    now: [
      'The paper has to be right before it is filed, and there is no second first submission.',
      'Every exchange that might list the token asks for the same document a different way.',
      'A disclosure that was true at filing quietly stops being true.',
    ],
    work: [
      {
        title: 'Drafted by a Team That Files Them',
        text: 'A MiCA white paper drafted by the team behind 30+ papers filed through 4 NCAs, so the starting point has already been through this.',
      },
      {
        title: 'Reviewed Where It Counts',
        text: 'A law firm reviews the points that need a legal opinion, rather than a legal bill for the whole document.',
      },
      {
        title: 'Notified and Hosted',
        text: 'Notified to the authority and hosted on a public page, so there is one address for the version that stands.',
      },
    ],
    cta: {
      title: 'Start a White Paper',
      text: 'Tell us about the token and the jurisdiction. We will show you how the draft would come together and what would still need an opinion.',
    },
  },
  {
    id: 'counsel',
    desk: 'token-disclosure',
    nav: 'For Counsel',
    card: { title: 'Counsel', text: 'A draft that arrives in the shape the regime asks for.' },
    title: 'Eunice for Counsel — Review the Paper, Not the Boilerplate',
    description:
      'The draft arrives in the shape the regime asks for, so the hours go on the judgement calls rather than on assembling a document from nothing.',
    h1: 'Review the Paper, Not the Boilerplate',
    lead: 'The draft arrives already in the shape the regime asks for, so your hours go on the judgement calls rather than on assembling a document from nothing.',
    now: [
      'The first draft is a blank page, and the first week goes on structure.',
      'The same recitals are rewritten for every client, slightly differently each time.',
      'Classification is the hard part, and it is the part with the least time left.',
    ],
    work: [
      {
        title: 'Structure Already Settled',
        text: 'The draft follows the regime’s own shape, from the team behind 30+ papers filed through 4 NCAs, so review starts at the substance.',
      },
      {
        title: 'Opinions Where They Are Needed',
        text: 'A law firm reviews the points that need one. UK token classification runs with gunnercooke, since July 2026.',
      },
      {
        title: 'A Version You Can Point At',
        text: 'What was notified is hosted publicly, so advice given later refers to a document anyone can open.',
      },
    ],
    cta: {
      title: 'Put a Live Matter Through It',
      text: 'Bring a paper you are drafting now. We will show you what we would fill and what we would leave to you.',
    },
  },
  {
    id: 'exchanges',
    desk: 'token-disclosure',
    nav: 'For Exchanges',
    card: { title: 'Exchanges', text: 'Check what an issuer published, without asking them for it.' },
    title: 'Eunice for Exchanges — Check the Disclosure Yourself',
    description:
      'Every paper Eunice notifies is hosted on a public page, so a listing team can read what an issuer published without a request and a wait.',
    h1: 'Check the Disclosure Yourself',
    lead: 'Every paper Eunice notifies is hosted on a page anyone can open, so a listing team reads what the issuer published without sending a request and waiting on the answer.',
    now: [
      'The disclosure arrives as an attachment in a thread, and nobody is certain it is the current one.',
      'Confirming a filing means asking the issuer and waiting.',
      'The paper behind a listing decision is somewhere in an inbox.',
    ],
    work: [
      {
        title: 'One Public Address',
        text: 'A notified paper lives on a page anyone can open, so there is nothing to request and nothing to chase.',
      },
      {
        title: 'The Version That Stands',
        text: 'The hosted page carries the paper as it stands, so what a listing team reads is what is true today rather than an attachment from a thread.',
      },
      {
        title: 'Beside the Listing Report',
        text: 'The same desk produces the listing diligence report, so the disclosure and the review sit together.',
      },
    ],
    cta: {
      title: 'Look Up a Token You Are Reviewing',
      text: 'Name a token in your queue. We will show you what the register holds on it, and what the listing report adds.',
    },
  },
]);

// ---------- The fact base: the team and the company, in the owner's words ----------
// Every line below is quoted from the live careers page (eunice.ai/careers), recorded
// in src/content/sources/eunice-careers.txt, or, for people not on that page yet, from
// what the owner gave us, recorded in src/content/sources/owner-notes.md. Pages take
// their team copy from here and nowhere else, so the site says the same thing
// everywhere; test/web/facts.spec.ts fails if a line here is in neither source. Typography may differ (curly
// quotes, dashes, "·" for "-" between two parts); the words may not.
// To change a fact: change the live page, record it again, then change it here.

// Portrait: drop a square image into /src/assets/img/people/ and set `photo` to its file name.
export const people = contentRecord('people', Person, {
  yi: {
    name: 'Yi Luo',
    role: 'CEO · Finance / 2x founder',
    facts: [
      'Founded FreeUp, a Fintech acquired by Earnd',
      'Scaled teams across the US and UK',
      'Former VC with 40+ Fintech investments',
    ],
    photo: 'yi.webp',
    linkedin: 'https://www.linkedin.com/in/loriluoyi/',
  },
  philip: {
    name: 'Philip Lam',
    role: 'CTO · Product / Engineering / 3x founder',
    facts: [
      'Co-Founder at NEX · US-based AI startup, raised $40M',
      'VP Eng at Goodnotes (30M MAU), built & led a team of 200 engineers',
      'Ex-Apple & Microsoft',
    ],
    photo: 'philip.webp',
    linkedin: 'https://www.linkedin.com/in/philip-lam-92172a24/',
  },
  petronela: {
    name: 'Petronela Pell',
    role: 'Head of Private Markets',
    facts: [
      'Previously Schroders Capital, T. Rowe Price, Aberdeen and Investec',
      '15+ years financial services experience',
    ],
    photo: 'petronela.webp',
    linkedin: 'https://www.linkedin.com/in/petronela-pell-mba-490aa33/',
  },
  vinay: {
    name: 'Vinay Manektalla',
    role: 'Head of Engineering',
    facts: [
      '9+ years in software engineering & tech leadership',
      'Ex-Deutsche Bank — Equities Algorithmic Trading',
      'Ex-BMAT — led Audiovisual Engineering dept',
    ],
    photo: 'vinay.webp',
    linkedin: 'https://www.linkedin.com/in/vinay-manektalla/',
  },
  chrislyn: {
    name: 'Chrislyn Pereira',
    role: 'Chief of Staff',
    facts: ['UK FinTech Awards Young Achiever of the Year 2026', 'Legal background and ex Head of Ops at Legit'],
    photo: 'chrislyn.webp',
    linkedin: 'https://www.linkedin.com/in/chrislyn-pereira/',
  },
  // Not on the live careers page yet: from the owner (sources/owner-notes.md).
  ana: {
    name: 'Ana Beslija',
    role: 'Operations Lead',
    facts: ['Ontario-Qualified Lawyer', 'CIPP/E'],
    photo: 'ana.webp',
    linkedin: 'https://www.linkedin.com/in/ana-beslija/',
  },
  riley: {
    name: 'Riley Lee',
    role: 'Developer',
    facts: [],
    photo: 'riley.webp',
    linkedin: 'https://www.linkedin.com/in/rileylyw/',
  },
  kelvin: {
    name: 'Kelvin Wong',
    role: 'Senior AI Engineer',
    facts: [],
    photo: 'kelvin.webp',
    linkedin: 'https://www.linkedin.com/in/wl-kelvin-wong/',
  },
  vijay: {
    name: 'Vijay Sundar',
    role: 'Due Diligence Analyst',
    facts: [],
    photo: 'vijay.webp',
    linkedin: 'https://www.linkedin.com/in/vijay-s-b3694018b/',
  },
  anastasia: {
    name: 'Anastasia Gritsai',
    role: 'Design',
    facts: [],
    photo: 'anastasia.webp',
    linkedin: 'https://www.linkedin.com/in/gritsay-design/',
  },
});

// One team across company and product pages; founders first.
export const teamPeople = [
  'yi',
  'philip',
  'petronela',
  'vinay',
  'chrislyn',
  'ana',
  'riley',
  'kelvin',
  'vijay',
  'anastasia',
] as const;

export const team = content('team', TeamFacts, {
  headline: 'We Build the Accountability Layer Between AI and High-Stakes Decisions',
  standfirst:
    'A team of AI pioneers, domain experts, and founders building due diligence infrastructure for regulated financial markets',
  intro: 'A team of AI pioneers, domain experts and founders shaping the future of private markets.',
  storyTitle: 'A Company Built on Accountability',
  founded: 'Founded in 2023 · headquartered in London',
  story: [
    'Generative AI swept into financial workflows — and institutions struggled to use it for anything that mattered. The problem wasn’t capability. It was accountability.',
    'In our world, an answer isn’t “good” because it sounds plausible — it’s good when it can be defended in front of a regulator, a board, or a client.',
    'So we built Eunice: AI for monitoring in regulated finance, engineered for decisions that cannot afford to be wrong. Today serving institutions, funds, issuers, and regulators across the US, EU, UK and Singapore.',
  ],
  hiring: 'We’re always ready to hear from smart, curious, and ambitious people who share our mission and vision.',
  perksTitle: 'A Real Problem. A Real Team. Real Impact for Getting It Right',
  perks: [
    {
      title: 'Work on AI That Matters',
      text: 'Your code ships into regulated financial workflows — where every output has to be defensible. No demo theatre.',
    },
    {
      title: 'London-Based, Remote-Friendly',
      text: 'Work where you do your best work. Regular team gatherings in London to keep the in-person muscle strong.',
    },
    {
      title: 'Generous Time Off + Flexibility',
      text: 'We trust you to manage your time. Take the breaks you need to do the best work of your career.',
    },
    {
      title: 'Competitive Comp + Meaningful Equity',
      text: 'Top-of-market salary and material equity for the stage. We share the upside of building the category.',
    },
    {
      title: 'Learn from People Who’ve Shipped This Before',
      text: 'Founders with backgrounds in compliance, capital markets law, and ML research. You’ll be in rooms that matter.',
    },
    {
      title: 'Health Plan, Learning Budget & Equipment',
      text: 'SimplyHealth plan, a dedicated learning budget, the equipment to do your best work from anywhere — and bubble tea on the house.',
    },
  ],
});

// The strip that runs along the top of every page. Empty: no strip. Add a name and a
// logo file under assets/img/logos/, from the company's own brand assets.
export const integrations = content('integrations', z.array(Integration), []);

// type: 'Article' | 'Note' | 'Video' | 'Press'. Newest first is not required; pages sort by date.
// url: where the piece lives today. Empty = not linked yet.
export const insights = content('insights', z.array(Insight), [
  // From Eunice's own LinkedIn posts (read 29 Sep 2026); the dates are the posts' own.
  {
    date: '2026-09-16',
    desk: 'company',
    type: 'Note',
    title: 'Our London office has moved to St Paul’s',
    standfirst:
      'We’re now right by St Paul’s, in the heart of the City of London, a short walk from many of the institutions we work with.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7505930300691058688/',
  },
  {
    date: '2026-08-25',
    desk: 'digital-assets',
    type: 'Press',
    title: 'One year with Libeara, now supporting over US$1 billion in regulated digital assets',
    standfirst:
      'Eunice provides the diligence and monitoring layer beneath Libeara’s tokenisation infrastructure: visibility into risk events, annual asset reviews and the governance to scale with confidence.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7497940854154637312/',
  },
  {
    date: '2026-08-04',
    desk: 'digital-assets',
    type: 'Press',
    title: 'Eunice and Orrick partner on token classification in the US',
    standfirst:
      'Structured compliance triage from Eunice, with expert counsel from Orrick available when the call needs a formal legal opinion.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7490398659810062336/',
  },
  {
    date: '2026-07-28',
    desk: 'digital-assets',
    type: 'Press',
    title: 'Eunice and Drew & Napier partner on token classification in Singapore',
    standfirst:
      'Structured compliance triage from Eunice, backed by a leading law firm’s formal opinion when you need one to rely on.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7487786497375449088/',
  },
  {
    date: '2026-07-23',
    desk: 'token-disclosure',
    type: 'Video',
    featured: true,
    title: 'Preparing for the new UK crypto regime: getting ahead on A&D and MARC',
    post: 'preparing-for-the-new-uk-crypto-regime-getting-ahead-on-a-d-and-marc',
    standfirst:
      'A session on the UK’s incoming regime for crypto-asset activities and disclosure, and what an issuer or an exchange should have ready before it lands.',
  },
  {
    date: '2026-07-21',
    desk: 'token-disclosure',
    type: 'Press',
    title: 'Eunice and gunnercooke partner to make UK token classification clearer',
    post: 'eunice-and-gunnercooke-partner-to-make-uk-token-classification-clearer',
  },
  {
    date: '2026-06-16',
    desk: 'company',
    type: 'Press',
    featured: true,
    title: 'Eunice is part of the London FinTech delegation to Singapore',
    post: 'eunice-is-part-of-the-london-fintech-delegation-to-singapore',
    standfirst: 'A week with the London delegation, meeting the exchanges and custodians that operate under MAS.',
  },
  {
    date: '2026-05-06',
    desk: 'company',
    type: 'Press',
    title: 'Eunice makes the Fintech 50',
    post: 'eunice-makes-the-fintech-50',
    standfirst: 'TechRound ranked Eunice #43 among the 50 most promising fintech companies of 2026.',
  },
  {
    date: '2026-03-27',
    desk: 'company',
    type: 'Press',
    title: 'Eunice raises $8m to replace manual due diligence with institutional-grade AI infrastructure',
    post: 'eunice-raises-8m-to-replace-manual-due-diligence',
    standfirst:
      'Seed funding from Moonfire, Speedinvest, Openspace Capital and Locus Ventures, as we expand into private markets.',
  },
  {
    date: '2025-12-02',
    desk: 'token-disclosure',
    type: 'Article',
    title: 'ESMA publishes consolidated statement on MiCA technical standards',
    post: 'esma-consolidated-statement-on-mica-technical-standards',
  },
  {
    date: '2025-11-28',
    desk: 'token-disclosure',
    type: 'Article',
    title: 'Eunice accepted into the FCA regulatory sandbox to advance digital asset disclosure standards',
    post: 'eunice-accepted-into-fca-regulatory-sandbox',
  },
  {
    date: '2025-11-17',
    desk: 'digital-assets',
    type: 'Article',
    featured: true,
    title: 'Anatomy of a “legacy code” exploit: the $100M Balancer V2 failure',
    post: 'balancer-v2-failure',
    standfirst:
      'How an old contract, still live, became the largest failure of the year — and what monitoring should have flagged.',
  },
  {
    date: '2025-04-03',
    desk: 'company',
    type: 'Video',
    title: 'Unveiling Eunice: bridging gaps in crypto and AI-powered risk monitoring',
    post: 'unveiling-eunice-bridging-gaps-in-crypto-transparency-ai-powered-risk-monitoring',
  },
  {
    date: '2025-03-12',
    desk: 'token-disclosure',
    type: 'Article',
    title: 'Cryptoasset classification under MiCA and other regimes',
    post: 'cryptoasset-classification-under-mica-other-regimes',
  },
  {
    date: '2024-10-16',
    desk: 'digital-assets',
    type: 'Video',
    featured: true,
    title: 'Macroeconomic drivers of crypto assets (ETHSofia 2024)',
    post: 'macroeconomic-drivers-of-cryptoassets-ethsofia',
    standfirst: 'A talk on rates, liquidity and the correlations that actually hold.',
  },
  {
    date: '2024-10-10',
    desk: 'digital-assets',
    type: 'Article',
    featured: true,
    title: 'What is the role of risk management in cryptoassets?',
    post: 'what-is-the-role-of-risk-management-in-cryptoassets',
    standfirst: 'Risk management as a function, not a dashboard. What a listing committee should own.',
  },
  {
    date: '2024-05-31',
    desk: 'digital-assets',
    type: 'Video',
    title: 'De-risking DeFi (Consensus 2024)',
    post: 'derisking-defi-consensus',
  },
  {
    date: '2024-04-21',
    desk: 'digital-assets',
    type: 'Article',
    title: 'Eunice — Moody’s for tokens',
    post: 'eunice-moodys-for-tokens',
  },
]);

// month: 'YYYY-MM'. desks: which product pages list it (the home page lists every past event).
// The 2026 entries from July on are from Eunice's own LinkedIn posts (read 29 Sep 2026).
export const events = content('events', z.array(Event), [
  {
    month: '2026-10',
    desks: ['private-markets'],
    name: 'Grow London Germany Trade Mission',
    note: 'Petronela Pell attending a week of meetings with local institutional clients & prospects.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7500881398849789952/',
  },
  {
    month: '2026-09',
    desks: ['private-markets', 'digital-assets'],
    name: 'Grow London Global, with the Mayor of London',
    note: 'Yi Luo met Sadiq Khan as a founder in the Grow London Global cohort.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7503376005059764226/',
  },
  {
    month: '2026-08',
    desks: ['digital-assets'],
    name: 'FCA Regulatory Sandbox, testing completed',
    note: 'Standardised digital asset disclosure templates, tested with Kraken, Coinbase and Crypto.com, with support from CMS and Aon.',
    url: 'https://www.linkedin.com/feed/update/urn:li:activity:7495845039776980992/',
  },
  {
    month: '2026-07',
    desks: ['digital-assets'],
    name: 'Webinar: the new UK crypto regime',
    note: 'Admissions & Disclosures and market abuse, from consultation to final rules, with Zodia Custody and CryptoUK; Chrislyn Pereira speaking.',
    post: 'preparing-for-the-new-uk-crypto-regime-getting-ahead-on-a-d-and-marc',
  },
  {
    month: '2026-06',
    desks: ['private-markets', 'digital-assets'],
    name: 'London FinTech delegation to Singapore',
    note: 'A week of meetings with the exchanges and custodians that operate under MAS.',
    post: 'eunice-is-part-of-the-london-fintech-delegation-to-singapore',
  },
  {
    month: '2024-10',
    desks: ['digital-assets'],
    name: 'ETHSofia, Sofia · Talk',
    note: 'Macroeconomic drivers of crypto assets.',
    post: 'macroeconomic-drivers-of-cryptoassets-ethsofia',
  },
  {
    month: '2024-05',
    desks: ['digital-assets'],
    name: 'Consensus, Austin · Panel',
    note: 'De-risking DeFi.',
    post: 'derisking-defi-consensus',
  },
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
  // From Eunice's LinkedIn post on a year with Libeara (25 Aug 2026).
  libeara: {
    desk: 'digital-assets',
    text: 'Scaling tokenised infrastructure requires resilient building blocks. Eunice supports the initial assessments and ongoing monitoring of blockchain networks and cryptoasset tokens, giving our teams the insights needed to move fast and scale responsibly.',
    who: 'Henry Loh, CA, FRM, Chief Risk Officer, Libeara',
  },
});

// Two rows of logos, "Clients" and "Partners". Each file is the firm's own mark: from
// its website header or logo file (Copper, Crypto.com, Zodia Custody, FalconX, Kraken,
// Libeara, Zero Hash, Flowdesk, CMS, gunnercooke, Drew & Napier, Orrick, Cahill), for
// Coinbase, whose site blocks automated visits, the public-domain wordmark on Wikimedia
// Commons, and for the IA, CCRI, CryptoUK and Grow London, traced from the logo files
// the team supplied (October 2026). Shown in one grey, so none outshouts the others.
//
// "Clients": clients and the exchanges, custodians and market makers Eunice works
// alongside, in the order of the team's slide (October 2026). Stripe and OKX wait for the
// firms' permission; Blockchain.com and VALR publish no logo file to take from.
export const clients = content('clients', z.array(Firm), [
  { name: 'Kraken', logo: 'kraken.svg', height: 16 },
  { name: 'Crypto.com', logo: 'crypto-com.svg', height: 22 },
  { name: 'Zodia Custody', logo: 'zodia-custody.svg', height: 30 },
  { name: 'Copper', logo: 'copper.svg', height: 24 },
  { name: 'Libeara', logo: 'libeara.svg', height: 18 },
  { name: 'Coinbase', logo: 'coinbase.svg', height: 20 },
  { name: 'Zero Hash', logo: 'zero-hash.svg', height: 24 },
  { name: 'FalconX', logo: 'falconx.svg', height: 16 },
  { name: 'Flowdesk', logo: 'flowdesk.svg', height: 18 },
]);

// "Partners": the law firms Eunice works with on token classification and disclosure, then
// the industry bodies and programmes it belongs to.
export const partners = content('partners', z.array(Firm), [
  { name: 'gunnercooke', logo: 'gunnercooke.svg', height: 22 },
  { name: 'CMS', logo: 'cms.svg', height: 30 },
  { name: 'Drew & Napier', logo: 'drew-napier.svg', height: 20 },
  { name: 'Orrick', logo: 'orrick.svg', height: 34 },
  { name: 'Cahill', logo: 'cahill.svg', height: 18 },
  { name: 'The Investment Association, Fintech member', logo: 'ia-fintech.svg', height: 30 },
  { name: 'CCRI', logo: 'ccri.svg', height: 22 },
  { name: 'CryptoUK', logo: 'cryptouk.svg', height: 18 },
  { name: 'Grow London', logo: 'grow-london.svg', height: 28 },
]);

// "Backed by leading institutions and individuals": the investors, in Yi's order (October
// 2026), traced from the logo files she supplied, sized so the four look equally heavy. The scout and angel programmes are
// named in words only, at her request: their logos are not ours to show.
export const investors = content('investors', z.array(Firm), [
  { name: 'Moonfire', logo: 'moonfire.svg', height: 23 },
  { name: 'Speedinvest', logo: 'speedinvest.svg', height: 28 },
  { name: 'Openspace Capital', logo: 'openspace.svg', height: 40 },
  { name: 'Tiny Supercomputer Investment Company', logo: 'tsic.svg', height: 24 },
]);
export const alsoBackedBy = content('alsoBackedBy', z.array(z.string().min(1)), [
  'Sequoia Scout',
  'Accel Scout',
  'Atomico Angel Programme',
]);

export const roles = content('roles', z.array(Role), [
  {
    id: 'gtm-da',
    slug: 'gtm-lead-digital-assets',
    title: 'GTM Lead, Digital Assets',
    where: 'London (Hybrid - 2 days/week) or Remote',
    what: 'Own the exchange, custodian and market-maker pipeline. You have sold into a risk or compliance team before.',
    applyUrl: 'https://tally.so/r/VLdQOv',
  },
  {
    id: 'impl-pm',
    slug: 'client-implementation-consultant-private-markets',
    title: 'Client Implementation Consultant, Private Markets',
    where: 'London (Hybrid - 2 days/week) or Remote',
    what: 'Sit with LPs and fund managers while Eunice reads their first dataroom. You have run diligence yourself.',
    applyUrl: 'https://tally.so/r/1Axdpb',
  },
  {
    id: 'eng',
    slug: 'software-ai-engineer',
    title: 'Senior Software / AI Engineer',
    where: 'Greater London, England, United Kingdom',
    what: 'Your code ships into regulated financial workflows, where every output has to be defensible.',
    applyUrl: 'https://tally.so/r/PdBqJQ',
  },
]);
