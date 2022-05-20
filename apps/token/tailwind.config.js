const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nrwl/next/tailwind');
const theme = require('../../libs/tailwindcss-config/src/theme');
const vegaCustomClasses = require('../../libs/tailwindcss-config/src/vega-custom-classes');

module.exports = {
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  darkMode: 'class',
  theme: {
    ...theme,
    extend: {
      backgroundImage: {
        clouds: "url('./images/clouds.png')",
        banner: "url('./images/banner.png')",
      },
      backgroundPosition: {
        clouds: '0 -300px',
      },
    },
  },
  plugins: [vegaCustomClasses],
};
