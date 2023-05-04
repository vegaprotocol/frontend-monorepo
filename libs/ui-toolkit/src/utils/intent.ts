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
    'border-vega-pink': intent === Intent.Danger,
    'border-vega-orange': intent === Intent.Warning,
    'border-neutral-500': intent === Intent.None,
    'border-vega-blue-300': intent === Intent.Primary,
    'border-vega-green': intent === Intent.Success,
  };
};

export const getIntentBackground = (intent?: Intent) => {
  return {
    'bg-neutral-200 dark:bg-neutral-800': intent === undefined,
    'bg-black dark:bg-white': intent === Intent.None,
    'bg-vega-blue-300 dark:bg-vega-blue-700': intent === Intent.Primary,
    'bg-vega-pink': intent === Intent.Danger,
    'bg-vega-orange': intent === Intent.Warning,
    // contrast issues with light mode
    'bg-vega-green-550 dark:bg-vega-green': intent === Intent.Success,
  };
};

export const getIntentText = (intent?: Intent) => {
  return {
    'text-white dark:text-black': intent === Intent.None,
    'text-white': intent === Intent.Danger || intent === Intent.Primary,
    'text-black': intent === Intent.Warning || intent === Intent.Success,
  };
};

export const getIntentTextAndBackground = (intent?: Intent) => {
  return { ...getIntentText(intent), ...getIntentBackground(intent) };
};
