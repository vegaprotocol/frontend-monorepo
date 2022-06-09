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
    '.input-border': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderTopColor: theme.colors.black['60'],
      borderLeftColor: theme.colors.black['60'],
      borderRightColor: theme.colors.black['40'],
      borderBottomColor: theme.colors.black['40'],
    },
    '.dark-input-border': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderTopColor: theme.colors.white['40'],
      borderLeftColor: theme.colors.white['40'],
      borderRightColor: theme.colors.white['60'],
      borderBottomColor: theme.colors.white['60'],
    },
    '.shadow-vega-yellow': {
      boxShadow: `2px 2px 0 0 ${theme.colors.vega.yellow}`,
    },
    '.shadow-vega-pink': {
      boxShadow: `2px 2px 0 0 ${theme.colors.vega.pink}`,
    },
    '.inset-shadow-black': {
      boxShadow: `inset 0 -2px 0 0 ${theme.colors.black.DEFAULT}`,
    },
    '.inset-shadow-white': {
      boxShadow: `inset 0 -2px 0 0 ${theme.colors.white.DEFAULT}`,
    },
    '.inset-shadow-vega-yellow': {
      boxShadow: `inset 0 -2px 0 0 ${theme.colors.vega.yellow}`,
    },
    '.inset-shadow-vega-pink': {
      boxShadow: `inset 0 -2px 0 0 ${theme.colors.vega.pink}`,
    },
    '.input-shadow': {
      boxShadow: `inset 2px 2px 6px ${theme.colors.black['25']}`,
    },
    '.input-shadow-focus': {
      boxShadow: `inset 2px 2px 6px ${theme.colors.black['25']}, inset 0 -2px 0 0 ${theme.colors.vega.yellow}`,
    },
    '.input-shadow-focus-error': {
      boxShadow: `inset 2px 2px 6px ${theme.colors.black['25']}, inset 0 -2px 0 0 ${theme.colors.intent.danger}`,
    },
    '.checkbox-focus-shadow': {
      boxShadow: `inset 2px 2px 6px ${theme.colors.black['25']}, 2px 2px 0 0 ${theme.colors.vega.pink}`,
    },
    '.dark-checkbox-focus-shadow': {
      boxShadow: `inset 2px 2px 6px ${theme.colors.black['25']}, 2px 2px 0 0 ${theme.colors.vega.yellow}`,
    },
    '.color-scheme-dark': {
      colorScheme: 'dark',
    },
  });
});

module.exports = vegaCustomClasses;
