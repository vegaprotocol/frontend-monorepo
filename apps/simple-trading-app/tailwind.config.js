const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind');
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
  theme,
  plugins: [vegaCustomClasses, vegaCustomClassesLite],
};
