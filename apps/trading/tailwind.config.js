const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind');
const theme = require('../../libs/tailwindcss-config/src/theme');

module.exports = {
  content: [
    join(__dirname, '{pages,components}/**/*.{js,ts,jsx,tsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme,
  plugins: [],
};
