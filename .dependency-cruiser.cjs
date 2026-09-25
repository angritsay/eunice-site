// Architecture rules, checked in CI. Each one is a claim in the docs made enforceable:
// if the code stops matching the diagram, the build fails rather than the diagram
// quietly going out of date.
//
// Services are hexagonal: domain/ (pure rules) ← application/ (use cases, ports)
// ← adapters/ (HTTP, Postgres, NATS, email) ← main.ts (wiring).
const IO_MODULES = [
  'fs',
  'fs/promises',
  'net',
  'http',
  'https',
  'http2',
  'tls',
  'dgram',
  'dns',
  'child_process',
  'worker_threads',
  'cluster',
];

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'Cycles make the dependency direction meaningless.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'not-to-unresolvable',
      comment: 'An import that resolves to nothing is a bug, and would silently exempt itself from every other rule.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: 'services-are-isolated',
      comment: 'A service never imports another service. They meet over HTTP or events, through packages/contracts.',
      severity: 'error',
      from: { path: '^services/([^/]+)/' },
      to: { path: '^services/', pathNot: '^services/$1/' },
    },
    {
      name: 'domain-imports-only-domain',
      comment:
        'The domain is the part that must stay true whatever the framework, database or broker. It depends on nothing outside itself except the standard library.',
      severity: 'error',
      from: { path: '^services/([^/]+)/src/domain/' },
      to: { pathNot: '^services/$1/src/domain/', dependencyTypesNot: ['core'] },
    },
    {
      name: 'domain-does-no-io',
      comment:
        'Pure means pure: no filesystem, network or processes in the domain. That is what makes it testable without a database.',
      severity: 'error',
      from: { path: '^services/[^/]+/src/domain/' },
      to: { dependencyTypes: ['core'], path: `^(node:)?(${IO_MODULES.join('|')})$` },
    },
    {
      name: 'application-does-not-know-adapters',
      comment:
        'Use cases depend on ports (interfaces) they own; adapters implement them. Wiring happens once, in main.ts.',
      severity: 'error',
      from: { path: '^services/([^/]+)/src/application/' },
      to: { path: '^services/$1/src/adapters/' },
    },
    {
      name: 'shared-packages-stay-shared',
      comment: 'packages/* are depended on, never depending on the apps and services that use them.',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^(apps|services)/' },
    },
    {
      name: 'contracts-are-a-leaf',
      comment: 'Contracts describe the wire format. They must not pull in runtime machinery from other packages.',
      severity: 'error',
      from: { path: '^packages/contracts/' },
      to: { path: '^packages/', pathNot: '^packages/contracts/' },
    },
    {
      name: 'web-does-not-import-services',
      comment: 'The site talks to services over HTTP only. It may share contracts, nothing else.',
      severity: 'error',
      from: { path: '^apps/' },
      to: { path: '^(services|packages/platform)/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|generated|node_modules|test-results|playwright-report)/' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      extensions: ['.ts', '.js', '.mjs', '.json'],
      conditionNames: ['import', 'node', 'default'],
    },
  },
};
