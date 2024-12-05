import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['./dist/src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/bundle.js',
  external: [], // Bundle everything
});
