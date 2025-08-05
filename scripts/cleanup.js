#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'bright');
  console.log('='.repeat(60));
}

function logStep(step) {
  log(`\n> ${step}`, 'cyan');
}

function logSuccess(message) {
  log(`[SUCCESS] ${message}`, 'green');
}

function logWarning(message) {
  log(`[WARNING] ${message}`, 'yellow');
}

function logError(message) {
  log(`[ERROR] ${message}`, 'red');
}

function cleanNextCache() {
  logStep('Cleaning Next.js cache');
  try {
    if (fs.existsSync('.next')) {
      execSync('rm -rf .next', { stdio: 'pipe' });
      logSuccess('Next.js cache cleaned');
    } else {
      logWarning('No .next directory found');
    }
  } catch (error) {
    logError('Failed to clean Next.js cache');
  }
}

function cleanNodeModules() {
  logStep('Cleaning node_modules (optional)');
  try {
    if (fs.existsSync('node_modules')) {
      const stats = fs.statSync('node_modules');
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
      logWarning(`node_modules size: ${sizeInMB} MB`);

      if (
        process.env.NODE_ENV === 'test' ||
        process.env.CI ||
        process.env.AUTOMATED
      ) {
        logWarning('Skipping node_modules cleanup in automated environment');
        return;
      }

      logWarning(
        'Consider running "rm -rf node_modules package-lock.json && npm install" if needed'
      );
    }
  } catch (error) {
    logError('Failed to clean node_modules');
  }
}

function cleanTemporaryFiles() {
  logStep('Cleaning temporary files');
  try {
    const tempFiles = [
      'lighthouse-report.json',
      '.DS_Store',
      '*.log',
      '*.tmp',
      '*.cache',
    ];

    tempFiles.forEach(pattern => {
      try {
        execSync(`find . -name "${pattern}" -type f -delete`, {
          stdio: 'pipe',
        });
      } catch (error) {}
    });

    logSuccess('Temporary files cleaned');
  } catch (error) {
    logError('Failed to clean temporary files');
  }
}

function optimizeImages() {
  logStep('Checking for image optimization opportunities');
  try {
    const publicDir = path.join(__dirname, '../public');
    if (fs.existsSync(publicDir)) {
      const files = fs.readdirSync(publicDir);
      const imageFiles = files.filter(file =>
        /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file)
      );

      if (imageFiles.length > 0) {
        logWarning(
          `Found ${imageFiles.length} image files in public directory`
        );
        logWarning('Consider optimizing images with tools like:');
        logWarning('- ImageOptim (macOS)');
        logWarning('- TinyPNG (online)');
        logWarning('- Squoosh (Google)');
      } else {
        logSuccess('No image files found in public directory');
      }
    }
  } catch (error) {
    logError('Failed to check images');
  }
}

function checkUnusedDependencies() {
  logStep('Checking for unused dependencies');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    logWarning(
      `Found ${dependencies.length} dependencies and ${devDependencies.length} devDependencies`
    );
    logWarning('Consider running "npm audit" to check for vulnerabilities');
    logWarning('Consider running "npx depcheck" to find unused dependencies');
  } catch (error) {
    logError('Failed to check dependencies');
  }
}

function runLinting() {
  logStep('Running linting and type checking');
  try {
    execSync('npm run lint', { stdio: 'inherit' });
    execSync('npm run type-check', { stdio: 'inherit' });
    logSuccess('Linting and type checking completed');
  } catch (error) {
    logError('Linting or type checking failed');
  }
}

async function main() {
  logSection('CODEBASE CLEANUP');
  // Get site title from config
  let siteTitle = 'OpenChapter';
  try {
    const configPath = path.join(process.cwd(), 'src/lib/config.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    const titleMatch = configContent.match(/title:\s*['"`]([^'"`]+)['"`]/);
    if (titleMatch) {
      siteTitle = titleMatch[1];
    }
  } catch (error) {
    // Use default if config can't be read
  }
  
  log(`Starting cleanup for "${siteTitle}"`, 'bright');

  if (!fs.existsSync('package.json')) {
    logError(
      'package.json not found. Please run this script from the project root.'
    );
    process.exit(1);
  }

  cleanNextCache();
  cleanTemporaryFiles();
  optimizeImages();
  checkUnusedDependencies();
  runLinting();

  cleanNodeModules();

  logSection('CLEANUP COMPLETE');
  log('Codebase cleanup completed successfully!', 'green');
  log('\nNext steps:');
  log('1. Run "npm run dev" to test the application');
  log('2. Run "npm run build" to ensure everything builds correctly');
  log('3. Run "npm run performance" to check performance metrics');
  log('4. Consider running "npm audit fix" to fix any vulnerabilities');
}

process.on('SIGINT', () => {
  log('\n\nCleanup interrupted by user', 'yellow');
  process.exit(1);
});

main().catch(error => {
  logError('Cleanup failed with error:');
  console.error(error);
  process.exit(1);
});
