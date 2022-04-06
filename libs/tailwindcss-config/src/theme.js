const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  screens: {
    xs: '500px',
    sm: '640px',
    md: '768px',
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
    blue: '#1DA2FB',
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
      highlight: '#E5E5E5',
    },
    'intent-background': {
      danger: '#9E0025', // for white text
    },
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
    40: '2.5rem',
    44: '2.75rem',
    64: '4rem',
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
    100: '1',
  },
  borderWidth: {
    DEFAULT: '1px',
    1: '1px',
    4: '4px',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.225rem',
    md: '0.3rem',
    lg: '0.5rem',
    full: '9999px',
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
      'AlphaLyrae',
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
    'ui-small': ['12px', '16px'],
  },

  boxShadow: {
    callout: '5px 5px 0 1px rgba(255, 255, 255, 0.05)',
    focus: '0px 0px 0px 1px #FFFFFF, 0px 0px 3px 2px #FFE600',
    'focus-dark': '0px 0px 0px 1px #000000, 0px 0px 3px 2px #FFE600',
  },
};
