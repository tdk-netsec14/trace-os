// Bundles the VS Code extension entry point and bundled webview React app.
const esbuild = require('esbuild');

const isWatch = process.argv.includes('--watch');

async function build() {
  const extensionConfig = {
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node18',
    external: ['vscode'],
    sourcemap: true,
    logLevel: 'info',
    entryPoints: ['src/extension.ts'],
    outfile: 'out/extension.js'
  };

  const webviewConfig = {
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: 'es2020',
    entryPoints: ['src/webview/App.tsx'],
    outfile: 'out/webview.js',
    sourcemap: true,
    logLevel: 'info'
  };

  if (isWatch) {
    const extensionContext = await esbuild.context(extensionConfig);
    const webviewContext = await esbuild.context(webviewConfig);
    await Promise.all([extensionContext.watch(), webviewContext.watch()]);
    return;
  }

  await Promise.all([esbuild.build(extensionConfig), esbuild.build(webviewConfig)]);
}

build().catch((error) => {
  console.error(error);
  process.exit(1);
});
