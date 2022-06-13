export enum Intent {
  None,
  Danger,
  Primary,
  Warning,
  Selected,
  Prompt,
  Success,
  Help,
  Highlight,
}

export const getIntentShadow = (intent?: Intent) => {
  return {
    'shadow-callout': true,
    'shadow-danger': intent === Intent.Danger,
    'shadow-warning': intent === Intent.Warning,
    'shadow-selected': intent === Intent.Selected,
    'shadow-black dark:shadow-prompt': intent === Intent.Prompt,
    'shadow-success': intent === Intent.Success,
    'shadow-help': intent === Intent.Help,
    'shadow-black dark:shadow-white': intent === Intent.None,
    'shadow-vega-pink dark:shadow-vega-yellow': intent === Intent.Primary,
  };
};

export const getVariantBackground = (variant?: Intent) => {
  return {
    'bg-black dark:bg-white': variant === Intent.None,
    'bg-vega-pink text-black dark:bg-vega-yellow dark:text-black-normal':
      variant === Intent.Primary,
    'bg-danger text-white': variant === Intent.Danger,
    'bg-warning text-black': variant === Intent.Warning,
    'bg-prompt text-black': variant === Intent.Prompt,
    'bg-success text-black': variant === Intent.Success,
    'bg-help text-white': variant === Intent.Help,
    'bg-highlight text-black': variant === Intent.Highlight,
  };
};
