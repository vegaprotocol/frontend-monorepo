import classNames from 'classnames';

export enum Intent {
  Danger = 'danger',
  Warning = 'warning',
  Prompt = 'prompt',
  Progress = 'progress',
  Success = 'success',
  Help = 'help',
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
