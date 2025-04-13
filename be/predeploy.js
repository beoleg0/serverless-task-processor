const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("🚀 Preparing deployment packages...");

// Clean previous build artifacts
console.log("🧹 Cleaning previous builds...");
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
if (fs.existsSync('layer')) {
  fs.rmSync('layer', { recursive: true, force: true });
}

// Create layer structure and install dependencies
console.log("📦 Creating Lambda layer...");
fs.mkdirSync(path.join('layer', 'nodejs'), { recursive: true });
fs.copyFileSync('package.json', path.join('layer', 'nodejs', 'package.json'));

// Change directory, install dependencies, and change back
const currentDir = process.cwd();
process.chdir(path.join('layer', 'nodejs'));
console.log("📥 Installing production dependencies in layer...");
execSync('npm install --production', { stdio: 'inherit' });
process.chdir(currentDir);

console.log("✅ Lambda layer created successfully!");

// Run esbuild to bundle Lambda functions
console.log("🔨 Building Lambda functions with esbuild...");
execSync('node esbuild.js', { stdio: 'inherit' });

console.log("🎉 Build completed successfully!");
console.log("Run 'sam deploy' to deploy your application.");
