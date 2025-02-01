const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const isDev = process.env.NODE_ENV !== 'production';

async function startDevServer() {
  const ctx = await esbuild.context({
    entryPoints: ['dev-server.mts'],
    bundle: true,
    platform: 'node',
    outfile: 'dist/server.js',
    sourcemap: true,
    plugins: [nodeExternalsPlugin()],
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    }
  });

  // Enable watch mode and live reload
  await ctx.watch();

  // Start the dev server
  const { default: child_process } = await import('child_process');
  let child;

  function startServer() {
    if (child) child.kill();
    child = child_process.spawn('node', ['dist/server.js'], {
      stdio: 'inherit'
    });
  }

  // Initial build
  await ctx.rebuild().then(() => {
    console.log('🚀 Build complete, starting server...');
    startServer();
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    ctx.dispose();
    if (child) child.kill();
    process.exit(0);
  });
}

startDevServer().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
}); 