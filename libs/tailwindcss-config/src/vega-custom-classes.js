const plugin = require('tailwindcss/plugin');
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
      background: theme.colors.white.DEFAULT,
      color: theme.colors.black[25],
      border: `1px solid #${theme.colors.black[40]}`,
    },
    '.dark .syntax-highlighter-wrapper .hljs': {
      background: '#2C2C2C',
      color: theme.colors.vega.green,
    },
    '.syntax-highlighter-wrapper .hljs-literal': {
      color: theme.colors.vega.pink,
    },
    '.syntax-highlighter-wrapper .hljs-number': {
      color: theme.colors.warning,
    },
    '.syntax-highlighter-wrapper .hljs-string': {
      color: theme.colors.blue,
    },
  });
});

module.exports = vegaCustomClasses;
