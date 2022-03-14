const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind');
const theme = require('../tailwindcss-config/src/theme');

module.exports = {
  content: [
    join(__dirname, 'src/**/*.{ts,tsx,html,mdx}'),
    join(__dirname, '.storybook/preview.js'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme,
  plugins: [],
};
