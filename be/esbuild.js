const {build} = require('esbuild');
const fs = require('fs');
const path = require('path');

// Define Lambda entry points
const entryPoints = [
  // API functions
  'src/functions/api/createTask.ts',
  'src/functions/api/getTasks.ts',

  // Processing functions
  'src/functions/processing/processTask.ts',
  'src/functions/processing/dlqProcessor.ts',

  // WebSocket functions
  'src/functions/websocket/connect.ts',
  'src/functions/websocket/default.ts',
  'src/functions/websocket/disconnect.ts',
  'src/functions/websocket/notifier.ts'
];

// Create output directory
const outBaseDir = 'dist';
fs.rmSync(outBaseDir, {recursive: true, force: true});
fs.mkdirSync(outBaseDir, {recursive: true});

// Process each entry point
async function buildAll() {
  console.log('Building Lambda functions...');

  for (const entryPoint of entryPoints) {
    const fileName = path.basename(entryPoint, '.ts');
    const dirName = path.dirname(entryPoint).replace('src/', '');

    // Create output directory structure
    const outDir = path.join(outBaseDir, dirName);
    fs.mkdirSync(outDir, {recursive: true});

    try {
      await build({
        entryPoints: [entryPoint],
        bundle: true,
        minify: false,
        sourcemap: true,
        platform: 'node',
        target: 'node20',
        outfile: path.join(outDir, `${fileName}.js`),
        // Define path aliases for @services
        alias: {
          '@common': path.resolve(__dirname, 'src/common'),
          '@functions': path.resolve(__dirname, 'src/functions'),
          '@services': path.resolve(__dirname, 'src/services'),
        },
        // External packages that are already in Lambda environment
        external: ['aws-lambda'],
        // Include all dependencies in bundle
        metafile: true,
        // Log build info
        logLevel: 'info'
      });

      console.log(`✅ Built ${fileName}`);
    } catch (error) {
      console.error(`❌ Error building ${fileName}:`, error);
      process.exit(1);
    }
  }

  console.log('All functions built successfully!');
}

buildAll();
