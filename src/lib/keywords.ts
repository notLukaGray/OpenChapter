import { Chapter } from './chapters';

// Common words to exclude from keyword extraction
const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'with',
  'by',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'can',
  'this',
  'that',
  'these',
  'those',
  'i',
  'you',
  'he',
  'she',
  'it',
  'we',
  'they',
  'me',
  'him',
  'her',
  'us',
  'them',
  'my',
  'your',
  'his',
  'her',
  'its',
  'our',
  'their',
  'mine',
  'yours',
  'his',
  'hers',
  'ours',
  'theirs',
  'what',
  'when',
  'where',
  'why',
  'how',
  'which',
  'who',
  'whom',
  'whose',
  'if',
  'then',
  'else',
  'while',
  'for',
  'against',
  'between',
  'among',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'up',
  'down',
  'out',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'any',
  'both',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'now',
  'well',
  'also',
  'even',
  'still',
  'back',
  'away',
  'only',
  'quite',
  'rather',
  'really',
  'right',
  'sure',
  'very',
  'way',
  'yes',
  'yet',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'about',
  'above',
  'across',
  'after',
  'against',
  'along',
  'amid',
  'among',
  'around',
  'as',
  'at',
  'before',
  'behind',
  'below',
  'beneath',
  'beside',
  'between',
  'beyond',
  'by',
  'down',
  'during',
  'except',
  'for',
  'from',
  'in',
  'inside',
  'into',
  'like',
  'near',
  'of',
  'off',
  'on',
  'onto',
  'out',
  'outside',
  'over',
  'past',
  'since',
  'through',
  'throughout',
  'to',
  'toward',
  'under',
  'underneath',
  'until',
  'up',
  'upon',
  'with',
  'within',
  'without',
  // HTML and markdown tags
  'div',
  'span',
  'class',
  'style',
  'height',
  'width',
  'color',
  'font',
  'size',
  'text',
  'align',
  'margin',
  'padding',
  'border',
  'solid',
  'background',
  'opacity',
  'max',
  'min',
  'rem',
  'px',
  'em',
  'vh',
  'vw',
  'calc',
  'rgba',
  'rgb',
  'hex',
  'url',
  'src',
  'alt',
  'href',
  'target',
  'blank',
  'rel',
  'self',
  'type',
  'application',
  'json',
  'ld',
  'script',
  'dangerously',
  'inner',
  'html',
  'stringify',
  'context',
  'schema',
  'org',
  'breadcrumb',
  'list',
  'item',
  'element',
  'position',
  'id',
  'name',
  'description',
  'headline',
  'author',
  'publisher',
  'date',
  'published',
  'modified',
  'image',
  'width',
  'height',
  'section',
  'tag',
  'keywords',
  'level',
  'educational',
  'intermediate',
  'audience',
  'type',
  'students',
  'professionals',
  'young',
  'main',
  'entity',
  'page',
  'web',
  'article',
  'chapter',
  'book',
  'person',
  'listitem',
  'itemlist',
  'breadcrumblist',
]);

// Design and business terms that should be prioritized
const DESIGN_TERMS = new Set([
  'design',
  'creative',
  'strategy',
  'brand',
  'identity',
  'logo',
  'typography',
  'color',
  'layout',
  'composition',
  'visual',
  'aesthetic',
  'user',
  'experience',
  'interface',
  'wireframe',
  'prototype',
  'mockup',
  'concept',
  'brief',
  'client',
  'audience',
  'target',
  'market',
  'positioning',
  'differentiation',
  'competition',
  'research',
  'insight',
  'problem',
  'solution',
  'process',
  'methodology',
  'framework',
  'theory',
  'practice',
  'industry',
  'trend',
  'innovation',
  'creativity',
  'art',
  'craft',
  'skill',
  'technique',
  'tool',
  'software',
  'digital',
  'print',
  'web',
  'mobile',
  'responsive',
  'accessibility',
  'usability',
  'functionality',
  'performance',
  'quality',
  'excellence',
  'professional',
  'expertise',
  'knowledge',
  'learning',
  'education',
  'training',
  'mentorship',
  'collaboration',
  'team',
  'project',
  'deadline',
  'budget',
  'scope',
  'deliverable',
  'feedback',
  'revision',
  'iteration',
  'refinement',
  'polish',
  'final',
  'approval',
  'launch',
  'deployment',
  'maintenance',
]);

interface KeywordData {
  keyword: string;
  frequency: number;
  weight: number;
  type: 'heading' | 'emphasis' | 'technical' | 'frequent' | 'brand';
}

// Simple stemming function to match word variations
function getWordStem(word: string): string {
  // Remove common suffixes
  if (word.endsWith('ing')) return word.slice(0, -3);
  if (word.endsWith('ed')) return word.slice(0, -2);
  if (word.endsWith('s')) return word.slice(0, -1);
  if (word.endsWith('al')) return word.slice(0, -2);
  if (word.endsWith('ic')) return word.slice(0, -2);
  if (word.endsWith('ive')) return word.slice(0, -3);
  if (word.endsWith('tion')) return word.slice(0, -4);
  if (word.endsWith('sion')) return word.slice(0, -4);
  if (word.endsWith('ment')) return word.slice(0, -4);
  if (word.endsWith('ness')) return word.slice(0, -4);
  return word;
}

// Check if a word is a variation of a design term
function isDesignTermVariation(word: string): boolean {
  const stem = getWordStem(word);
  return DESIGN_TERMS.has(stem) || DESIGN_TERMS.has(word);
}

// Get the base form of a design term
function getBaseDesignTerm(word: string): string | null {
  const stem = getWordStem(word);
  if (DESIGN_TERMS.has(stem)) return stem;
  if (DESIGN_TERMS.has(word)) return word;
  return null;
}

