const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  screens: {
    sm: '500px',
    lg: '960px',
  },
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    black: '#000',
    white: '#FFF',

    neutral: {
      // 250 - 23 = 227; (900-50) / 227 = 850 / 227 = 3.74449339207
      50: '#fafafa', // FA = 250
      100: '#ebebeb',
      150: '#dcdcdc',
      200: '#cdcdcd',
      250: '#bebebe',
      300: '#afafaf',
      350: '#a1a1a1',
      400: '#939393',
      450: '#858585',
      500: '#787878',
      550: '#6a6a6a',
      593: '#696969', // dark muted
      600: '#5d5d5d',
      650: '#515151',
      700: '#444444',
      753: '#3E3E3E', // dark -> 3F is muted
      750: '#383838',
      800: '#2d2d2d', // breakdown-background was 2C
      850: '#222222',
      900: '#171717', // 17 = 23
    },

    'light-gray-50': '#F5F8FA', //off-white - https://blueprintjs.com/docs/#core/colors
    'gray-50': '#BFCCD6', // muted - https://blueprintjs.com/docs/#core/colors
    coral: '#FF6057',
    // below colors are not defined as atoms
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
    } /*,
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
    },*/,
  },
  spacing: {
    0: '0px',
    2: '0.125rem',
    4: '0.25rem',
    8: '0.5rem',
    12: '0.75rem',
    28: '1.75rem',
    44: '2.75rem',
  },
  backgroundColor: ({ theme }) => ({
    transparent: 'transparent',
    neutral: theme('colors.neutral'),
    dark: theme('colors.dark'),
    black: '#000',
    white: theme('colors.white'),
    danger: theme('colors.intent.background.danger'),
    'neutral-200': theme('colors.neutral.200'),
  }),
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
};
