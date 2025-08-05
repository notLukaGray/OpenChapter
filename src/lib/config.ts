// Environment variable validation
function validateEnvironment() {
  // Only run validation on server side to avoid client-side issues
  if (typeof window !== 'undefined') {
    return; // Skip validation on client side
  }

  // Server-side only variables (not available in browser)
  const serverVars = [
    'INDEXNOW_KEY',
    'INDEXNOW_KEY_LOCATION',
    'INDEXNOW_ADMIN_SECRET',
  ];

  // Check server variables
  const missingServerVars = serverVars.filter(varName => !process.env[varName]);

  if (missingServerVars.length > 0) {
    console.warn(
      `Missing environment variables: ${missingServerVars.join(', ')}`
    );
  }
}

// Validate environment on module load
validateEnvironment();

export const siteConfig = {
  primaryDomain: 'https://openchapter.dev',
  shortDomain: 'https://openchapter.dev',
  domains: ['https://openchapter.dev'],
  isPrimaryDomain: (domain: string) =>
    domain === 'https://openchapter.dev',
  getCanonicalUrl: (path: string) => `https://openchapter.dev${path}`,

  getCanonicalUrlForPage: (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://openchapter.dev${cleanPath}`;
  },

  shouldHaveCanonical: (path: string) => {
    const excludedPaths = ['/api/', '/_next/', '/admin/', '/404'];
    return !excludedPaths.some(excluded => path.includes(excluded));
  },

  // Site metadata
  title: 'OpenChapter',
  description:
    'An open-source platform for creating interactive web books with audio narration capabilities. Perfect for educators, authors, and content creators.',
  author: 'OpenChapter',
  authorUrl: 'https://github.com/your-username/your-repo',
  publisher: 'OpenChapter', // Open source project
  twitterHandle: '@openchapter',
  email: 'support@openchapter.dev',

  // SEO settings
  keywords: [
    'design thinking',
    'strategic design',
    'design education',
    'creative career',
    'design process',
    'client relationships',
    'design strategy',
    'student resources',
    'educator resources',
  ],

  // Social media
  social: {
    // Add social media handles as needed
  },

  // Book metadata
  book: {
    title: 'OpenChapter',
    isbn: '978-0-000000-0-0',
    genre: 'Open Source, Education, Technology',
    audience: 'Developers, Educators, Content Creators',
    educationalLevel: 'All Levels',
    articleSection: 'Open Source Education',
    audienceType: 'developers, educators, authors',
    copyrightYear: '2024',
    publicationDate: '2025-07-14T12:52:57Z',
  },

  // Analytics
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '',
  },

  // IndexNow configuration
  indexnow: {
    key: process.env.INDEXNOW_KEY || '',
    keyLocation: process.env.INDEXNOW_KEY_LOCATION || '',
  },

  // Structured data defaults
  structuredData: {
    book: {
      name: 'OpenChapter',
      description:
        'An open-source platform for creating interactive web books with audio narration capabilities',
      isbn: '978-0-000000-0-0',
      genre: 'Open Source, Education, Technology',
      audience: {
        '@type': 'Audience',
        audienceType: 'Developers, Educators, Content Creators',
      },
      educationalLevel: 'All Levels',
    },
    website: {
      name: 'OpenChapter',
      description:
        'An open-source platform for creating interactive web books with audio narration capabilities. Perfect for educators, authors, and content creators.',
      inLanguage: 'en-US',
      copyrightYear: '2024',
    },
    organization: {
      name: 'OpenChapter',
      logo: '/apple-touch-icon.png',
      sameAs: ['https://github.com/your-username/your-repo'],
    },
  },

  // Audio configuration
  audio: {
    encodingFormat: 'audio/mpeg',
    defaultDuration: 'Unknown',
  },

  // Content defaults
  content: {
    defaultImage: '/apple-touch-icon.png',
    defaultKeywords: ['openchapter', 'open source', 'web book', 'audio narration'],
  },
};
