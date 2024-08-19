export const theme = {
  fontSize: {
    '2xs': '0.625rem',
  },
  screens: {
    xs: '500px',
    sm: '640px',
    md: '768px',
    lg: '960px',
    xl: '1280px',
    xxl: '1440px',
    xxxl: '1800px',
  },
  borderRadius: {
    'button-xs': 'var(--button-border-radius-xs)',
    'button-sm': 'var(--button-border-radius-sm)',
    'button-md': 'var(--button-border-radius-md)',
    'button-lg': 'var(--button-border-radius-lg)',
  },
  borderWidth: {
    999: 'var(--button-border-width)',
  },
  colors: {
    gs: {
      '0': 'rgb(var(--gs-0) / <alpha-value>)',
      '50': 'rgb(var(--gs-50) / <alpha-value>)',
      '100': 'rgb(var(--gs-100) / <alpha-value>)',
      '200': 'rgb(var(--gs-200) / <alpha-value>)',
      '300': 'rgb(var(--gs-300) / <alpha-value>)',
      '400': 'rgb(var(--gs-400) / <alpha-value>)',
      DEFAULT: 'rgb(var(--gs-500) / <alpha-value>)',
      '500': 'rgb(var(--gs-500) / <alpha-value>)',
      '600': 'rgb(var(--gs-600) / <alpha-value>)',
      '700': 'rgb(var(--gs-700) / <alpha-value>)',
      '800': 'rgb(var(--gs-800) / <alpha-value>)',
      '900': 'rgb(var(--gs-900) / <alpha-value>)',
      '950': 'rgb(var(--gs-950) / <alpha-value>)',
    },
    surface: {
      '0': {
        DEFAULT: 'rgb(var(--surface-0) / <alpha-value>)',
        fg: 'rgb(var(--surface-0-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--surface-1-fg-muted) / <alpha-value>)',
      },
      '1': {
        DEFAULT: 'rgb(var(--surface-1) / <alpha-value>)',
        fg: 'rgb(var(--surface-1-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--surface-1-fg-muted) / <alpha-value>)',
      },
      '2': {
        DEFAULT: 'rgb(var(--surface-2) / <alpha-value>)',
        fg: 'rgb(var(--surface-2-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--surface-2-fg-muted) / <alpha-value>)',
      },
      '3': {
        DEFAULT: 'rgb(var(--surface-3) / <alpha-value>)',
        fg: 'rgb(var(--surface-3-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--surface-3-fg-muted) / <alpha-value>)',
      },
    },
    intent: {
      none: {
        DEFAULT: 'rgb(var(--intent-none) / <alpha-value>)',
        foreground: 'rgb(var(--intent-none-foreground) / <alpha-value>)',
        background: 'rgb(var(--intent-none-background) / <alpha-value>)',
        outline: 'rgb(var(--intent-none-outline) / <alpha-value>)',
        from: 'rgb(var(--intent-none-from) / <alpha-value>)',
        to: 'rgb(var(--intent-none-to) / <alpha-value>)',
      },
      primary: {
        DEFAULT: 'rgb(var(--intent-primary) / <alpha-value>)',
        foreground: 'rgb(var(--intent-primary-foreground) / <alpha-value>)',
        background: 'rgb(var(--intent-primary-background) / <alpha-value>)',
        outline: 'rgb(var(--intent-primary-outline) / <alpha-value>)',
        from: 'rgb(var(--intent-primary-from) / <alpha-value>)',
        to: 'rgb(var(--intent-primary-to) / <alpha-value>)',
      },
      secondary: {
        DEFAULT: 'rgb(var(--intent-secondary) / <alpha-value>)',
        foreground: 'rgb(var(--intent-secondary-foreground) / <alpha-value>)',
        background: 'rgb(var(--intent-secondary-background) / <alpha-value>)',
        outline: 'rgb(var(--intent-secondary-outline) / <alpha-value>)',
        from: 'rgb(var(--intent-secondary-from) / <alpha-value>)',
        to: 'rgb(var(--intent-secondary-to) / <alpha-value>)',
      },
      danger: {
        DEFAULT: 'rgb(var(--intent-danger) / <alpha-value>)',
        foreground: 'rgb(var(--intent-danger-foreground) / <alpha-value>)',
        background: 'rgb(var(--intent-danger-background) / <alpha-value>)',
        outline: 'rgb(var(--intent-danger-outline) / <alpha-value>)',
      },
      info: {
        DEFAULT: 'rgb(var(--intent-info) / <alpha-value>)',
        foreground: 'rgb(var(--intent-info-foreground) / <alpha-value>)',
        background: 'rgb(var(--intent-info-background) / <alpha-value>)',
        outline: 'rgb(var(--intent-info-outline) / <alpha-value>)',
      },
      warning: {
        DEFAULT: 'rgb(var(--intent-warning) / <alpha-value>)',
        foreground: 'rgb(var(--intent-warning-foreground) / <alpha-value>)',
        background: 'rgb(var(--intent-warning-background) / <alpha-value>)',
        outline: 'rgb(var(--intent-warning-outline) / <alpha-value>)',
      },
      success: {
        DEFAULT: 'rgb(var(--intent-success) / <alpha-value>)',
        foreground: 'rgb(var(--intent-success-foreground) / <alpha-value>)',
        background: 'rgb(var(--intent-success-background) / <alpha-value>)',
        outline: 'rgb(var(--intent-success-outline) / <alpha-value>)',
      },
    },
    transparent: 'transparent',
    current: 'currentColor',
    black: '#000000',
    white: '#FFFFFF',
    market: {
      red: {
        // same as vega-red
        650: '#550016',
        DEFAULT: '#EC003C',
        300: '#FDD9DC',
      },
      green: {
        // same as vega-green
        650: '#015D30',
        600: '#01914B',
        550: '#01C566',
        DEFAULT: '#00F780',
        300: '#DDFEE8',
      },
    },
    vega: {
      // YELLOW
      yellow: {
        700: '#23290E',
        650: '#515E1E',
        600: '#7E932F',
        550: '#ABC840',
        DEFAULT: '#D7FB50',
        500: '#D7FB50',
        450: '#E0FC75',
        400: '#E8FD9A',
        350: '#F0FDBE',
        300: '#F9FEE3',
      },

      // GREEN
      green: {
        700: '#012915',
        650: '#015D30',
        600: '#008545',
        550: '#01C566',
        DEFAULT: '#00F780',
        500: '#00F780',
        450: '#37F99B',
        400: '#6CFAB6',
        350: '#A1FCD0',
        300: '#D6FEEB',
      },

      // BLUE
      blue: {
        700: '#01142A',
        650: '#012C60',
        600: '#014595',
        550: '#015ECB',
        DEFAULT: '#0075FF',
        500: '#0075FF',
        450: '#3793FF',
        400: '#6CAFFF',
        350: '#A1CCFF',
        300: '#D6E9FF',
      },

      // PURPLE
      purple: {
        700: '#15072A',
        650: '#301060',
        600: '#4B1895',
        550: '#6620CB',
        DEFAULT: '#8028FF',
        500: '#8028FF',
        450: '#9B56FF',
        400: '#B683FF',
        350: '#D0B0FF',
        300: '#EBDDFF',
      },

      // PINK
      pink: {
        700: '#210215',
        650: '#600330',
        600: '#95054B',
        550: '#CB0666',
        DEFAULT: '#FF077F',
        500: '#FF077F',
        450: '#FF3C9A',
        400: '#FF70B5',
        350: '#FFA3D0',
        300: '#FFD7EA',
      },

      // RED
      red: {
        700: '#2F000C',
        650: '#550016',
        600: '#7B001F',
        550: '#B3002E',
        DEFAULT: '#EC003C',
        500: '#EC003C',
        450: '#F03D6B',
        400: '#F4668A',
        350: '#F78FA9',
        300: '#F8A3B9',
      },

      // ORANGE
      orange: {
        700: '#2A1701',
        650: '#603301',
        600: '#954F01',
        550: '#CB6C01',
        DEFAULT: '#FF8700',
        500: '#FF8700',
        450: '#FFA137',
        400: '#FFBA6C',
        350: '#FFD3A1',
        300: '#FFECD6',
      },

      // DARK
      dark: {
        100: '#161616',
        150: '#262626',
        200: '#404040',
        300: '#8B8B8B',
        400: '#C0C0C0',
      },

      // LIGHT
      light: {
        100: '#F0F0F0',
        150: '#E9E9E9',
        200: '#D2D2D2',
        300: '#939393',
        400: '#626262',
      },
    },
    danger: '#EC003C',
    warning: '#FF8700',
    success: '#00F780',
  },
  fontFamily: {
    mono: ['var(--font-mono)', { fontFeatureSettings: '"calt" 0, "liga" 0' }],
    sans: ['var(--font-sans)', { fontFeatureSettings: '"calt" 0, "liga" 0' }],
    alt: ['var(--font-alt)', { fontFeatureSettings: '"calt" 0, "liga" 0' }],
  },
  keyframes: {
    rotate: {
      '0%': {
        transform: 'rotate(0deg)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
      },
      '100%': {
        transform: 'rotate(360deg)',
        transformBox: 'fill-box',
        transformOrigin: 'center',
      },
    },
    wave: {
      '0%': { transform: 'rotate( 0.0deg)' },
      '10%': { transform: 'rotate(14.0deg)' },
      '20%': { transform: 'rotate(-8.0deg)' },
      '30%': { transform: 'rotate(14.0deg)' },
      '40%': { transform: 'rotate(-4.0deg)' },
      '50%': { transform: 'rotate(10.0deg)' },
      '60%': { transform: 'rotate( 0.0deg)' },
      '100%': { transform: 'rotate( 0.0deg)' },
    },
    progress: {
      from: { width: '0' },
      to: { width: '100%' },
    },
  },
  animation: {
    rotate: 'rotate 2s linear alternate infinite',
    'rotate-back': 'rotate 2s linear reverse infinite',
    wave: 'wave 2s linear infinite',
    progress: 'progress 5s cubic-bezier(.39,.58,.57,1) 1',
  },
  data: {
    selected: 'state~="checked"',
    open: 'state~="open"',
  },
};
