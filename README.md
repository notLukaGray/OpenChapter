# OpenChapter

**⚠️ Work in Progress - Not Production Ready**

An open-source platform for creating interactive web books with audio narration capabilities. Perfect for educators, authors, and content creators.

**Note:** This project is still in active development with known bugs and incomplete features. Please see the [Known Issues](#known-issues) section below.

## Features

### Core Features
- **Audio Narration**: AI-generated text-to-speech for every chapter with playback controls
- **Full-Text Search**: Real-time search with keyboard navigation and result highlighting
- **Responsive Design**: Mobile-first design that works on all devices
- **SEO Optimization**: Comprehensive meta tags, structured data, and sitemap generation
- **Accessibility**: WCAG compliant with screen reader support and keyboard navigation

### Content Features
- **Markdown Support**: Full markdown with tables, math expressions, code highlighting
- **Progressive Loading**: Content loads in chunks for better performance
- **Navigation**: Previous/next buttons, breadcrumbs, and table of contents
- **Share Functionality**: Native sharing and copy-to-clipboard options
- **Print Support**: Optimized print styles and PDF generation

### Technical Features
- **Performance Tracking**: Core Web Vitals monitoring and optimization
- **Analytics**: Google Analytics integration with custom event tracking
- **Error Handling**: Comprehensive error boundaries and logging
- **Image Optimization**: Automatic image compression and lazy loading
- **Font Optimization**: Web font loading with fallbacks

### Developer Features
- **TypeScript**: Full type safety throughout the codebase
- **Component Architecture**: Modular, reusable components
- **Customizable**: Easy theming and component customization
- **Deployment Ready**: Works on any platform (Vercel, Netlify, AWS, etc.)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/notLukaGray/OpenChapter.git
   cd OpenChapter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Live Demo

See OpenChapter in action: **[https://www.looksgoodnowwhat.com/](https://www.looksgoodnowwhat.com/)**

This live example demonstrates all the core features including audio narration, search functionality, responsive design, and more.

## Environment Variables

Copy `env.example` to `.env.local` and configure:

### Required
- `AZURE_SPEECH_KEY`: Your Azure Speech Service key
- `AZURE_SPEECH_REGION`: Your Azure region

### Optional
- `NEXT_PUBLIC_GA_ID`: Google Analytics ID
- `INDEXNOW_KEY`: IndexNow key for search engine indexing
- `NEXT_PUBLIC_DOMAIN`: Your custom domain

## Content Structure

Add your chapters as markdown files in `src/content/`:

```markdown
Part: Part I: INTRODUCTION
KeyImage: /images/your-image.webp
ImageAuthor: Your Name
ImageUrl: https://your-domain.com
Chapter: Your Chapter Title
Quote: "Your chapter quote"
Quote Author: Author Name
Keywords: keyword1, keyword2, keyword3
Order: 1
AudioFile: /vo/your-chapter-audio.mp3
AudioText: Audio description for this chapter

---

# Your Chapter Content

Your markdown content here...
```

## Deployment

### Vercel
```bash
npm i -g vercel
vercel
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=out
```

### AWS Amplify
Connect your repository and deploy automatically.

### Traditional Hosting
```bash
npm run build
# Upload the 'out' directory to your server
```

### Any Platform
This project works on any hosting platform that supports Next.js or static exports.

## Customization

### Themes
Modify `src/styles/` files to customize the appearance.

### Components
Add custom components in `src/components/`.

### Audio Generation
Update `scripts/generate-chapter-audio.js` for custom audio settings.

## Known Issues

### Math Rendering
- KaTeX math expressions may not render correctly
- Square root symbols and matrices can display incorrectly
- Math CSS conflicts with custom styling

### Audio Features
- Audio generation requires Azure Cognitive Services setup
- Audio files may not generate properly in all environments
- Audio player controls may have styling issues

## Contributing

**⚠️ Important:** This project is in active development with known bugs. Before contributing:

1. Check existing issues for known problems
2. Test thoroughly in your environment
3. Be aware that some features may be incomplete
4. Fork the repository
5. Create a feature branch
6. Make your changes
7. Submit a pull request

## Development Status

- **Core Features**: ~90% complete
- **Audio Narration**: ~90% complete
- **Documentation**: ~75% complete
- **Search**: Complete
- **SEO**: Complete
- **Analytics**: Complete

## License

This project is open source and available under the [MIT License](LICENSE). 

**Attribution Required:** When using, modifying, or distributing this software, you must include the original copyright notice and attribution to `Luka Gray`.

The MIT License allows you to:
- Use the software for any purpose
- Modify and distribute the software
- Use it commercially
- Distribute modified versions

**As long as you include the copyright notice and attribution.**

## Support

- **Documentation**: Check the chapters in this book
- **Issues**: Report bugs on GitHub (please check existing issues first)
- **Discussions**: Join the community

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Audio**: Azure Cognitive Services
- **Deployment**: Works on any platform

---

Built with ❤️ for the open source community.

**Status**: Work in Progress - Not Production Ready
