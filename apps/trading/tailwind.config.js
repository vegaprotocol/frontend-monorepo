const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');
const theme = require('../../libs/tailwindcss-config/src/theme');
const vegaCustomClasses = require('../../libs/tailwindcss-config/src/vega-custom-classes');

module.exports = {
  content: [
    join(__dirname, 'pages/**/*.{js,ts,jsx,tsx}'),
    join(__dirname, 'client-pages/**/*.{js,ts,jsx,tsx}'),
    join(__dirname, 'components/**/*.{js,ts,jsx,tsx}'),
    'libs/ui-toolkit/src/utils/shared.ts',
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    extend: {
      ...theme,
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        ...theme.colors,
      },
      backgroundImage: {
        ...theme.backgroundImage,
        rainbow:
          'linear-gradient(103.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
        'rainbow-180':
          'linear-gradient(283.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
        highlight:
          'linear-gradient(170deg, var(--tw-gradient-from), transparent var(--tw-gradient-to-position))',
      },
      keyframes: {
        ...theme.keyframes,
        shake: {
          '0%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(5px)' },
          '50%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
          '100%': { transform: 'translateX(0)' },
        },
        'spin-rainbow-180': {
          '0%': {
            backgroundImage:
              'linear-gradient(103.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '10%': {
            backgroundImage:
              'linear-gradient(121.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '20%': {
            backgroundImage:
              'linear-gradient(139.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '30%': {
            backgroundImage:
              'linear-gradient(157.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '40%': {
            backgroundImage:
              'linear-gradient(175.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '50%': {
            backgroundImage:
              'linear-gradient(193.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '60%': {
            backgroundImage:
              'linear-gradient(211.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '70%': {
            backgroundImage:
              'linear-gradient(229.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '80%': {
            backgroundImage:
              'linear-gradient(247.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '90%': {
            backgroundImage:
              'linear-gradient(265.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '100%': {
            backgroundImage:
              'linear-gradient(283.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
        },
        'spin-rainbow-360': {
          '0%': {
            backgroundImage:
              'linear-gradient(103.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '5%': {
            backgroundImage:
              'linear-gradient(121.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '10%': {
            backgroundImage:
              'linear-gradient(139.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '15%': {
            backgroundImage:
              'linear-gradient(157.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '20%': {
            backgroundImage:
              'linear-gradient(175.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '25%': {
            backgroundImage:
              'linear-gradient(193.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '30%': {
            backgroundImage:
              'linear-gradient(211.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '35%': {
            backgroundImage:
              'linear-gradient(229.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '40%': {
            backgroundImage:
              'linear-gradient(247.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '45%': {
            backgroundImage:
              'linear-gradient(265.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '50%': {
            backgroundImage:
              'linear-gradient(283.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '55%': {
            backgroundImage:
              'linear-gradient(301.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '60%': {
            backgroundImage:
              'linear-gradient(319.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '65%': {
            backgroundImage:
              'linear-gradient(337.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '70%': {
            backgroundImage:
              'linear-gradient(355.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '75%': {
            backgroundImage:
              'linear-gradient(13.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '80%': {
            backgroundImage:
              'linear-gradient(31.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '85%': {
            backgroundImage:
              'linear-gradient(49.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '90%': {
            backgroundImage:
              'linear-gradient(67.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '95%': {
            backgroundImage:
              'linear-gradient(85.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
          '100%': {
            backgroundImage:
              'linear-gradient(103.47deg, #FF077F 1.68%, #8028FF 47.49%, #0075FF 100%)',
          },
        },
      },
      animation: {
        ...theme.animation,
        shake: 'shake 200ms linear',
        'spin-rainbow': 'spin-rainbow-180 500ms linear',
        'rotate-rainbow': 'spin-rainbow-360 1000ms linear',
      },
    },
  },
  plugins: [vegaCustomClasses],
};
