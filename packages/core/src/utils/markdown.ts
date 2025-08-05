import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFootnotes from 'remark-footnotes';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

export interface MarkdownOptions {
  includeMath?: boolean;
  includeFootnotes?: boolean;
  includeGfm?: boolean;
  allowRawHtml?: boolean;
}

export const processMarkdown = async (
  content: string,
  options: MarkdownOptions = {}
): Promise<string> => {
  const {
    includeMath = true,
    includeFootnotes = true,
    includeGfm = true,
    allowRawHtml = true
  } = options;

  let processor = unified().use(remarkParse);

  if (includeGfm) {
    processor = processor.use(remarkGfm);
  }

  if (includeMath) {
    processor = processor.use(remarkMath);
  }

  if (includeFootnotes) {
    processor = processor.use(remarkFootnotes);
  }

  processor = processor.use(remarkRehype, { allowDangerousHtml: allowRawHtml });

  if (allowRawHtml) {
    processor = processor.use(rehypeRaw);
  }

  if (includeMath) {
    processor = processor.use(rehypeKatex);
  }

  processor = processor.use(rehypeStringify);

  const result = await processor.process(content);
  return String(result);
};

export const extractMetadata = (content: string): Record<string, string> => {
  const metadata: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('---')) break;
    if (line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();
      if (key && value) {
        metadata[key.trim()] = value;
      }
    }
  }
  
  return metadata;
};

export const removeMetadata = (content: string): string => {
  const lines = content.split('\n');
  let startIndex = -1;
  let endIndex = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (startIndex === -1) {
        startIndex = i;
      } else {
        endIndex = i;
        break;
      }
    }
  }
  
  if (startIndex !== -1 && endIndex !== -1) {
    return lines.slice(endIndex + 1).join('\n');
  }
  
  return content;
}; 