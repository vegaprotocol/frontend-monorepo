import plugin from 'tailwindcss/plugin';
import theme from './theme';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vegaCustomClasses = plugin(function ({ addUtilities }: {addUtilities: any}) {
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
      color: theme.colors.black[70],
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
    '.input-border': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderTopColor: theme.colors.black['60'],
      borderLeftColor: theme.colors.black['60'],
      borderRightColor: theme.colors.black['40'],
      borderBottomColor: theme.colors.black['40'],
    },
    '.input-border-dark': {
      borderWidth: '1px',
      borderStyle: 'solid',
      borderTopColor: theme.colors.white['40'],
      borderLeftColor: theme.colors.white['40'],
      borderRightColor: theme.colors.white['60'],
      borderBottomColor: theme.colors.white['60'],
    },
    '.color-scheme-dark': {
      colorScheme: 'dark',
    },
    '.clip-path-rounded': {
      clipPath: 'circle(50%)',
    },
  });
});

export default vegaCustomClasses;
