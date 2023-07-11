const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const theme = require('../../libs/tailwindcss-config/src/theme-lite');
const vegaCustomClasses = require('../../libs/tailwindcss-config/src/vega-custom-classes');
const vegaCustomClassesLite = require('../../libs/tailwindcss-config/src/vega-custom-classes-lite');

module.exports = {
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    'libs/ui-toolkit/src/utils/shared.ts',
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    ...theme,
    colors: {
      ...theme.colors,
      greys: {
        light: {
          100: '#F0F0F0',
          200: '#D2D2D2',
          300: '#A7A7A7',
          400: '#626262',
        },
      },
    },
  },
  plugins: [vegaCustomClasses, vegaCustomClassesLite],
};
