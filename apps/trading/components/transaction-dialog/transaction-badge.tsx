import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { cn } from '@vegaprotocol/ui-toolkit';

const BADGE_SIZING = cn(
  'self-start w-8 h-8 rounded-full relative flex-shrink-0'
);
const BADGE_BACKGROUND = 'bg-surface-2 ';
const INNER_ICON_SIZING = cn(
  'w-6 h-6', // 24
  'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
);

export const PendingBadge = () => {
  return (
    <div className={cn(BADGE_SIZING, BADGE_BACKGROUND)}>
      <div className={INNER_ICON_SIZING}>
        <VegaIcon
          name={VegaIconNames.LOADING}
          size={24}
          className={cn('animate-spin', 'stroke-gs-200 dark:stroke-gs-800')}
        />
      </div>
    </div>
  );
};

export const FailedBadge = () => {
  return (
    <div className={cn(BADGE_SIZING, BADGE_BACKGROUND)}>
      <VegaIcon
        name={VegaIconNames.EXCLAMATION_SIGN}
        size={24}
        className={cn(INNER_ICON_SIZING, 'fill-gs-950 dark:fill-gs-50')}
      />
    </div>
  );
};

export const DefaultBadge = () => {
  return (
    <div className={cn(BADGE_SIZING, BADGE_BACKGROUND)}>
      <VegaIcon
        name={VegaIconNames.SLIM_TICK}
        size={24}
        className={cn(INNER_ICON_SIZING, 'stroke-gs-400 dark:stroke-gs-600')}
      />
    </div>
  );
};

export const ConfirmedBadge = () => {
  return (
    <div className={cn(BADGE_SIZING, 'bg-gs-950 dark:bg-gs-50')}>
      <VegaIcon
        name={VegaIconNames.SLIM_TICK}
        size={24}
        className={cn(INNER_ICON_SIZING, 'stroke-gs-50 dark:stroke-gs-950')}
      />
    </div>
  );
};
