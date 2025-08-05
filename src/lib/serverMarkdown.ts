import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkFootnotes from 'remark-footnotes';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

export async function processMarkdownToHTML(content: string): Promise<string> {
  try {
    const processor = unified()
      .use(remarkParse)
      .use(remarkGfm) // GitHub Flavored Markdown (tables, task lists, etc.)
      .use(remarkMath) // Math expressions
      .use(remarkFootnotes) // Footnotes
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeKatex, {
        strict: false,
        throwOnError: false,
        errorColor: '#cc0000'
      }) // Math rendering with error handling
      .use(rehypeStringify);

    const result = await processor.process(content);
    return String(result);
  } catch (error) {
    console.error('Error processing markdown:', error);
    // Fallback to simple HTML conversion
    return content
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n\n/gim, '</p><p>')
      .replace(/^(.*)$/gim, '<p>$1</p>');
  }
}

// Split HTML content into chunks for progressive loading
export function splitContentIntoChunks(
  html: string,
  firstChunkSections: number = 1 // Number of H2 sections to include in first chunk
): { firstChunk: string; remainingChunks: string[] } {
  // Split by H2 tags for natural content breaks
  const h2Sections = html.split(/(<h2[^>]*>.*?<\/h2>)/);

  let firstChunk = '';
  const remainingChunks: string[] = [];
  let h2Count = 0;
  let currentChunk = '';

  for (let i = 0; i < h2Sections.length; i++) {
    const section = h2Sections[i];
    if (!section.trim()) continue;

    // Check if this is an H2 tag
    const isH2Section = section.match(/<h2/);

    if (isH2Section) {
      // If we have content in currentChunk, it belongs to the previous H2
      if (currentChunk) {
        if (h2Count < firstChunkSections) {
          firstChunk += currentChunk;
        } else {
          remainingChunks.push(currentChunk);
        }
      }

      // Start new chunk with this H2
      currentChunk = section;
      h2Count++;
    } else {
      // This is content that belongs to the current H2
      currentChunk += section;
    }
  }

  // Don't forget the last chunk
  if (currentChunk) {
    if (h2Count <= firstChunkSections) {
      firstChunk += currentChunk;
    } else {
      remainingChunks.push(currentChunk);
    }
  }

  return { firstChunk, remainingChunks };
}
