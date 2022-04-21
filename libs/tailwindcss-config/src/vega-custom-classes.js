const plugin = require('tailwindcss/plugin');
const theme = require('./theme');

const vegaCustomClasses = plugin(function ({ addUtilities }) {
  addUtilities({
    '.calt': {
      fontFeatureSettings: "'calt'",
    },
    '.sh-wrapper .hljs': {
      fontSize: '1rem',
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      display: 'block',
      overflowX: 'auto',
      padding: '1em',
      background: theme.colors.white.DEFAULT,
      color: theme.colors.intent.help,
      border: '1px solid #696969',
    },
    '.dark .sh-wrapper .hljs': {
      background: '#2C2C2C',
      color: theme.colors.vega.green,
    },
    '.sh-wrapper .hljs-literal': {
      color: theme.colors.vega.pink,
    },
    '.sh-wrapper .hljs-number': {
      color: theme.colors.intent.warning,
    },
    '.sh-wrapper .hljs-string': {
      color: theme.colors.blue,
    },
  });
});

module.exports = vegaCustomClasses;
