const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');
const theme = require('./theme');

const vegaCustomClasses = plugin(function ({ addUtilities }) {
  addUtilities({
    '.calt': {
      fontFeatureSettings: "'calt'",
    },
    '.syntax-highlighter-wrapper .hljs': {
      fontSize: '1rem',
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      display: 'block',
      overflowX: 'auto',
      padding: '1em',
      background: colors.white,
      color: colors.neutral[700],
      border: `1px solid #${colors.neutral[400]}`,
    },
    '.dark .syntax-highlighter-wrapper .hljs': {
      background: '#2C2C2C',
      color: theme.colors.vega.green,
    },
    '.syntax-highlighter-wrapper .hljs-literal': {
      color: theme.colors.vega.pink,
    },
    '.syntax-highlighter-wrapper .hljs-number': {
      color: theme.colors.vega.orange,
    },
    '.syntax-highlighter-wrapper .hljs-string': {
      color: theme.colors.vega.blue,
    },
    '.clip-path-rounded': {
      clipPath: 'circle(50%)',
    },
  });
});

module.exports = vegaCustomClasses;
