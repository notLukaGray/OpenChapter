const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../src/content');
const files = fs
  .readdirSync(contentDir)
  .filter(f => f.endsWith('.md') && f !== 'home.md');

const slugRegex = /^[a-z0-9-]+$/;
const seen = new Set();
let hasError = false;

files.forEach(file => {
  const slug = file.replace(/\.md$/, '');
  if (!slugRegex.test(slug)) {
    console.warn(
      `[FAIL] Invalid slug: "${slug}" (from file: ${file})\n  - Slugs must be lowercase, use only a-z, 0-9, and hyphens.`
    );
    hasError = true;
  }
  if (seen.has(slug)) {
    console.warn(`[FAIL] Duplicate slug: "${slug}" (from file: ${file})`);
    hasError = true;
  }
  seen.add(slug);
});

if (!hasError) {
  console.log('[PASS] All slugs are valid and unique.');
  process.exit(0);
} else {
  process.exit(1);
}
