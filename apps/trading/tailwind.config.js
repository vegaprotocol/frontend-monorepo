const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');
const { theme } = require('../../libs/tailwindcss-config/src/theme');
const {
  vegaCustomClasses,
} = require('../../libs/tailwindcss-config/src/vega-custom-classes');

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
