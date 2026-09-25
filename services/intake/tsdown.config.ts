// The production build: our own TypeScript (this service and the workspace packages it
// uses) bundled into plain JavaScript; npm dependencies stay external and are installed
// in the image, so OpenTelemetry can instrument them as they load.
import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/main.ts', 'src/migrate.ts'],
  platform: 'node',
  target: 'node24',
  format: 'esm',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  dts: false,
  // Workspace packages are TypeScript source, so they are bundled; everything from npm is
  // left as an import and resolved from the image's node_modules.
  deps: {
    alwaysBundle: [/^@eunice\//],
    neverBundle: [/^(?!@eunice\/|\.|\/|node:)/],
  },
});
