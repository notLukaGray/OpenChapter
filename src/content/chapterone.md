Part: Part I: GETTING STARTED
KeyImage: /images/01_kv.webp
ImageAuthor: OpenChapter
ImageUrl: https://your-domain.com
Chapter: Advanced Markdown Features
Quote: "Markdown makes content creation simple and powerful"
Quote Author: OpenChapter Team
Keywords: markdown, formatting, tables, advanced features
Order: 2
AudioFile: /vo/chapterone-audio.mp3
AudioText: Chapter One - Advanced Markdown Features. Learn about tables, task lists, and other advanced formatting options.
---

# Advanced Markdown Features

OpenChapter supports all the advanced markdown features you need for creating rich, engaging content.

## Tables

Tables are perfect for organizing data and comparisons:

| Feature | Description | Status |
|---------|-------------|--------|
| **Audio Narration** | AI-generated text-to-speech for every chapter | ✅ Available |
| **Search** | Full-text search across all content | ✅ Available |
| **Responsive Design** | Works perfectly on phones, tablets, and desktops | ✅ Available |
| **SEO Optimization** | Built for discoverability and search engines | ✅ Available |
| **Accessibility** | WCAG compliant with screen reader support | ✅ Available |

### Tables with Alignment

You can control column alignment using markdown syntax:

| Left Aligned | Center Aligned | Right Aligned |
|:-------------|:--------------:|-------------:|
| This content is left-aligned | This content is centered | This content is right-aligned |
| More left-aligned content | More centered content | More right-aligned content |
| Even more left content | Even more center content | Even more right content |

### Feature Comparison Table

| Platform Feature | OpenChapter | Other Platforms |
|:----------------|:------------|:---------------|
| **Audio Narration** | ✅ Built-in AI generation | ❌ Manual recording |
| **Search** | ✅ Full-text search | ❌ Basic search |
| **Customization** | ✅ Full HTML support | ❌ Limited markdown |
| **Deployment** | ✅ One-click deployment | ❌ Complex setup |
| **Cost** | ✅ Free and open source | ❌ Expensive licenses |

## Task Lists

Task lists are great for checklists and progress tracking:

- [x] Set up OpenChapter project
- [x] Configure audio narration
- [x] Add search functionality
- [x] Implement responsive design
- [ ] Add custom themes
- [ ] Create mobile app
- [ ] Add collaborative features

## Definition Lists

You can create definition-style lists using bold text and dashes:

**OpenChapter** - An open-source platform for creating interactive web books

**Audio Narration** - AI-generated text-to-speech for every chapter

**Search Functionality** - Full-text search across all content

**Responsive Design** - Adapts to any screen size

## Mathematical Expressions

You can include mathematical expressions using LaTeX-style syntax:

Inline math: The area of a circle is $A = \pi r^2$

Block math:
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

### More Math Examples

**Quadratic Formula:**
$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

**Matrix:**
$$
\begin{bmatrix}
a & b \\
c & d
\end{bmatrix}
$$

**Simple Math Test:**
$$
\sqrt{4} = 2
$$

**Complex Math Test:**
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Links and References

### External Links

You can link to [external websites](https://github.com/notLukaGray/OpenChapter) and resources.

### Internal Links

You can reference other chapters or sections within your book.

### Email Links

Contact us at [support@your-domain.com](mailto:support@your-domain.com) for help.

## Images and Media

### Basic Images

![Example Image](/images/book_cover.webp)

### Images with Alt Text

![OpenChapter Logo - A modern book icon representing digital publishing](/images/book_cover.webp)

### Image Links

[![Clickable Image](/images/book_cover.webp)](https://github.com/notLukaGray/OpenChapter)

## Code with Syntax Highlighting

OpenChapter supports syntax highlighting for many programming languages:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>OpenChapter Example</title>
</head>
<body>
    <h1>Hello, OpenChapter!</h1>
    <p>This is an example HTML file.</p>
</body>
</html>
```

```css

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}
```

```typescript
// TypeScript example
interface Chapter {
    title: string;
    content: string;
    audioFile?: string;
}

class Book {
    private chapters: Chapter[] = [];
    
    addChapter(chapter: Chapter): void {
        this.chapters.push(chapter);
    }
    
    getChapterCount(): number {
        return this.chapters.length;
    }
}
```

## Footnotes

You can add footnotes to provide additional information[^1].

[^1]: This is a footnote. It appears at the bottom of the page.

### Multiple Footnotes

You can have multiple footnotes[^2] and reference them throughout your content[^3].

[^2]: This is the second footnote with more detailed information.
[^3]: Footnotes are great for citations, explanations, or additional context.

## Horizontal Rules

You can create visual separators to break up content:

---

## Blockquotes

Blockquotes are great for highlighting important information:

> This is a blockquote. It's perfect for highlighting important information, quotes from other sources, or key takeaways.

### Nested Blockquotes

> Main quote
> > Nested quote
> > > Deeply nested quote

### Blockquotes with Attribution

> "The best way to predict the future is to invent it."
> 
> — Alan Kay

## HTML Elements

Since OpenChapter supports HTML, you can use various HTML elements:

### Collapsible Sections

<details>
<summary>Click to expand - Hidden Content</summary>

This content is hidden by default and can be expanded by clicking the summary.

- Additional information
- More details
- Extended explanations

</details>

### Custom Styling

<div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">

**Note**: This is a custom styled div with a blue border and gray background. You can use HTML to create custom styled sections.

</div>

### Tables (HTML)

<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr style="background-color: #f8f9fa;">
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Feature</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
      <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;"><strong>Audio Narration</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px;">AI-generated text-to-speech</td>
      <td style="border: 1px solid #ddd; padding: 8px;">✅ Available</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;"><strong>Search</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px;">Full-text search across chapters</td>
      <td style="border: 1px solid #ddd; padding: 8px;">✅ Available</td>
    </tr>
    <tr>
      <td style="border: 1px solid #ddd; padding: 8px;"><strong>Responsive Design</strong></td>
      <td style="border: 1px solid #ddd; padding: 8px;">Works on all devices</td>
      <td style="border: 1px solid #ddd; padding: 8px;">✅ Available</td>
    </tr>
  </tbody>
</table>

## Next Chapter

In the next chapter, we'll explore how to customize the appearance and add interactive elements to your OpenChapter book.
