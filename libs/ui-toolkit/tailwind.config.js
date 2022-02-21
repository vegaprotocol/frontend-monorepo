const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('path');
// const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,tsx,html}'),
    join(__dirname, '.storybook/preview.js'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '500px',
      lg: '960px',
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      dark: '#3E3E3E',
      black: '#000',
      white: '#FFF',
      'off-white': '#F5F8FA',
      muted: '#BFCCD6',
      warning: '#FF6057',
      // below colors are not defined as atoms
      'input-background': '#3F3F3F',
      'breakdown-background': '#2C2C2C',
      'dark-muted': '#696969',
      vega: {
        yellow: '#EDFF22',
        pink: '#FF2D5E',
        green: '#00F780',
      },
      intent: {
        danger: '#FF261A',
        warning: '#FF7A1A',
        prompt: '#EDFF22',
        progress: '#FFF',
        success: '#26FF8A',
        help: '#494949',
        background: {
          danger: '#9E0025', // for white text
        },
      },
      data: {
        red: {
          white: {
            50: '#FFFFFF',
            220: '#FF6057', // overlay FFF 80%
            390: '#FF6057', // overlay FFF 60%
            560: '#FF6057', // overlay FFF 40%
            730: '#FF6057', // overlay FFF 20%
            900: '#FF6057',
          },
          green: {
            50: '#30F68B',
            220: '#89DC50',
            475: '#F2BD09',
            730: '#FF8501',
            900: '#FF6057',
          },
        },
      },
    },
    spacing: {
      px: '1px',
      0: '0px',
      4: '0.25rem',
      8: '0.5rem',
      12: '0.75rem',
      28: '1.75rem',
      44: '2.75rem',
    },
    backgroundColor: (theme) => ({
      transparent: 'transparent',
      dark: theme('colors.dark'),
      black: '#000',
      white: theme('colors.white'),
      danger: theme('colors.intent.background.danger'),
    }),
    borderWidth: {
      DEFAULT: '1px',
      4: '4px',
    },
    fontFamily: (theme) => ({
      ...theme.fontFamily,
      sans: [
        '"Helvetica Neue"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
      alpha: [
        'AlphaLyrae-Medium',
        '"Helvetica Neue"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ],
    }),
    fontSize: {
      h1: ['72px', { lineHeight: '92px', letterSpacing: '-1%' }],
      h2: ['48px', { lineHeight: '64px', letterSpacing: '-1%' }],
      h3: ['32px', { lineHeight: '40px', letterSpacing: '-1%' }],

      h4: ['24px', { lineHeight: '36px', letterSpacing: '-1%' }],
      h5: ['18px', { lineHeight: '28px', letterSpacing: '-1%' }],

      'body-large': ['16px', '24px'],
      body: ['14px', '20px'],

      ui: ['14px', '20px'],
      'ui-small': ['10px', '16px'],
    },

    extend: {
      boxShadow: {
        callout: '5px 5px 0 1px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
