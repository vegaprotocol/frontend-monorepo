const plugin = require('tailwindcss/plugin');
const theme = require('./theme');

const vegaCustomClasses = plugin(function ({ addUtilities }) {
  addUtilities({
    '.calt': {
      fontFeatureSettings: "'calt'",
    },
    ':not(.dark) .hljs': {
      fontSize: '1rem',
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      display: 'block',
      overflowX: 'auto',
      padding: '1em',
      background: theme.colors.white.DEFAULT,
      color: theme.colors.intent.help,
      border: '1px solid #696969',
    },
    '.dark .hljs': {
      background: '#2C2C2C',
      color: theme.colors.vega.green,
    },
    ':not(.dark) .hljs-literal': {
      color: theme.colors.vega.pink,
    },
    ':not(.dark) .hljs-number': {
      color: theme.colors.intent.warning,
    },
    ':not(.dark) .hljs-string': {
      color: theme.colors.blue,
    },
  });
});

module.exports = vegaCustomClasses;
