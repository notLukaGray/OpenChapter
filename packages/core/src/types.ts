export interface Chapter {
  slug: string;
  title: string;
  content: string;
  metadata: ChapterMetadata;
  audioUrl?: string;
  order: number;
}

export interface ChapterMetadata {
  part?: string;
  keyImage?: string;
  imageAuthor?: string;
  imageUrl?: string;
  quote?: string;
  quoteAuthor?: string;
  keywords?: string[];
  audioFile?: string;
  audioText?: string;
}

export interface AudioConfig {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

export interface SearchResult {
  slug: string;
  title: string;
  excerpt: string;
  score: number;
  highlights: string[];
}

export interface SitemapConfig {
  baseUrl: string;
  chapters: Chapter[];
  additionalPages?: string[];
} 