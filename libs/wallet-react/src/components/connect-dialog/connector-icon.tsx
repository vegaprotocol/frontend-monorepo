import classNames from 'classnames';
import { type ConnectorType } from '@vegaprotocol/wallet';
import { VegaIcon, VegaIconNames, VLogo } from '@vegaprotocol/ui-toolkit';

export const ConnectorIcon = ({ id }: { id: ConnectorType }) => {
  const defaultWrapperClasses =
    'flex items-center justify-center w-8 h-8 rounded';
  switch (id) {
    case 'injected': {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'bg-black dark:bg-white text-gs-800 '
          )}
        >
          <VLogo className="w-4 h-4" />
        </span>
      );
    }
    case 'jsonRpc': {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'bg-black dark:bg-white text-gs-800  text-xs'
          )}
        >
          <span className="relative -top-0.5">{'>_'}</span>
        </span>
      );
    }
    case 'snap': {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'border bg-white dark:bg-gs-600'
          )}
        >
          <VegaIcon name={VegaIconNames.METAMASK} size={24} />
        </span>
      );
    }
    case 'viewParty': {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'bg-vega-blue-500 text-gs-800'
          )}
        >
          <VegaIcon name={VegaIconNames.EYE} size={20} />
        </span>
      );
    }
    default: {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'bg-gs-600 text-gs-800  text-xs'
          )}
        />
      );
    }
  }
};
