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
      color: theme.colors.intent.help,
      border: '1px solid #696969',
    },
    '.dark .syntax-highlighter-wrapper .hljs': {
      background: '#2C2C2C',
      color: theme.colors.vega.green,
    },
    '.syntax-highlighter-wrapper .hljs-literal': {
      color: theme.colors.vega.pink,
    },
    '.syntax-highlighter-wrapper .hljs-number': {
      color: theme.colors.intent.warning,
    },
    '.syntax-highlighter-wrapper .hljs-string': {
      color: theme.colors.blue,
    },
    '.vega-input-shadow': {
      boxShadow: `inset 2px 2px 6px ${theme.colors.black['25']}`,
    },
    '.vega-input-shadow-focus': {
      boxShadow: `inset 2px 2px 6px ${theme.colors.black['25']}, inset 0 -2px 0 0 ${theme.colors.vega.yellow}`,
    },
    '.vega-input-shadow-focus-error': {
      boxShadow: `inset 2px 2px 6px ${theme.colors.black['25']}, inset 0 -2px 0 0 ${theme.colors.intent.danger}`,
    },
    '.trading-nav-shadow-black': {
      boxShadow: `inset 0 -2px 0 0 ${theme.colors.black.DEFAULT}`,
    },
    '.trading-nav-shadow-white': {
      boxShadow: `inset 0 -2px 0 0 ${theme.colors.white.DEFAULT}`,
    },
    '.trading-nav-shadow-vega-yellow': {
      boxShadow: `inset 0 -2px 0 0 ${theme.colors.vega.yellow}`,
    },
    '.trading-nav-shadow-vega-pink': {
      boxShadow: `inset 0 -2px 0 0 ${theme.colors.vega.pink}`,
    },
  });
});

module.exports = vegaCustomClasses;
