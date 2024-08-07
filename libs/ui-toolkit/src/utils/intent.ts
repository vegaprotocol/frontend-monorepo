export enum Intent {
  None,
  Primary,
  Secondary,
  Danger,
  Info,
  Warning,
  Success,
}

export const getIntentBorder = (intent = Intent.None) => {
  return {
    border: true,
    'border-danger': intent === Intent.Danger,
    'border-warning': intent === Intent.Warning,
    'border-gs-500 ': intent === Intent.None,
    'border-vega-blue-300': intent === Intent.Primary,
    'border-vega-green': intent === Intent.Success,
  };
};

export const getIntentBackground = (intent?: Intent) => {
  return {
    'bg-gs-800': intent === undefined,
    'bg-gs-0': intent === Intent.None,
    'bg-vega-blue-300 dark:bg-vega-blue-650': intent === Intent.Primary,
    'bg-danger': intent === Intent.Danger,
    'bg-warning': intent === Intent.Warning,
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
