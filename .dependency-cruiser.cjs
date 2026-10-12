// Architecture rules, checked in CI. Each one is a claim in the docs made enforceable:
// if the code stops matching the diagram, the build fails rather than the diagram
// quietly going out of date.

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
      name: 'shared-packages-stay-shared',
      comment: 'packages/* are depended on, never depending on the apps that use them.',
      severity: 'error',
      from: { path: '^packages/' },
      to: { path: '^apps/' },
    },
    {
      name: 'contracts-are-a-leaf',
      comment: 'The form registry is a leaf: it must not pull in anything from other packages.',
      severity: 'error',
      from: { path: '^packages/contracts/' },
      to: { path: '^packages/', pathNot: '^packages/contracts/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(dist|generated|node_modules|test-results|playwright-report)/' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      extensions: ['.ts', '.js', '.mjs', '.json'],
      conditionNames: ['import', 'node', 'default'],
      // Workspace packages expose entry points through package.json exports.
      exportsFields: ['exports'],
      mainFields: ['module', 'main'],
    },
  },
};
