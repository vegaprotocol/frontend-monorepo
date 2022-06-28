export enum Intent {
  None,
  Primary,
  Danger,
  Warning,
  Success,
}

export const getIntentShadow = (intent = Intent.None) => {
  return {
    'shadow-intent': true,
    'shadow-danger': intent === Intent.Danger,
    'shadow-warning': intent === Intent.Warning,
    'shadow-black dark:shadow-white':
      intent === Intent.None || intent === Intent.Primary,
    'shadow-success': intent === Intent.Success,
  };
};

export const getIntentBorder = (intent = Intent.None) => {
  return {
    border: true,
    'border-danger': intent === Intent.Danger,
    'border-warning': intent === Intent.Warning,
    'border-black dark:border-white':
      intent === Intent.None || intent === Intent.Primary,
    'border-success': intent === Intent.Success,
  };
};

export const getIntentTextAndBackground = (intent = Intent.None) => {
  return {
    'bg-black text-white dark:bg-white dark:text-black': intent === Intent.None,
    'bg-vega-pink text-black dark:bg-vega-yellow dark:text-black-normal':
      intent === Intent.Primary,
    'bg-danger text-white': intent === Intent.Danger,
    'bg-warning text-black': intent === Intent.Warning,
    'bg-success text-black': intent === Intent.Success,
  };
};
