const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  screens: {
    sm: '500px',
    lg: '960px',
  },
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    white: '#FFF',
    black: '#000',
    coral: '#FF6057',
    vega: {
      yellow: '#EDFF22',
      pink: '#FF2D5E',
      green: '#00F780',
    },
    intent: {
      danger: '#FF261A',
      warning: '#FF7A1A',
      prompt: '#EDFF22',
      success: '#26FF8A',
      help: '#494949',
    },
    'intent-background': {
      danger: '#9E0025', // for white text
    },
    /*,
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
    },*/
  },
  spacing: {
    0: '0px',
    2: '0.125rem',
    4: '0.25rem',
    8: '0.5rem',
    12: '0.75rem',
    16: '1rem',
    20: '1.25rem',
    24: '1.5rem',
    28: '1.75rem',
    32: '2rem',
    44: '2.75rem',
  },
  /*
  backgroundColor: ({ theme }) => ({
    transparent: 'transparent',
    dark: theme('colors.neutral.753'),
    black: '#000',
    white: theme('colors.white'),
    danger: theme('colors.intent.background.danger'),
    'neutral-200': theme('colors.neutral.200'),
  }),
  */
  borderWidth: {
    DEFAULT: '1px',
    1: '1px',
    4: '4px',
  },
  fontFamily: {
    mono: defaultTheme.fontFamily.mono,
    serif: defaultTheme.fontFamily.serif,
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
  },
  fontSize: {
    h1: ['72px', { lineHeight: '92px', letterSpacing: '-0.01em' }],
    h2: ['48px', { lineHeight: '64px', letterSpacing: '-0.01em' }],
    h3: ['32px', { lineHeight: '40px', letterSpacing: '-0.01em' }],

    h4: ['24px', { lineHeight: '36px', letterSpacing: '-0.01em' }],
    h5: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],

    'body-large': ['16px', '24px'],
    body: ['14px', '20px'],

    ui: ['14px', '20px'],
    'ui-small': ['10px', '16px'],
  },

  extend: {
    boxShadow: {
      callout: '5px 5px 0 1px rgba(0, 0, 0, 0.05)',
      focus: '0px 0px 0px 1px #FFFFFF, 0px 0px 3px 2px #FFE600',
      'focus-dark': '0px 0px 0px 1px #000000, 0px 0px 3px 2px #FFE600',
    },
  },
};
