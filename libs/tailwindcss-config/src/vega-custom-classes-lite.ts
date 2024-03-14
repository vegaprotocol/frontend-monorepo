import plugin from 'tailwindcss/plugin';
import colors from 'tailwindcss/colors';
import { themeLite } from './theme-lite';

export const vegaCustomClassesLite = plugin(function ({ addUtilities }) {
  addUtilities({
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
      backgroundColor: colors.neutral[900],
      marginTop: '10px',
      marginRight: '5px',
    },
    '.buyButton': {
      textTransform: 'uppercase',
      textDecoration: 'none',
      backgroundColor: 'rgba(0, 143, 74, 0.1)',
      border: `1px solid ${themeLite.colors.darkerGreen}`,
      color: themeLite.colors.darkerGreen,
      '&:hover': {
        backgroundColor: themeLite.colors.darkerGreen,
        color: colors.white,
      },
      '&.selected': {
        backgroundColor: themeLite.colors.darkerGreen,
        color: colors.white,
      },
    },
    '.buyButtonDark': {
      color: themeLite.colors.darkerGreen,
      '&:hover': {
        color: colors.black,
      },
      '&.selected': {
        color: colors.black,
      },
    },
    '.sellButton': {
      textTransform: 'uppercase',
      textDecoration: 'none',
      backgroundColor: 'rgba(255, 8, 126, 0.1)',
      border: `1px solid ${themeLite.colors.pink}`,
      color: themeLite.colors.pink,
      '&:hover': {
        color: colors.white,
        backgroundColor: themeLite.colors.pink,
      },
      '&.selected': {
        backgroundColor: themeLite.colors.pink,
        color: colors.white,
      },
    },
    '.sellButtonDark': {
      color: themeLite.colors.pink,
      '&:hover': {
        color: colors.black,
      },
      '&.selected': {
        color: colors.black,
      },
    },
    // '.tooltip-content': {
    //   '& > div': {
    //     fontSize: '12px',
    //     borderWeight: '1px',
    //     borderRadius: '7px',
    //     borderColor: theme.colors.black.DEFAULT,
    //     backgroundColor: theme.colors.black.DEFAULT,
    //     color: theme.colors.white.DEFAULT,
    //   },
    //   '& svg[width="10"]': {
    //     fill: theme.colors.black.DEFAULT,
    //   },
    //   '& svg[width="8"]': {
    //     fill: theme.colors.black.DEFAULT,
    //   },
    // },
    // '.tooltip-content-dark': {
    //   '& > div': {
    //     borderColor: theme.colors.black.DEFAULT,
    //     backgroundColor: '#dcdcc8',
    //     color: '#333333',
    //   },
    //   '& svg[width="10"]': {
    //     fill: theme.colors.white.DEFAULT,
    //   },
    //   '& svg[width="8"]': {
    //     fill: '#dcdcc8',
    //   },
    // },
  });
});
