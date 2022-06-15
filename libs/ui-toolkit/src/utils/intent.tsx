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
    'shadow-intent': true,
    'shadow-danger': intent === Intent.Danger,
    'shadow-warning': intent === Intent.Warning,
    'shadow-selected': intent === Intent.Selected,
    'shadow-prompt dark:shadow-prompt-dark':
      intent === Intent.Prompt ||
      intent === Intent.None ||
      intent === Intent.Primary,
    'shadow-success': intent === Intent.Success,
    'shadow-help': intent === Intent.Help,
  };
};

export const getIntentBorder = (intent?: Intent) => {
  return {
    border: true,
    'border-danger': intent === Intent.Danger,
    'border-warning': intent === Intent.Warning,
    'border-selected': intent === Intent.Selected,
    'border-prompt dark:border-prompt-dark':
      intent === Intent.Prompt ||
      intent === Intent.None ||
      intent === Intent.Primary,
    'border-success': intent === Intent.Success,
    'border-help': intent === Intent.Help,
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
