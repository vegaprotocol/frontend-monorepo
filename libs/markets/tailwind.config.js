const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const theme = require('../tailwindcss-config/src/theme');
const vegaCustomClasses = require('../tailwindcss-config/src/vega-custom-classes');

module.exports = {
  content: [
    join(__dirname, 'src/**/*.{ts,tsx,html,mdx}'),
    join(__dirname, 'src/utils/shared.ts'),
    join(__dirname, '.storybook/preview.js'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    extend: theme,
  },
  plugins: [vegaCustomClasses],
};
