export enum Intent {
  None,
  Primary,
  Danger,
  Warning,
  Success,
}

export const getIntentBorder = (intent = Intent.None) => {
  return {
    border: true,
    'border-danger': intent === Intent.Danger,
    'border-warning': intent === Intent.Warning,
    'border-neutral-500': intent === Intent.None || intent === Intent.Primary,
    'border-success': intent === Intent.Success,
  };
};

export const getIntentBackground = (intent?: Intent) => {
  return {
    'bg-neutral-200 dark:bg-neutral-800': intent === undefined,
    'bg-black dark:bg-white': intent === Intent.None,
    'bg-vega-pink dark:bg-vega-yellow': intent === Intent.Primary,
    'bg-danger': intent === Intent.Danger,
    'bg-warning': intent === Intent.Warning,
    'bg-success': intent === Intent.Success,
  };
};

export const getIntentText = (intent?: Intent) => {
  return {
    'text-white dark:text-black': intent === Intent.None,
    'text-black dark:text-black-normal': intent === Intent.Primary,
    'text-white': intent === Intent.Danger,
    'text-black': intent === Intent.Warning || intent === Intent.Success,
  };
};

export const getIntentTextAndBackground = (intent?: Intent) => {
  return { ...getIntentText(intent), ...getIntentBackground(intent) };
};
