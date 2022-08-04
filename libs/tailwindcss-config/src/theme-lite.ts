import theme from './theme';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  ...theme,
  colors: {
    ...theme.colors,
    offBlack: '#252525',
    midGrey: '#828282',
    borderGrey: '#4f4f4f',
    lightGrey: '#F2F2F2',
    lightGreen: '#00f780',
    darkerGreen: '#008f4A',
    yellow: '#DFFF0B',
    mint: '#00F780',
    pink: '#FF077F',
    blue: '#2E6DE5',
    vega: {
      ...theme.colors.vega,
      'highlight-item': '#000',
      'highlight-item-dark': '#fff',
    },
    'dropdown-bg-dark': theme.colors.black['100'],
    lite: {
      black: '#080808',
    },
  },
  fontSize: {
    ...defaultTheme.fontSize,
    capMenu: ['15px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
    market: ['15px', { lineHeight: '24px' }],
    'ui-small': ['12px', { lineHeight: '14px' }],
    'ui-tiny': ['10px', { lineHeight: '18px' }],
  },
  boxShadow: {
    ...theme.boxShadow,
    'inset-black': '',
    'inset-white': '',
    input: 'none',
    'input-focus': 'none',
    'input-dark': 'none',
    'input-focus-dark': 'none',
    'input-focus-error': 'none',
    'input-focus-error-dark': 'none',
  },
  extend: {
    transitionProperty: {
      height: 'height',
      'max-height': 'max-height',
    },
  },
};
