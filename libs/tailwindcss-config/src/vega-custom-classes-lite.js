const plugin = require('tailwindcss/plugin');

const vegaCustomClassesLite = plugin(function ({ addUtilities }) {
  addUtilities({
    '.input-border': {
      borderWidth: '0',
    },
    '.input-border-dark': {
      borderWidth: '0',
    },
    '.shadow-input': {
      boxShadow: 'none',
    },
  });
});

module.exports = vegaCustomClassesLite;
