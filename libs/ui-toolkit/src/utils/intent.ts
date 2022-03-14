import classNames from 'classnames';

export type Intent =
  | 'danger'
  | 'warning'
  | 'prompt'
  | 'progress'
  | 'success'
  | 'help';

export const getIntentShadow = (intent?: Intent) => {
  return classNames('shadow-callout', {
    'shadow-intent-danger': intent === 'danger',
    'shadow-intent-warning': intent === 'warning',
    'shadow-intent-prompt': intent === 'prompt',
    'shadow-black dark:shadow-white': intent === 'progress',
    'shadow-intent-success': intent === 'success',
    'shadow-intent-help': intent === 'help',
  });
};
