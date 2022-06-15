const defaultTheme = require('tailwindcss/defaultTheme');

const shadeOfGray = (shade) => {
  const decValue = Math.round((255 * shade) / 100);
  const hexValue = decValue.toString(16).padStart(2, '0');
  return `#${hexValue}${hexValue}${hexValue}`;
};

const colours = {
  transparent: 'transparent',
  current: 'currentColor',
  text: '#C7C7C7',
  deemphasise: '#8A9BA8',
  white: {
    DEFAULT: '#FFF',
    strong: '#FFF',
    normal: '#F5F8FA',
    muted: '#676767',
    '02': shadeOfGray(2),
    '05': shadeOfGray(5),
    10: shadeOfGray(10),
    25: shadeOfGray(25),
    40: shadeOfGray(40),
    60: shadeOfGray(60),
    80: shadeOfGray(80),
    90: shadeOfGray(90),
    95: shadeOfGray(95),
    100: shadeOfGray(100),
  },
  black: {
    DEFAULT: '#000',
    strong: '#000',
    normal: '#000',
    muted: '#BFCCD6',
    '02': shadeOfGray(100 - 2),
    '05': shadeOfGray(100 - 5),
    10: shadeOfGray(100 - 10),
    25: shadeOfGray(100 - 25),
    40: shadeOfGray(100 - 40),
    50: shadeOfGray(100 - 50),
    60: shadeOfGray(100 - 60),
    80: shadeOfGray(100 - 80),
    90: shadeOfGray(100 - 90),
    95: shadeOfGray(100 - 95),
    100: shadeOfGray(100 - 100),
  },
  vega: {
    yellow: '#DFFF0B',
    'yellow-dark': '#474B0A',
    pink: '#FF077F',
    green: '#00F780',
    'green-medium': '#00DE73',
    'green-dark': '#008545',
    red: '#FF261A',
    'red-dark': '#EB001B',
  },
  blue: '#1DA2FB',
  coral: '#FF6057',
  pink: '#FF2D5E',
  orange: '#D9822B',
  danger: '#FF261A',
  warning: '#FF7A1A',
  selected: '#DFFF0B',
  success: '#00F780',
  help: '#494949',
  highlight: '#E5E5E5',
  prompt: '#FFFFFF',
  'danger-bg': '#9E0025', // for white text
};

const boxShadowPosition = {
  outer: '2px 2px 0 0',
  insetUnderline: 'inset 0 -2px 0 0',
  insetShading: 'inset 2px 2px 6px',
};

module.exports = {
  screens: {
    xs: '500px',
    sm: '640px',
    md: '768px',
    lg: '960px',
    xl: '1280px',
    xxl: '1536px',
  },
  colors: {
    ...colours,
  },
  spacing: {
    0: '0px',
    2: '0.125rem',
    4: '0.25rem',
    5: '0.3125rem',
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
    2: '2px',
    4: '4px',
    7: '7px',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    DEFAULT: '0.225rem',
    md: '0.3rem',
    lg: '0.5rem',
    full: '100%',
  },
  fontFamily: {
    mono: ['Roboto Mono', ...defaultTheme.fontFamily.mono],
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
    focus: '0px 0px 0px 1px #FFFFFF, 0px 0px 3px 2px #FFE600',
    'focus-dark': '0px 0px 0px 1px #000000, 0px 0px 3px 2px #FFE600',
    intent: `${boxShadowPosition.outer}`,
    'vega-yellow': `${boxShadowPosition.outer} ${colours.vega.yellow}`,
    'vega-pink': `${boxShadowPosition.outer} ${colours.vega.pink}`,
    'inset-black': `${boxShadowPosition.insetUnderline} ${colours.black.DEFAULT}`,
    'inset-white': `${boxShadowPosition.insetUnderline} ${colours.white.DEFAULT}`,
    'inset-vega-yellow': `${boxShadowPosition.insetUnderline} ${colours.vega.yellow}`,
    'inset-vega-pink': `${boxShadowPosition.insetUnderline} ${colours.vega.pink}`,
    'inset-danger': `${boxShadowPosition.insetUnderline} ${colours.danger}`,
    input: `${boxShadowPosition.insetShading} ${colours.white['80']}`,
    'input-dark': `${boxShadowPosition.insetShading} ${colours.black['80']}`,
    'input-focus': `${boxShadowPosition.insetShading} ${colours.white['80']}, ${boxShadowPosition.insetUnderline} ${colours.vega.pink}`,
    'input-focus-dark': `${boxShadowPosition.insetShading} ${colours.black['80']}, ${boxShadowPosition.insetUnderline} ${colours.vega.yellow}`,
    'input-focus-error': `${boxShadowPosition.insetShading} ${colours.white['80']}, ${boxShadowPosition.insetUnderline} ${colours.danger}`,
    'input-focus-error-dark': `${boxShadowPosition.insetShading} ${colours.black['80']}, ${boxShadowPosition.insetUnderline} ${colours.danger}`,
    'checkbox-focus': `${boxShadowPosition.insetShading} ${colours.white['80']}, ${boxShadowPosition.outer} ${colours.vega.pink}`,
    'checkbox-focus-dark': `${boxShadowPosition.insetShading} ${colours.black['80']}, ${boxShadowPosition.outer} ${colours.vega.yellow}`,
  },
  backgroundImage: {
    'fairground-nav': "url('https://static.vega.xyz/fairground-nav-bg.jpg')",
  },
};
