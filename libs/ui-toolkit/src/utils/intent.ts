import { VegaIconNames } from '../components';

export enum Intent {
  None = 'None',
  Primary = 'Primary',
  Secondary = 'Secondary',
  Danger = 'Danger',
  Info = 'Info',
  Warning = 'Warning',
  Success = 'Success',
}

export const getIntentBorder = (intent = Intent.None) => {
  return {
    'border-intent-none-outline': intent === Intent.None,
    'border-intent-primary-outline': intent === Intent.Primary,
    'border-intent-secondary-outline': intent === Intent.Secondary,
    'border-intent-info-outline': intent === Intent.Info,
    'border-intent-danger-outline': intent === Intent.Danger,
    'border-intent-warning-outline': intent === Intent.Warning,
    'border-intent-success-outline': intent === Intent.Success,
  };
};

export const getIntentColor = (intent?: Intent) => {
  return {
    'bg-intent-none': intent === Intent.None,
    'bg-intent-primary': intent === Intent.Primary,
    'bg-intent-secondary': intent === Intent.Secondary,
    'bg-intent-info': intent === Intent.Info,
    'bg-intent-danger': intent === Intent.Danger,
    'bg-intent-warning': intent === Intent.Warning,
    'bg-intent-success': intent === Intent.Success,
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
    'text-surface-0-fg': intent === Intent.None,
    'text-intent-primary': intent === Intent.Primary,
    'text-intent-secondary': intent === Intent.Secondary,
    'text-intent-info': intent === Intent.Info,
    'text-intent-danger': intent === Intent.Danger,
    'text-intent-warning': intent === Intent.Warning,
    'text-intent-success': intent === Intent.Success,
  };
};

export const getIntentForeground = (intent?: Intent) => {
  return {
    'text-surface-0-fg': intent === Intent.None,
    'text-intent-primary-foreground': intent === Intent.Primary,
    'text-intent-secondary-foreground': intent === Intent.Secondary,
    'text-intent-info-foreground': intent === Intent.Info,
    'text-intent-danger-foreground': intent === Intent.Danger,
    'text-intent-warning-foreground': intent === Intent.Warning,
    'text-intent-success-foreground': intent === Intent.Success,
  };
};

export const getIntentIcon = (intent: Intent) => {
  const record: Record<Intent, VegaIconNames> = {
    [Intent.None]: VegaIconNames.INFO,
    [Intent.Primary]: VegaIconNames.INFO,
    [Intent.Secondary]: VegaIconNames.INFO,
    [Intent.Info]: VegaIconNames.INFO,
    [Intent.Success]: VegaIconNames.TICK,
    [Intent.Warning]: VegaIconNames.EXCLAMATION_MARK,
    [Intent.Danger]: VegaIconNames.CROSS,
  };

  return record[intent];
};
