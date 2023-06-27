const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const theme = require('../../libs/tailwindcss-config/src/theme');
const vegaCustomClasses = require('../../libs/tailwindcss-config/src/vega-custom-classes');

module.exports = {
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    'libs/ui-toolkit/src/utils/shared.ts',
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    extend: theme,
  },
  plugins: [vegaCustomClasses],
};
