module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            h1: {
              fontFamily: 'var(--font-sans)',
              fontWeight: '900',
              color: '#222',
              letterSpacing: '-0.03em',
            },
            h2: {
              fontFamily: 'var(--font-sans)',
              fontWeight: '700',
              color: '#222',
              letterSpacing: '-0.01em',
            },
            h3: {
              fontFamily: 'var(--font-sans)',
              fontWeight: '700',
              color: 'var(--color-accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            },
            blockquote: {
              fontFamily: 'var(--font-mono)',
              fontStyle: 'italic',
              color: '#666',
            },
            p: {
              fontFamily: 'var(--font-serif)',
            },
            li: {
              fontFamily: 'var(--font-serif)',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
