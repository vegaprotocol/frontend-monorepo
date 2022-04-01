import classNames from 'classnames';

export enum Intent {
  Danger = 'danger',
  Warning = 'warning',
  Prompt = 'prompt',
  Progress = 'progress',
  Success = 'success',
  Help = 'help',
}

export enum Variant {
  Success = 'success',
  Warning = 'warning',
  Danger = 'danger',
  Highlight = 'highlight',
}

export const getIntentShadow = (intent?: Intent) => {
  return classNames('shadow-callout', {
    'shadow-intent-danger': intent === Intent.Danger,
    'shadow-intent-warning': intent === Intent.Warning,
    'shadow-intent-prompt': intent === Intent.Prompt,
    'shadow-black dark:shadow-white': intent === Intent.Progress,
    'shadow-intent-success': intent === Intent.Success,
    'shadow-intent-help': intent === Intent.Help,
  });
};

export const getVariantBackground = (variant?: Variant) => {
  return classNames({
    'bg-intent-success text-black': variant === Variant.Success,
    'bg-intent-danger text-white': variant === Variant.Danger,
    'bg-intent-warning text-black': variant === Variant.Warning,
    'bg-intent-highlight text-black': variant === Variant.Highlight,
    'bg-intent-help text-white': !variant,
  });
};
