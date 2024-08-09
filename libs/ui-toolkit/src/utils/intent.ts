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
    'border-intent-none': intent === Intent.None,
    'border-intent-primary': intent === Intent.Primary,
    'border-intent-secondary': intent === Intent.Secondary,
    'border-intent-info': intent === Intent.Info,
    'border-intent-danger': intent === Intent.Danger,
    'border-intent-warning': intent === Intent.Warning,
    'border-intent-success': intent === Intent.Success,
  };
};

export const getIntentBackground = (intent?: Intent) => {
  return {
    'bg-intent-none-background': intent === Intent.None,
    'bg-intent-primary-background': intent === Intent.Primary,
    'bg-intent-secondary-background': intent === Intent.Secondary,
    'bg-intent-info-background': intent === Intent.Info,
    'bg-intent-danger-background': intent === Intent.Danger,
    'bg-intent-warning-background': intent === Intent.Warning,
    'bg-intent-success-background': intent === Intent.Success,
  };
};

export const getIntentText = (intent?: Intent) => {
  return {
    'text-gs-50': intent === Intent.None,
    'text-intent-primary': intent === Intent.Primary,
    'text-intent-secondary': intent === Intent.Secondary,
    'text-intent-info': intent === Intent.Info,
    'text-intent-danger': intent === Intent.Danger,
    'text-intent-warning': intent === Intent.Warning,
    'text-intent-success': intent === Intent.Success,
  };
};
