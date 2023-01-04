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
    transparent: 'transparent',
    current: 'currentColor',
    vega: {
      yellow: '#DFFF0B',
      'yellow-dark': '#B6DC26',
      pink: '#FF077F',
      'pink-dark': '#D70068',
      green: '#00F780',
      'green-dark': '#008545',
      red: '#FF261A',
      'red-dark': '#EB001B',
      orange: '#FF7A1A',
      blue: '#1DA2FB',
    },
    danger: '#FF261A',
    warning: '#FF7A1A',
    success: '#00F780',
  },
  fontFamily: {
    mono: ['Roboto Mono', 'monospace'],
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
  keyframes: {
    rotate: {
      '0%': {
        transform: 'rotate(0deg)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
      },
      '100%': {
        transform: 'rotate(360deg)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
      },
    },
    wave: {
      '0%': { transform: 'rotate( 0.0deg)' },
      '10%': { transform: 'rotate(14.0deg)' },
      '20%': { transform: 'rotate(-8.0deg)' },
      '30%': { transform: 'rotate(14.0deg)' },
      '40%': { transform: 'rotate(-4.0deg)' },
      '50%': { transform: 'rotate(10.0deg)' },
      '60%': { transform: 'rotate( 0.0deg)' },
      '100%': { transform: 'rotate( 0.0deg)' },
    },
  },
  animation: {
    rotate: 'rotate 2s linear alternate infinite',
    'rotate-back': 'rotate 2s linear reverse infinite',
    wave: 'wave 2s linear infinite',
  },
};
