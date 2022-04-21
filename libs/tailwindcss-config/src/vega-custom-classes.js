const plugin = require('tailwindcss/plugin');
const theme = require('./theme');

const vegaCustomClasses = plugin(function ({ addUtilities }) {
  addUtilities({
    '.calt': {
      fontFeatureSettings: "'calt'",
    },
    '.vega-hl': {
      fontSize: '1rem',
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      display: 'block',
      overflowX: 'auto',
      padding: '1em',
      background: theme.colors.white.DEFAULT,
      color: theme.colors.intent.help,
      border: '1px solid #696969',
    },
    '.dark .vega-hl': {
      background: '#2C2C2C',
      color: theme.colors.vega.green,
    },
    '.vega-hl .hljs-literal': {
      color: theme.colors.vega.pink,
    },
    '.vega-hl .hljs-number': {
      color: theme.colors.intent.warning,
    },
    '.vega-hl .hljs-string': {
      color: theme.colors.blue,
    },
  });
});

module.exports = vegaCustomClasses;
