const plugin = require('tailwindcss/plugin');
const theme = require('./theme-lite');

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
    '.percent-change-up::before': {
      content: ' ',
      display: 'block',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderBottom: '4px solid',
      marginBottom: '11px',
      marginRight: '5px',
    },
    '.percent-change-down::before': {
      content: ' ',
      display: 'block',
      borderLeft: '4px solid transparent',
      borderRight: '4px solid transparent',
      borderTop: '4px solid',
      marginTop: '11px',
      marginRight: '5px',
    },
    '.percent-change-unchanged::before': {
      content: ' ',
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      backgroundColor: theme.colors.black[10],
      marginTop: '10px',
      marginRight: '5px',
    },
  });
});

module.exports = vegaCustomClassesLite;
