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
    '.buyButton': {
      textTransform: 'uppercase',
      textDecoration: 'none',
      backgroundColor: 'rgba(0, 143, 74, 0.1)',
      border: `1px solid ${theme.colors.darkerGreen}`,
      color: theme.colors.darkerGreen,
      '&:hover': {
        backgroundColor: theme.colors.darkerGreen,
        color: theme.colors.white.DEFAULT,
      },
      '&.selected': {
        backgroundColor: theme.colors.darkerGreen,
        color: theme.colors.white.DEFAULT,
      },
    },
    '.buyButtonDark': {
      color: theme.colors.darkerGreen,
      '&:hover': {
        color: theme.colors.black.DEFAULT,
      },
      '&.selected': {
        color: theme.colors.black.DEFAULT,
      },
    },
    '.sellButton': {
      textTransform: 'uppercase',
      textDecoration: 'none',
      backgroundColor: 'rgba(255, 8, 126, 0.1)',
      border: `1px solid ${theme.colors.pink}`,
      color: theme.colors.pink,
      '&:hover': {
        color: theme.colors.white.DEFAULT,
        backgroundColor: theme.colors.pink,
      },
      '&.selected': {
        backgroundColor: theme.colors.pink,
        color: theme.colors.white.DEFAULT,
      },
    },
    '.sellButtonDark': {
      color: theme.colors.pink,
      '&:hover': {
        color: theme.colors.black.DEFAULT,
      },
      '&.selected': {
        color: theme.colors.black.DEFAULT,
      },
    },
    '.tooltip-content': {
      '& > div': {
        fontSize: '12px',
        borderColor: theme.colors.black.DEFAULT,
        borderWeight: '1px',
        backgroundColor: 'rgb(220, 220, 200)',
        borderRadius: '7px',
        color: '#333333',
      },
      '& svg[width="10"]': {
        fill: theme.colors.black.DEFAULT,
      },
      '& svg[width="8"]': {
        fill: 'rgb(220, 220, 200)',
      },
    },
    '.tooltip-content-dark': {
      '& > div': {
        borderColor: theme.colors.white.DEFAULT,
      },
      '& svg[width="10"]': {
        fill: theme.colors.white.DEFAULT,
      },
    },
  });
});

module.exports = vegaCustomClassesLite;
