// Map of chapter slugs to unique descriptions
export const chapterDescriptions: Record<string, string> = {
  introduction: `Welcome to OpenChapter - an open-source platform for creating interactive web books with audio narration. Learn about the features and capabilities that make digital publishing accessible and engaging.`,
  chapterone: `Explore advanced markdown features including tables, task lists, mathematical expressions, and HTML elements. Learn how to create rich, interactive content that engages your readers.`,
  chaptertwo: `Discover customization options and interactive features including audio players, search functionality, accessibility features, and SEO optimization. Make your content come alive with modern web technologies.`,
  chapterthree: `Learn about deployment options, technical architecture, and performance optimization. Understand how to deploy your OpenChapter book to various hosting platforms with confidence.`,
  chapterfour: `Master search engine optimization with comprehensive SEO features including meta tags, structured data, sitemap generation, and robots.txt configuration. Make your content discoverable.`,
  chapterfive: `Set up Google Analytics and implement custom event tracking to understand user behavior. Track audio usage, search patterns, navigation, and content engagement.`,
};

// Map of chapter slugs to categories
export const chapterCategories: Record<string, string[]> = {
  introduction: ['OpenChapter', 'Platform Introduction', 'Getting Started'],
  chapterone: ['Markdown', 'Content Creation', 'Advanced Features'],
  chaptertwo: ['Customization', 'Interactive Features', 'Accessibility'],
  chapterthree: ['Deployment', 'Technical Architecture', 'Performance'],
  chapterfour: ['SEO', 'Search Engine Optimization', 'Meta Tags', 'Structured Data'],
  chapterfive: ['Analytics', 'Google Analytics', 'Event Tracking', 'User Behavior'],
};