export function extractKeywordsFromContent(
  content: string,
  chapterTitle: string
): string[] {
  // Clean the content
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]*`/g, '') // Remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove markdown links, keep text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '') // Remove images
    .replace(/[^\w\s-]/g, ' ') // Remove special characters except hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .toLowerCase()
    .trim();

  // Extract words (lower minimum length for important terms)
  const words = cleanContent.split(/\s+/).filter(word => {
    if (word.length < 2) return false;
    if (STOP_WORDS.has(word)) return false;
    if (!/^[a-z-]+$/.test(word)) return false;

    // Allow shorter words if they're design terms or variations
    if (isDesignTermVariation(word)) return true;
    if (word.length > 2) return true;

    return false;
  });

  // Count frequencies
  const wordCounts = new Map<string, number>();
  words.forEach(word => {
    wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
  });

  // Extract headings and emphasized text
  const headings = content.match(/^#{1,3}\s+(.+)$/gm) || [];
  const emphasized = content.match(/\*\*([^*]+)\*\*/g) || [];
  const italicized = content.match(/\*([^*]+)\*/g) || [];

  // Extract heading words
  const headingWords = new Set<string>();
  headings.forEach(heading => {
    const text = heading.replace(/^#{1,3}\s+/, '').toLowerCase();
    const words = text.split(/\s+/).filter(word => {
      if (word.length < 2) return false;
      if (STOP_WORDS.has(word)) return false;
      if (!/^[a-z-]+$/.test(word)) return false;
      if (isDesignTermVariation(word)) return true;
      return word.length > 2;
    });
    words.forEach(word => headingWords.add(word));
  });

  // Extract emphasized words
  const emphasizedWords = new Set<string>();
  [...emphasized, ...italicized].forEach(emph => {
    const text = emph.replace(/[\*\*]/g, '').toLowerCase();
    const words = text.split(/\s+/).filter(word => {
      if (word.length < 2) return false;
      if (STOP_WORDS.has(word)) return false;
      if (!/^[a-z-]+$/.test(word)) return false;
      if (isDesignTermVariation(word)) return true;
      return word.length > 2;
    });
    words.forEach(word => emphasizedWords.add(word));
  });

  // Build keyword data
  const keywordData: KeywordData[] = [];
  const foundDesignTerms = new Set<string>();

  wordCounts.forEach((frequency, word) => {
    let weight = frequency;
    let type: KeywordData['type'] = 'frequent';

    // Check if this is a design term variation
    const baseDesignTerm = getBaseDesignTerm(word);
    if (baseDesignTerm) {
      foundDesignTerms.add(baseDesignTerm);
      weight *= 1.5; // Boost design terms
    }

    // Boost weight for headings (highest priority)
    if (headingWords.has(word)) {
      weight *= 4;
      type = 'heading';
    }

    // Boost weight for emphasized text
    if (emphasizedWords.has(word)) {
      weight *= 1.5;
      type = 'emphasis';
    }

    // Boost weight for technical terms (words with specific patterns)
    if (word.includes('-') || word.length > 8) {
      weight *= 1.2;
      type = 'technical';
    }

    keywordData.push({ keyword: word, frequency, weight, type });
  });

  // Sort by weight and frequency, then take top keywords
  const sortedKeywords = keywordData
    .sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return b.frequency - a.frequency;
    })
    .slice(0, 12) // Reduced to top 12 keywords for better focus
    .map(k => k.keyword);

  // Always include chapter title words (if not already included)
  const titleWords = chapterTitle
    .toLowerCase()
    .split(/\s+/)
    .filter(word => {
      if (word.length < 2) return false;
      if (STOP_WORDS.has(word)) return false;
      if (!/^[a-z-]+$/.test(word)) return false;
      if (isDesignTermVariation(word)) return true;
      if (word.length > 2) return true;
      return false;
    })
    .filter(word => !sortedKeywords.includes(word));

  // Always include any DESIGN_TERMS found in the content (including variations)
  const additionalDesignTerms = Array.from(foundDesignTerms).filter(
    term => !sortedKeywords.includes(term) && !titleWords.includes(term)
  );

  // Combine and return unique keywords
  const allKeywords = [
    ...new Set([...sortedKeywords, ...titleWords, ...additionalDesignTerms]),
  ];

  return allKeywords.slice(0, 25); // Return max 25 keywords
}

export function generateKeywordsForChapter(chapter: Chapter): string[] {
  const extractedKeywords = extractKeywordsFromContent(
    chapter.content,
    chapter.chapter
  );

  // 1. Brand keywords (website title only)
  const brandKeywords = ['looks', 'good', 'now', 'what'];

  // 2. Core design terms (always included)
  const coreDesignKeywords = ['design', 'thinking'];

  // 3. Chapter title words (high priority - these define the topic)
  const chapterTitleWords = chapter.chapter
    .toLowerCase()
    .split(/\s+/)
    .filter(word => {
      if (word.length < 2) return false;
      if (STOP_WORDS.has(word)) return false;
      if (!/^[a-z-]+$/.test(word)) return false;
      if (isDesignTermVariation(word)) return true;
      if (word.length > 2) return true;
      return false;
    });

  // 4. Content-specific keywords (from the actual content)
  const contentKeywords = extractedKeywords.filter(
    keyword =>
      !brandKeywords.includes(keyword) &&
      !coreDesignKeywords.includes(keyword) &&
      !chapterTitleWords.includes(keyword)
  );

  // Combine in priority order: brand → core design → chapter title → content
  const allKeywords = [
    ...brandKeywords,
    ...coreDesignKeywords,
    ...chapterTitleWords,
    ...contentKeywords,
  ];

  return allKeywords.slice(0, 25); // Expanded for better coverage while maintaining priority
}
