import plugin from 'tailwindcss/plugin';
import colors from 'tailwindcss/colors';
import { theme } from './theme';

export const vegaCustomClasses = plugin(function ({ addUtilities }) {
  addUtilities({
    '.calt': {
      fontFeatureSettings: "'calt'",
    },
    '.liga': {
      fontFeatureSettings: "'liga'",
    },
    // Fix for Firefox to make it inherit font-feature-settings from the default theme
    'button, input, optgroup, select, textarea': {
      fontFeatureSettings: 'inherit',
    },
    '.syntax-highlighter-wrapper .hljs': {
      fontSize: '1rem',
      fontFamily: "'Roboto Mono', monospace",
      display: 'block',
      overflowX: 'auto',
      padding: '1em',
      background: colors.white,
      color: colors.neutral[700],
      border: `1px solid ${colors.neutral[300]}`,
      borderRadius: '0.5rem',
    },
    '.syntax-highlighter-wrapper-sm .hljs': {
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
    '.dark .syntax-highlighter-wrapper .hljs': {
      background: theme.colors.gs[900],
      color: theme.colors.green,
      border: '0',
    },
    '.syntax-highlighter-wrapper .hljs-literal': {
      color: theme.colors.pink,
    },
    '.syntax-highlighter-wrapper .hljs-number': {
      color: theme.colors.orange,
    },
    '.syntax-highlighter-wrapper .hljs-string': {
      color: theme.colors.blue,
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
    '.dashed-background': {
      background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${colors.neutral[900]} 2px, ${colors.neutral[900]} 4px)`,
    },
    '.dark .dashed-background': {
      background: `repeating-linear-gradient(0deg, transparent, transparent 2px, ${colors.neutral[200]} 2px, ${colors.neutral[200]} 4px)`,
    },
  });
});
