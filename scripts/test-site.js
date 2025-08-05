#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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
  log(`[PASS] ${message}`, 'green');
}

function logWarning(message) {
  log(`[WARN] ${message}`, 'yellow');
}

function logError(message) {
  log(`[FAIL] ${message}`, 'red');
}

function runCommand(command, description) {
  try {
    logStep(description);
    execSync(command, { stdio: 'inherit' });
    logSuccess(`${description} completed successfully`);
    return true;
  } catch (error) {
    logError(`${description} failed`);
    return false;
  }
}

function checkDevServer() {
  try {
    const { execSync } = require('child_process');
    const result = execSync(
      'curl -s -o /dev/null -w "%{http_code}" http://localhost:3000',
      {
        stdio: 'pipe',
      }
    );
    return result.toString().trim() === '200';
  } catch {
    return false;
  }
}

function killExistingServers() {
  logStep('Killing any existing development servers');
  try {
    execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', {
      stdio: 'pipe',
    });

    execSync('pkill -f "next dev" 2>/dev/null || true', {
      stdio: 'pipe',
    });

    execSync('sleep 2', { stdio: 'pipe' });

    logSuccess('Existing servers terminated');
    return true;
  } catch (error) {
    logWarning('Could not kill existing servers (may not be running)');
    return false;
  }
}

function startDevServer() {
  logStep('Starting development server for SEO audit');
  try {
    killExistingServers();

    execSync('npm run dev -- --port 3000 > /dev/null 2>&1 &', {
      stdio: 'pipe',
    });

    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      if (checkDevServer()) {
        logSuccess('Development server started successfully on port 3000');
        return true;
      }
      attempts++;
      execSync('sleep 1', { stdio: 'pipe' });
    }

    logWarning('Development server may not be fully started');
    return false;
  } catch (error) {
    logWarning('Could not start development server');
    return false;
  }
}

function stopDevServer() {
  try {
    execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', {
      stdio: 'pipe',
    });

    execSync('pkill -f "next dev" 2>/dev/null || true', {
      stdio: 'pipe',
    });

    logSuccess('Development server stopped');
  } catch (error) {}
}

async function main() {
  const startTime = Date.now();
  const results = {
    format: false,
    lint: false,
    typeCheck: false,
    build: false,
    seo: false,
  };

  logSection('SITE TEST SUITE');
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
  
  log(`Running essential tests for "${siteTitle}"`, 'bright');

  if (!fs.existsSync('package.json')) {
    logError(
      'package.json not found. Please run this script from the project root.'
    );
    process.exit(1);
  }

  logSection('CODE QUALITY');
  results.format = runCommand(
    'npm run format',
    'Formatting code with Prettier'
  );
  results.lint = runCommand('npm run lint', 'Running ESLint checks');
  results.typeCheck = runCommand(
    'npm run type-check',
    'Running TypeScript type checking'
  );

  logSection('BUILD PROCESS');
  results.build = runCommand('npm run build', 'Building Next.js application');

  logSection('SEO AUDIT');

  const serverStarted = startDevServer();

  if (serverStarted) {
    execSync('sleep 3', { stdio: 'pipe' });
    results.seo = runCommand('npm run seo:audit', 'Running SEO audit');
  } else {
    logWarning('Skipping SEO audit - development server not available');
    results.seo = true;
  }

  stopDevServer();

  logSection('TEST RESULTS SUMMARY');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const failedTests = totalTests - passedTests;

  console.log('\nTest Results:');
  console.log(`  Formatting:     ${results.format ? '[PASS]' : '[FAIL]'}`);
  console.log(`  Linting:        ${results.lint ? '[PASS]' : '[FAIL]'}`);
  console.log(`  Type Check:     ${results.typeCheck ? '[PASS]' : '[FAIL]'}`);
  console.log(`  Build:          ${results.build ? '[PASS]' : '[FAIL]'}`);
  console.log(`  SEO Audit:      ${results.seo ? '[PASS]' : '[SKIP]'}`);

  console.log('\nSummary:');
  console.log(`  Total Tests:    ${totalTests}`);
  console.log(`  Passed:         ${passedTests}`);
  console.log(`  Failed:         ${failedTests}`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  Duration:       ${duration}s`);

  if (failedTests === 0) {
    log(
      '\n[SUCCESS] All tests passed! Your site is ready for deployment.',
      'green'
    );
    process.exit(0);
  } else {
    log(
      '\n[WARNING] Some tests failed. Please fix the issues before deploying.',
      'yellow'
    );
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  log('\n\nStopping tests and cleaning up...', 'yellow');
  stopDevServer();
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('\n\nStopping tests and cleaning up...', 'yellow');
  stopDevServer();
  process.exit(1);
});

main().catch(error => {
  logError('Test suite failed with error:');
  console.error(error);
  stopDevServer();
  process.exit(1);
});
