import { cn } from '@vegaprotocol/ui-toolkit';
import { type ConnectorType } from '@vegaprotocol/wallet';
import { VegaIcon, VegaIconNames, VLogo } from '@vegaprotocol/ui-toolkit';

export const ConnectorIcon = ({ id }: { id: ConnectorType }) => {
  const defaultWrapperClasses =
    'flex items-center justify-center w-8 h-8 rounded';
  switch (id) {
    case 'injected': {
      return (
        <span
          className={cn(
            defaultWrapperClasses,
            'bg-black dark:bg-white text-gs-50 dark:text-gs-950'
          )}
        >
          <VLogo className="w-4 h-4" />
        </span>
      );
    }
    case 'jsonRpc': {
      return (
        <span
          className={cn(
            defaultWrapperClasses,
            'bg-black dark:bg-white text-gs-50 dark:text-gs-950 text-xs'
          )}
        >
          <span className="relative -top-0.5">{'>_'}</span>
        </span>
      );
    }
    case 'snap': {
      return (
        <span className={cn(defaultWrapperClasses, 'border bg-white')}>
          <VegaIcon name={VegaIconNames.METAMASK} size={24} />
        </span>
      );
    }
    case 'viewParty': {
      return (
        <span className={cn(defaultWrapperClasses, 'bg-blue-500 text-gs-50')}>
          <VegaIcon name={VegaIconNames.EYE} size={20} />
        </span>
      );
    }
    case 'embedded-wallet': {
      return (
        <span
          className={cn(
            defaultWrapperClasses,
            'bg-white text-gs-50 dark:text-gs-950'
          )}
        >
          <VegaIcon name={VegaIconNames.STREAK} size={20} />
        </span>
      );
    }
    case 'embedded-wallet-quickstart': {
      return (
        <span
          className={cn(
            defaultWrapperClasses,
            'bg-white text-gs-50 dark:text-gs-950'
          )}
        >
          <VegaIcon name={VegaIconNames.STAR} size={20} />
        </span>
      );
    }
    default: {
      return (
        <span
          className={cn(
            defaultWrapperClasses,
            'bg-gs-600 text-gs-800  text-xs'
          )}
        />
      );
    }
  }
};
