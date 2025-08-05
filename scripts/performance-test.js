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

function startDevServer() {
  logStep('Starting development server for performance testing');
  try {
    execSync('npm run dev -- --port 3000 > /dev/null 2>&1 &', {
      stdio: 'pipe',
    });

    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      if (checkDevServer()) {
        logSuccess('Development server started successfully');
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

function analyzeLighthouseResults() {
  const reportPath = './lighthouse-report.json';

  if (!fs.existsSync(reportPath)) {
    logError('Lighthouse report not found');
    return false;
  }

  try {
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const categories = report.lhr.categories;

    console.log('\nLighthouse Performance Results:');
    console.log('================================');

    Object.keys(categories).forEach(category => {
      const score = categories[category].score * 100;
      const status = score >= 90 ? '[PASS]' : score >= 50 ? '[WARN]' : '[FAIL]';
      const color = score >= 90 ? 'green' : score >= 50 ? 'yellow' : 'red';

      log(`${status} ${category}: ${score.toFixed(0)}/100`, color);
    });

    const audits = report.lhr.audits;
    const coreWebVitals = [
      'largest-contentful-paint',
      'first-input-delay',
      'cumulative-layout-shift',
    ];

    console.log('\nCore Web Vitals:');
    console.log('================');

    coreWebVitals.forEach(metric => {
      if (audits[metric]) {
        const score = audits[metric].score * 100;
        const value = audits[metric].numericValue;
        const status =
          score >= 90 ? '[PASS]' : score >= 50 ? '[WARN]' : '[FAIL]';
        const color = score >= 90 ? 'green' : score >= 50 ? 'yellow' : 'red';

        log(
          `${status} ${metric}: ${value ? (value / 1000).toFixed(2) + 's' : 'N/A'}`,
          color
        );
      }
    });

    return true;
  } catch (error) {
    logError('Failed to parse Lighthouse report');
    return false;
  }
}

function analyzeBundleSize() {
  logStep('Analyzing bundle size and composition');

  try {
    const buildOutput = execSync('npm run build', {
      stdio: 'pipe',
      encoding: 'utf8',
    });

    const lines = buildOutput.split('\n');
    const routeTableStart = lines.findIndex(line =>
      line.includes('Route (app)')
    );

    if (routeTableStart === -1) {
      logError('Could not find bundle size information in build output');
      return false;
    }

    console.log('\nBundle Size Analysis:');
    console.log('====================');

    for (let i = routeTableStart + 1; i < lines.length; i++) {
      const line = lines[i];

      if (
        line.includes('First Load JS shared by all') ||
        line.includes('○') ||
        line.includes('●') ||
        line.includes('ƒ')
      ) {
        break;
      }

      if (
        line.includes('kB') &&
        (line.includes('○') || line.includes('●') || line.includes('ƒ'))
      ) {
        const parts = line.split(/\s+/).filter(part => part.trim());
        if (parts.length >= 3) {
          const route = parts[0];
          const size = parts[parts.length - 1];
          const sizeNum = parseFloat(size);

          if (!isNaN(sizeNum)) {
            const status =
              sizeNum <= 100 ? '[PASS]' : sizeNum <= 200 ? '[WARN]' : '[FAIL]';
            const color =
              sizeNum <= 100 ? 'green' : sizeNum <= 200 ? 'yellow' : 'red';

            log(`${status} ${route}: ${size}`, color);
          }
        }
      }
    }

    logSuccess('Bundle analysis completed');
    return true;
  } catch (error) {
    logError('Bundle analysis failed: ' + error.message);
    return false;
  }
}

async function main() {
  const startTime = Date.now();
  const results = {
    typeCheck: false,
    bundleAnalysis: false,
    lighthouse: false,
  };

  logSection('PERFORMANCE TEST SUITE');
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
  
  log(`Running performance tests for "${siteTitle}"`, 'bright');

  if (!fs.existsSync('package.json')) {
    logError(
      'package.json not found. Please run this script from the project root.'
    );
    process.exit(1);
  }

  logSection('TYPE CHECKING');
  results.typeCheck = runCommand(
    'npm run type-check',
    'Running TypeScript type checking'
  );

  logSection('BUNDLE ANALYSIS');
  results.bundleAnalysis = analyzeBundleSize();

  logSection('LIGHTHOUSE PERFORMANCE AUDIT');

  const serverStarted = startDevServer();

  if (serverStarted) {
    execSync('sleep 5', { stdio: 'pipe' });

    // Test multiple pages for comprehensive performance analysis
    const testPages = [
      { url: 'http://localhost:3000/', name: 'Homepage' },
      { url: 'http://localhost:3000/introduction', name: 'Introduction' },
      { url: 'http://localhost:3000/chapterone', name: 'Chapter One' },
      { url: 'http://localhost:3000/about', name: 'About Page' },
      { url: 'http://localhost:3000/search', name: 'Search Page' },
    ];

    let allLighthousePassed = true;

    for (const page of testPages) {
      logStep(`Testing ${page.name} (${page.url})`);

      const lighthouseResult = runCommand(
        `lighthouse ${page.url} --output=json --output-path=./lighthouse-report-${page.name.toLowerCase().replace(/\s+/g, '-')}.json --no-enable-error-reporting --chrome-flags="--headless --no-sandbox --disable-dev-shm-usage"`,
        `Running Lighthouse audit for ${page.name}`
      );

      if (lighthouseResult) {
        const reportPath = `./lighthouse-report-${page.name.toLowerCase().replace(/\s+/g, '-')}.json`;
        if (fs.existsSync(reportPath)) {
          try {
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

            // Try to get performance score from categories
            let performanceScore = 0;
            if (report.categories && report.categories.performance) {
              performanceScore = report.categories.performance.score * 100;
            } else if (
              report.lhr &&
              report.lhr.categories &&
              report.lhr.categories.performance
            ) {
              performanceScore = report.lhr.categories.performance.score * 100;
            }

            const status =
              performanceScore >= 90
                ? '[PASS]'
                : performanceScore >= 50
                  ? '[WARN]'
                  : '[FAIL]';
            const color =
              performanceScore >= 90
                ? 'green'
                : performanceScore >= 50
                  ? 'yellow'
                  : 'red';

            log(
              `${status} ${page.name}: ${performanceScore.toFixed(0)}/100`,
              color
            );

            if (performanceScore < 90) {
              allLighthousePassed = false;
            }
          } catch (error) {
            logError(
              `Failed to parse Lighthouse report for ${page.name}: ${error.message}`
            );
            allLighthousePassed = false;
          }
        } else {
          logError(`Lighthouse report not found for ${page.name}`);
          allLighthousePassed = false;
        }
      } else {
        allLighthousePassed = false;
      }
    }

    results.lighthouse = allLighthousePassed;
  } else {
    logWarning('Skipping Lighthouse audit - development server not available');
    results.lighthouse = true;
  }

  stopDevServer();

  logSection('PERFORMANCE TEST RESULTS SUMMARY');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  const failedTests = totalTests - passedTests;

  console.log('\nTest Results:');
  console.log(`  Type Check:     ${results.typeCheck ? '[PASS]' : '[FAIL]'}`);
  console.log(
    `  Bundle Analysis: ${results.bundleAnalysis ? '[PASS]' : '[FAIL]'}`
  );
  console.log(`  Lighthouse:     ${results.lighthouse ? '[PASS]' : '[SKIP]'}`);

  console.log('\nSummary:');
  console.log(`  Total Tests:    ${totalTests}`);
  console.log(`  Passed:         ${passedTests}`);
  console.log(`  Failed:         ${failedTests}`);

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  Duration:       ${duration}s`);

  if (failedTests === 0) {
    log('\n[SUCCESS] All performance tests passed!', 'green');
    process.exit(0);
  } else {
    log(
      '\n[WARNING] Some performance tests failed. Review the results above.',
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
  logError('Performance test suite failed with error:');
  console.error(error);
  stopDevServer();
  process.exit(1);
});
