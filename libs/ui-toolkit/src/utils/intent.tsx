export enum Intent {
  None,
  Primary,
  Success,
  Warning,
  Danger,
}

export const getIntentShadow = (intent?: Intent) => {
  return {
    'shadow-callout': true,
    'shadow-danger': intent === Intent.Danger,
    'shadow-warning': intent === Intent.Warning,
    'shadow-success': intent === Intent.Success,
    'shadow-black dark:shadow-white': intent === Intent.None,
    'shadow-vega-pink dark:shadow-vega-yellow': intent === Intent.Primary,
  };
};

export const getVariantBackground = (variant?: Intent) => {
  return {
    'bg-black text-white dark:bg-white dark:text-black':
      variant === Intent.None,
    'bg-vega-pink text-black dark:bg-vega-yellow dark:text-black-normal':
      variant === Intent.Primary,
    'bg-danger text-white': variant === Intent.Danger,
    'bg-warning text-black': variant === Intent.Warning,
    'bg-success text-black': variant === Intent.Success,
  };
};
