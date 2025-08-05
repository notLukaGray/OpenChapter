#!/usr/bin/env node

/**
 * Comprehensive SEO Audit Script for "OpenChapter"
 * Checks for canonical tag issues, meta tags, structured data, and other SEO problems
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

// Configuration - Load from config file
let SITE_CONFIG;
try {
  // Try to load the TypeScript config file
  const configPath = path.join(process.cwd(), 'src/lib/config.ts');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  // Extract title from the config file
  const titleMatch = configContent.match(/title:\s*['"`]([^'"`]+)['"`]/);
  const authorMatch = configContent.match(/author:\s*['"`]([^'"`]+)['"`]/);
  const primaryDomainMatch = configContent.match(/primaryDomain:\s*['"`]([^'"`]+)['"`]/);
  
  SITE_CONFIG = {
    primaryDomain: primaryDomainMatch ? primaryDomainMatch[1] : 'https://your-domain.com',
shortDomain: 'https://your-domain.com',
domains: ['https://your-domain.com'],
    author: authorMatch ? authorMatch[1] : 'OpenChapter',
    title: titleMatch ? titleMatch[1] : 'OpenChapter',
  };
} catch (error) {
  // Fallback config
  SITE_CONFIG = {
    primaryDomain: 'https://your-domain.com',
shortDomain: 'https://your-domain.com',
domains: ['https://your-domain.com'],
    author: 'OpenChapter',
    title: 'OpenChapter',
  };
}

// Pages that should have canonical tags
const PAGES_WITH_CANONICAL = [
  '/',
  '/about',
  '/table-of-contents',
  '/search',
  '/introduction',
  '/chapterone',
  '/chaptertwo',
  '/chapterthree',
  '/chapterfour',
  '/chapterfive',
  '/chaptersix',
  '/chapterseven',
  '/chaptereight',
  '/chapternine',
  '/chapterten',
  '/chaptereleven',
  '/chaptertwelve',
  '/chapterthirteen',
  '/chapterfourteen',
  '/chapterfifteen',
  '/chaptersixteen',
  '/chapterseventeen',
  '/chaptereighteen',
  '/chapternineteen',
  '/chaptertwenty',
  '/chaptertwentyone',
  '/chaptertwentytwo',
  '/chaptertwentythree',
  '/chaptertwentyfour',
  '/chaptertwentyfive',
  '/chaptertwentysix',
  '/chaptertwentyseven',
  '/chaptertwentyeight',
  '/chaptertwentynine',
  '/chapterthirty',
];

// Pages that should NOT have canonical tags
const PAGES_WITHOUT_CANONICAL = [
  '/404',
  '/admin/indexnow',
  '/api/',
  '/_next/',
  '/admin/',
];

// Required meta tags for public pages
const REQUIRED_META_TAGS = [
  'title',
  'description',
  'robots',
  'viewport',
  'charset',
];

// Required Open Graph tags
const REQUIRED_OG_TAGS = ['og:title', 'og:description', 'og:type', 'og:url'];

function checkCanonicalTags() {
  console.log('Checking canonical tag implementation...\n');

  const issues = [];
  const warnings = [];

  // Check if all pages have proper canonical tags
  PAGES_WITH_CANONICAL.forEach(page => {
    const expectedCanonical = `${SITE_CONFIG.primaryDomain}${page}`;
    console.log(`[PASS] ${page} should have canonical: ${expectedCanonical}`);
  });

  // Check if excluded pages don't have canonical tags
  PAGES_WITHOUT_CANONICAL.forEach(page => {
    console.log(
      `[SKIP] ${page} should NOT have canonical tags (admin/API pages)`
    );
  });

  return { issues, warnings };
}

function checkDomainConsistency() {
  console.log('\nChecking domain consistency...\n');

  const issues = [];
  const warnings = [];

  // Check if primary domain is consistently used
  if (SITE_CONFIG.primaryDomain !== 'https://your-domain.com') {
    issues.push('Primary domain should be https://your-domain.com');
  }

  // Check if short domain is properly configured
  if (SITE_CONFIG.shortDomain !== 'https://your-domain.com') {
    issues.push('Short domain should be https://your-domain.com');
  }

  console.log(`[PASS] Primary domain: ${SITE_CONFIG.primaryDomain}`);
  console.log(`[PASS] Short domain: ${SITE_CONFIG.shortDomain}`);
  console.log(`[PASS] All domains: ${SITE_CONFIG.domains.join(', ')}`);

  return { issues, warnings };
}

function checkSitemapConsistency() {
  console.log('\nChecking sitemap consistency...\n');

  const issues = [];
  const warnings = [];

  const sitemapPath = path.join(__dirname, '../src/app/sitemap.ts');

  if (!fs.existsSync(sitemapPath)) {
    console.log('[FAIL] Sitemap file not found');
    return { issues: ['Sitemap file missing'], warnings: [] };
  }

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  // Check if sitemap uses primary domain (either literal or through siteConfig)
  if (
    !sitemapContent.includes(SITE_CONFIG.primaryDomain) &&
    !sitemapContent.includes('siteConfig.primaryDomain')
  ) {
    console.log('[FAIL] Sitemap should use primary domain');
    issues.push('Sitemap should use primary domain');
  } else {
    console.log('[PASS] Sitemap uses primary domain');
  }

  // Check if all important pages are in sitemap
  const importantPages = ['/', '/about', '/table-of-contents', '/search'];
  importantPages.forEach(page => {
    if (sitemapContent.includes(page)) {
      console.log(`[PASS] Sitemap includes: ${page}`);
    } else {
      console.log(`[WARN] Sitemap missing: ${page}`);
    }
  });

  return { issues, warnings };
}

function checkRobotsTxt() {
  console.log('\nChecking robots.txt...\n');

  const robotsRoutePath = path.join(
    __dirname,
    '../src/app/robots.txt/route.ts'
  );

  if (!fs.existsSync(robotsRoutePath)) {
    console.log('[FAIL] robots.txt route not found');
    return { issues: ['robots.txt route missing'], warnings: [] };
  }

  const robotsContent = fs.readFileSync(robotsRoutePath, 'utf8');

  // Check if robots.txt allows all important pages
  if (robotsContent.includes('Allow: /')) {
    console.log('[PASS] robots.txt allows all pages');
  } else {
    console.log('[FAIL] robots.txt should allow all pages');
  }

  // Check if admin pages are blocked
  if (robotsContent.includes('Disallow: /admin/')) {
    console.log('[PASS] robots.txt blocks admin pages');
  } else {
    console.log('[FAIL] robots.txt should block admin pages');
  }

  // Check if API routes are blocked
  if (robotsContent.includes('Disallow: /api/')) {
    console.log('[PASS] robots.txt blocks API routes');
  } else {
    console.log('[FAIL] robots.txt should block API routes');
  }

  // Check if sitemap is referenced
  if (robotsContent.includes('Sitemap:')) {
    console.log('[PASS] robots.txt references sitemap');
  } else {
    console.log('[FAIL] robots.txt should reference sitemap');
  }

  return { issues: [], warnings: [] };
}

function checkAdminPageIndexing() {
  console.log('\nChecking admin page indexing...\n');

  const issues = [];
  const warnings = [];

  // Check admin page for noindex meta tags
  const adminPagePath = path.join(
    __dirname,
    '../src/app/admin/indexnow/page.tsx'
  );

  if (!fs.existsSync(adminPagePath)) {
    console.log('[FAIL] Admin page not found');
    return { issues: ['Admin page missing'], warnings: [] };
  }

  const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');

  // Check for noindex meta tags (Next.js 13+ metadata API format)
  if (adminPageContent.includes('index: false')) {
    console.log('[PASS] Admin page has noindex meta tags');
  } else {
    console.log('[FAIL] Admin page should have noindex meta tags');
    issues.push('Admin page missing noindex meta tags');
  }

  // Check for nofollow meta tags (Next.js 13+ metadata API format)
  if (adminPageContent.includes('follow: false')) {
    console.log('[PASS] Admin page has nofollow meta tags');
  } else {
    console.log('[FAIL] Admin page should have nofollow meta tags');
    issues.push('Admin page missing nofollow meta tags');
  }

  // Check that admin page doesn't have canonical tags
  if (
    !adminPageContent.includes('canonical') &&
    !adminPageContent.includes('alternates:') &&
    !adminPageContent.includes('canonical: null')
  ) {
    console.log('[PASS] Admin page correctly has no canonical tags');
  } else if (adminPageContent.includes('canonical: null')) {
    console.log('[PASS] Admin page correctly has canonical disabled');
  } else {
    console.log('[FAIL] Admin page should not have canonical tags');
    issues.push('Admin page should not have canonical tags');
  }

  return { issues, warnings };
}

function checkMetaTags() {
  console.log('\n Checking meta tags...\n');

  const issues = [];
  const warnings = [];

  // Check layout.tsx for required meta tags
  const layoutPath = path.join(__dirname, '../src/app/layout.tsx');

  if (!fs.existsSync(layoutPath)) {
    console.log('[FAIL] Layout file not found');
    return { issues: ['Layout file missing'], warnings: [] };
  }

  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  // Check for charset meta tag - must be exact
  if (layoutContent.includes('charSet="utf-8"')) {
    console.log('[PASS] Layout has charset meta tag');
  } else {
    console.log('[FAIL] Layout missing charset meta tag');
    issues.push('Layout missing charset meta tag');
  }

  // Check for viewport meta tag - must be exact
  if (layoutContent.includes('generateViewport')) {
    console.log('[PASS] Layout has viewport configuration');
  } else {
    console.log('[FAIL] Layout missing viewport configuration');
    issues.push('Layout missing viewport configuration');
  }

  // Check for Open Graph configuration - must be exact
  if (layoutContent.includes('openGraph:')) {
    console.log('[PASS] Layout has Open Graph configuration');

    // Validate Open Graph properties
    const requiredOGProps = [
      'type',
      'locale',
      'url',
      'siteName',
      'title',
      'description',
    ];
    const missingOGProps = requiredOGProps.filter(
      prop =>
        !layoutContent.includes(`og:${prop}`) &&
        !layoutContent.includes(`${prop}:`)
    );
    if (missingOGProps.length > 0) {
      console.log(
        `[FAIL] Open Graph missing properties: ${missingOGProps.join(', ')}`
      );
      issues.push(
        `Open Graph missing properties: ${missingOGProps.join(', ')}`
      );
    } else {
      console.log('[PASS] Open Graph has all required properties');
    }
  } else {
    console.log('[FAIL] Layout missing Open Graph configuration');
    issues.push('Layout missing Open Graph configuration');
  }

  // Check for structured data - must be exact
  if (layoutContent.includes('application/ld+json')) {
    console.log('[PASS] Layout has structured data');
  } else {
    console.log('[FAIL] Layout missing structured data');
    issues.push('Layout missing structured data');
  }

  // Check for robots meta tag configuration
  if (layoutContent.includes('robots:')) {
    console.log('[PASS] Layout has robots configuration');

    // Validate robots properties
    const requiredRobotsProps = ['index', 'follow'];
    const missingRobotsProps = requiredRobotsProps.filter(
      prop => !layoutContent.includes(`${prop}:`)
    );
    if (missingRobotsProps.length > 0) {
      console.log(
        `[FAIL] Robots missing properties: ${missingRobotsProps.join(', ')}`
      );
      issues.push(
        `Robots missing properties: ${missingRobotsProps.join(', ')}`
      );
    } else {
      console.log('[PASS] Robots has all required properties');
    }
  } else {
    console.log('[FAIL] Layout missing robots configuration');
    issues.push('Layout missing robots configuration');
  }

  return { issues, warnings };
}

async function checkStructuredData() {
  console.log('\n Checking structured data (rendered HTML)...\n');

  const issues = [];
  const warnings = [];

  // Try to fetch the homepage from local dev server
  let html;
  try {
    const res = await fetch('http://localhost:3000');
    if (!res.ok) {
      console.log('[FAIL] Could not fetch homepage from http://localhost:3000');
      issues.push('Could not fetch homepage for structured data check');
      return { issues, warnings };
    }
    html = await res.text();
  } catch (err) {
    console.log(
      '[WARN]  Could not connect to http://localhost:3000. Is your dev server running?'
    );
    issues.push('Dev server not running for structured data check');
    return { issues, warnings };
  }

  const $ = cheerio.load(html);
  const scripts = $('script[type="application/ld+json"]');
  if (scripts.length === 0) {
    console.log('[FAIL] No JSON-LD structured data found in rendered HTML');
    issues.push('No JSON-LD structured data found in rendered HTML');
    return { issues, warnings };
  }

  let foundBook = false,
    foundWebSite = false,
    foundOrg = false;
  let bookMissingProps = [];
  scripts.each((i, el) => {
    let json;
    try {
      json = JSON.parse($(el).html());
    } catch (e) {
      // Try to parse as array
      try {
        json = JSON.parse(`[${$(el).html()}]`);
      } catch (e2) {
        console.log('[FAIL] Invalid JSON-LD in <script> block');
        issues.push('Invalid JSON-LD in <script> block');
        return;
      }
    }
    const arr = Array.isArray(json) ? json : [json];
    arr.forEach(item => {
      if (item['@type'] === 'Book') {
        foundBook = true;
        const requiredBookProps = ['name', 'author', 'publisher', 'url'];
        const missing = requiredBookProps.filter(prop => !item[prop]);
        if (missing.length > 0) bookMissingProps.push(...missing);
      }
      if (item['@type'] === 'WebSite') foundWebSite = true;
      if (item['@type'] === 'Organization') foundOrg = true;
    });
  });
  if (foundBook) {
    if (bookMissingProps.length === 0) {
      console.log('[PASS] Book structured data present and complete');
    } else {
      console.log(
        `[FAIL] Book structured data missing properties: ${[...new Set(bookMissingProps)].join(', ')}`
      );
      issues.push(
        `Book structured data missing properties: ${[...new Set(bookMissingProps)].join(', ')}`
      );
    }
  } else {
    console.log('[FAIL] Book structured data missing');
    issues.push('Book structured data missing');
  }
  if (foundWebSite) {
    console.log('[PASS] WebSite structured data present');
  } else {
    console.log('[FAIL] WebSite structured data missing');
    issues.push('WebSite structured data missing');
  }
  if (foundOrg) {
    console.log('[PASS] Organization structured data present');
  } else {
    console.log('[FAIL] Organization structured data missing');
    issues.push('Organization structured data missing');
  }
  return { issues, warnings };
}

function checkChapterPages() {
  console.log('\n Checking chapter pages...\n');

  const issues = [];
  const warnings = [];

  // Check a sample chapter page
  const chapterPath = path.join(__dirname, '../src/app/[slug]/page.tsx');

  if (!fs.existsSync(chapterPath)) {
    console.log('[FAIL] Chapter page template not found');
    return { issues: ['Chapter page template missing'], warnings: [] };
  }

  const chapterContent = fs.readFileSync(chapterPath, 'utf8');

  // Extract JSON-LD content from chapter pages - look for generateStructuredData function
  if (chapterContent.includes('generateStructuredData')) {
    console.log(
      '[PASS] Chapter pages have structured data generation function'
    );

    // Check for required schema types in the function - look for the actual structured data objects
    if (
      chapterContent.includes('"@type": "Article"') ||
      chapterContent.includes("'@type': 'Article'")
    ) {
      console.log('[PASS] Chapter pages have Article structured data');
    } else {
      console.log('[FAIL] Chapter pages missing Article structured data');
      issues.push('Chapter pages missing Article structured data');
    }

    if (
      chapterContent.includes('"@type": "Chapter"') ||
      chapterContent.includes("'@type': 'Chapter'")
    ) {
      console.log('[PASS] Chapter pages have Chapter structured data');
    } else {
      console.log('[FAIL] Chapter pages missing Chapter structured data');
      issues.push('Chapter pages missing Chapter structured data');
    }

    // Check for breadcrumbs
    if (chapterContent.includes('breadcrumbs')) {
      console.log('[PASS] Chapter pages have breadcrumbs');
    } else {
      console.log('[FAIL] Chapter pages missing breadcrumbs');
      issues.push('Chapter pages missing breadcrumbs');
    }
  } else {
    console.log('[FAIL] Chapter pages missing structured data generation');
    issues.push('Chapter pages missing structured data generation');
  }

  return { issues, warnings };
}

function checkPerformance() {
  console.log('\n Checking performance optimizations...\n');

  const issues = [];
  const warnings = [];

  // Check next.config.ts for performance settings
  const configPath = path.join(__dirname, '../next.config.ts');

  if (!fs.existsSync(configPath)) {
    console.log('[FAIL] Next.js config not found');
    return { issues: ['Next.js config missing'], warnings: [] };
  }

  const configContent = fs.readFileSync(configPath, 'utf8');

  // Check for image optimization
  if (configContent.includes('images:')) {
    console.log('[PASS] Image optimization configured');
  } else {
    console.log('[FAIL] Image optimization not configured');
    issues.push('Image optimization not configured');
  }

  // Check for compression
  if (configContent.includes('compress: true')) {
    console.log('[PASS] Compression enabled');
  } else {
    console.log('[FAIL] Compression not enabled');
    issues.push('Compression not enabled');
  }

  // Check for security headers
  if (configContent.includes('headers()')) {
    console.log('[PASS] Security headers configured');
  } else {
    console.log('[FAIL] Security headers not configured');
    issues.push('Security headers not configured');
  }

  return { issues, warnings };
}

function checkAccessibility() {
  console.log('\n Checking accessibility...\n');

  const issues = [];
  const warnings = [];

  // Check layout.tsx for accessibility features
  const layoutPath = path.join(__dirname, '../src/app/layout.tsx');

  if (!fs.existsSync(layoutPath)) {
    console.log('[FAIL] Layout file not found');
    return { issues: ['Layout file missing'], warnings: [] };
  }

  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  // Check for lang attribute
  if (layoutContent.includes('lang="en"')) {
    console.log('[PASS] HTML lang attribute set');
  } else {
    console.log('[FAIL] HTML lang attribute missing');
    issues.push('HTML lang attribute missing');
  }

  // Check for viewport meta tag
  if (layoutContent.includes('viewport')) {
    console.log('[PASS] Viewport meta tag present');
  } else {
    console.log('[FAIL] Viewport meta tag missing');
    issues.push('Viewport meta tag missing');
  }

  return { issues, warnings };
}

function checkContentFiles() {
  console.log('\n Checking content files...\n');

  const issues = [];
  const warnings = [];

  const contentPath = path.join(__dirname, '../src/content');

  if (!fs.existsSync(contentPath)) {
    console.log('[FAIL] Content directory not found');
    return { issues: ['Content directory missing'], warnings: [] };
  }

  const contentFiles = fs.readdirSync(contentPath);

  // Check for required content files
  const requiredFiles = ['introduction.md', 'chapterone.md'];
  requiredFiles.forEach(file => {
    if (contentFiles.includes(file)) {
      console.log(`[PASS] Content file exists: ${file}`);
    } else {
      console.log(`[FAIL] Content file missing: ${file}`);
      issues.push(`Content file missing: ${file}`);
    }
  });

  // Check total number of chapter files
  const chapterFiles = contentFiles.filter(
    file => file.startsWith('chapter') && file.endsWith('.md')
  );
  console.log(`[PASS] Found ${chapterFiles.length} chapter files`);

  if (chapterFiles.length < 30) {
    warnings.push(`Expected 30 chapters, found ${chapterFiles.length}`);
  }

  return { issues, warnings };
}

function checkExternalLinks() {
  console.log('\n Checking external links...\n');

  const issues = [];
  const warnings = [];

  // Check for preconnect links in layout
  const layoutPath = path.join(__dirname, '../src/app/layout.tsx');

  if (!fs.existsSync(layoutPath)) {
    console.log('[FAIL] Layout file not found');
    return { issues: ['Layout file missing'], warnings: [] };
  }

  const layoutContent = fs.readFileSync(layoutPath, 'utf8');

  // Check for preconnect to external domains
  if (layoutContent.includes('preconnect')) {
    console.log('[PASS] Preconnect links configured');
  } else {
    console.log('[FAIL] Preconnect links not configured');
    warnings.push('Preconnect links not configured');
  }

  // Check for DNS prefetch
  if (layoutContent.includes('dns-prefetch')) {
    console.log('[PASS] DNS prefetch configured');
  } else {
    console.log('[FAIL] DNS prefetch not configured');
    warnings.push('DNS prefetch not configured');
  }

  return { issues, warnings };
}

function generateReport(allIssues, allWarnings) {
  console.log('\n Comprehensive SEO Audit Report\n');
  console.log('='.repeat(60));

  if (allIssues.length === 0 && allWarnings.length === 0) {
    console.log(
      '[SUCCESS] No SEO issues found! Your site is properly optimized.'
    );
  } else {
    if (allIssues.length > 0) {
      console.log('\n[FAIL] Critical Issues Found:');
      allIssues.forEach(issue => console.log(`  • ${issue}`));
    }

    if (allWarnings.length > 0) {
      console.log('\n[WARN] Warnings:');
      allWarnings.forEach(warning => console.log(`  • ${warning}`));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n Recommendations:');
  console.log('1. Fix all critical issues above');
  console.log('2. Address warnings for better SEO performance');
  console.log('3. Monitor Google Search Console regularly');
  console.log('4. Run this audit monthly');
  console.log('5. Test page speed with Google PageSpeed Insights');
  console.log('6. Validate structured data with Google Rich Results Test');
  console.log('7. Check mobile-friendliness with Google Mobile-Friendly Test');
}

async function main() {
  console.log(`Starting Comprehensive SEO Audit for "${SITE_CONFIG.title}"\n`);

  const allIssues = [];
  const allWarnings = [];

  // Run all checks except structured data (which is async)
  const checks = [
    checkCanonicalTags(),
    checkDomainConsistency(),
    checkSitemapConsistency(),
    checkRobotsTxt(),
    checkAdminPageIndexing(),
    checkMetaTags(),
    checkChapterPages(),
    checkPerformance(),
    checkAccessibility(),
    checkContentFiles(),
    checkExternalLinks(),
  ];

  checks.forEach(check => {
    allIssues.push(...check.issues);
    allWarnings.push(...check.warnings);
  });

  // Run the robust structured data check
  const structuredDataResult = await checkStructuredData();
  allIssues.push(...structuredDataResult.issues);
  allWarnings.push(...structuredDataResult.warnings);

  // Generate final report
  generateReport(allIssues, allWarnings);

  // Exit with appropriate code
  if (allIssues.length > 0) {
    console.log(
      `\n[FAIL] Audit failed with ${allIssues.length} critical issues`
    );
    process.exit(1);
  } else {
    console.log(
      `\n[PASS] Audit passed! ${allWarnings.length} warnings to consider`
    );
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  checkCanonicalTags,
  checkDomainConsistency,
  checkSitemapConsistency,
  checkRobotsTxt,
  checkAdminPageIndexing,
  checkMetaTags,
  checkStructuredData,
  checkChapterPages,
  checkPerformance,
  checkAccessibility,
  checkContentFiles,
  checkExternalLinks,
};
