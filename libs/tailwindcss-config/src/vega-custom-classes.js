const plugin = require('tailwindcss/plugin');

const vegaCustomClasses = plugin(function ({ addUtilities }) {
  addUtilities({
    '.calt': {
      fontFeatureSettings: "'calt'",
    },
  });
});

module.exports = vegaCustomClasses;
