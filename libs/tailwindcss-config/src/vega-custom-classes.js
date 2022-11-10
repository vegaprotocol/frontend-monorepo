const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');
const theme = require('./theme');

const vegaCustomClasses = plugin(function ({ addUtilities }) {
  addUtilities({
    '.calt': {
      fontFeatureSettings: "'calt'",
    },
    '.liga-0-calt-0': {
      fontFeatureSettings: "'liga' 0, 'calt' 0",
    },
    '.syntax-highlighter-wrapper .hljs': {
      fontSize: '1rem',
      fontFamily: "Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
      display: 'block',
      overflowX: 'auto',
      padding: '1em',
      background: colors.white,
      color: colors.neutral[700],
      border: `1px solid ${colors.neutral[300]}`,
    },
    '.dark .syntax-highlighter-wrapper .hljs': {
      background: colors.neutral[800],
      color: theme.colors.vega.green,
      border: 0,
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
    '.color-scheme-dark': {
      colorScheme: 'dark',
    },
    '.rtl-dir': {
      direction: 'rtl',
    },
  });
});

module.exports = vegaCustomClasses;
