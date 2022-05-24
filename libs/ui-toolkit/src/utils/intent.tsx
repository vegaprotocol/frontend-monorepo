export enum Intent {
  Danger = 'danger',
  Warning = 'warning',
  Selected = 'selected',
  Prompt = 'prompt',
  Success = 'success',
  Help = 'help',
}

export enum TailwindIntents {
  Danger = 'danger',
  Warning = 'warning',
  Selected = 'selected',
  Prompt = 'prompt',
  Success = 'success',
  Help = 'help',
  Highlight = 'highlight',
}

export const getIntentShadow = (intent?: Intent) => {
  return {
    'shadow-callout': true,
    'shadow-intent-danger': intent === Intent.Danger,
    'shadow-intent-warning': intent === Intent.Warning,
    'shadow-intent-selected': intent === Intent.Selected,
    'shadow-black dark:shadow-intent-prompt': intent === Intent.Prompt,
    'shadow-intent-success': intent === Intent.Success,
    'shadow-intent-help': intent === Intent.Help,
  };
};

export const getVariantBackground = (variant?: TailwindIntents) => {
  return {
    'bg-intent-danger text-white': variant === TailwindIntents.Danger,
    'bg-intent-warning text-black': variant === TailwindIntents.Warning,
    'bg-intent-prompt text-black': variant === TailwindIntents.Prompt,
    'bg-intent-success text-black': variant === TailwindIntents.Success,
    'bg-intent-help text-white': variant === TailwindIntents.Help,
    'bg-intent-highlight text-black': variant === TailwindIntents.Highlight,
  };
};
