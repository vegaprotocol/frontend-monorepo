const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  screens: {
    sm: '500px',
    lg: '960px',
  },
  colors: {
    transparent: 'transparent',
    current: 'currentColor',
    white: {
      DEFAULT: '#FFF',
      '02': 'rgba(255, 255, 255, 0.02)',
      '05': 'rgba(255, 255, 255, 0.05)',
      10: 'rgba(255, 255, 255, 0.10)',
      25: 'rgba(255, 255, 255, 0.25)',
      40: 'rgba(255, 255, 255, 0.40)',
      60: 'rgba(255, 255, 255, 0.60)',
      80: 'rgba(255, 255, 255, 0.80)',
      95: 'rgba(255, 255, 255, 0.95)',
      100: 'rgba(255, 255, 255, 1.00)',
    },
    black: {
      DEFAULT: '#000',
      '02': 'rgba(0, 0, 0, 0.02)',
      '05': 'rgba(0, 0, 0, 0.05)',
      10: 'rgba(0, 0, 0, 0.10)',
      25: 'rgba(0, 0, 0, 0.25)',
      40: 'rgba(0, 0, 0, 0.40)',
      60: 'rgba(0, 0, 0, 0.60)',
      80: 'rgba(0, 0, 0, 0.80)',
      95: 'rgba(0, 0, 0, 0.95)',
      100: 'rgba(0, 0, 0, 1)',
    },
    coral: '#FF6057',
    vega: {
      yellow: '#EDFF22',
      pink: '#FF2D5E',
      green: '#00F780',
    },
    'vega-yellow-dark': '#474B0A', // yellow 0.3 opacity on black
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
  opacity: {
    0: '0',
    2: '0.02',
    5: '0.05',
    10: '0.1',
    15: '0.15',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    35: '0.35',
    40: '0.4',
    45: '0.45',
    50: '0.5',
    55: '0.55',
    60: '0.6',
    65: '0.65',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    85: '0.85',
    90: '0.9',
    95: '0.95',
    99: '0.98',
    100: '1',
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
      callout: '5px 5px 0 1px rgba(255, 255, 255, 0.05)',
      focus: '0px 0px 0px 1px #FFFFFF, 0px 0px 3px 2px #FFE600',
      'focus-dark': '0px 0px 0px 1px #000000, 0px 0px 3px 2px #FFE600',
    },
  },
};

/*
trueGray: {
  50: '#fafafa', 0.02, 0.98
  100: '#f5f5f5', 0.04, 0.96
  200: '#e5e5e5', 0.10, 0.9
  300: '#d4d4d4', 0.17, 0.83
  400: '#a3a3a3', 0.36, 0.64
  500: '#737373', 0.55, 0.45
  600: '#525252', 0.68, 0.32
  700: '#404040', 0.75, 0.25
  800: '#262626', 0.85, 0.15
  900: '#171717', 0.9, 0.1
}

/*
contrasts on #FFF
rgba(0,0,0,0.768) or #595959 7:1
rgba(0,0,0,0.7019) or #767676  4.5:1
rgba(0,0,0,0.63) or #949494 3:1
*/

/*

contrasts on #F2F2F2 (which is rgba(0,0,0,0.5))
rgba(0,0,0,0.8636) or #595959 7:1

*/
