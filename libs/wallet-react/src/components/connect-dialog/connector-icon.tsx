import classNames from 'classnames';
import {
  mainnet,
  fairground,
  stagnet,
  type ConnectorType,
} from '@vegaprotocol/wallet';
import { VegaIcon, VegaIconNames, VLogo } from '@vegaprotocol/ui-toolkit';
import { useWalletChainId } from '../../hooks/use-wallet-chain-id';

export const ConnectorIcon = ({ id }: { id: ConnectorType }) => {
  const { chainId } = useWalletChainId();

  const defaultWrapperClasses =
    'flex items-center justify-center w-8 h-8 rounded';
  switch (id) {
    case 'injected': {
      return (
        <span
          className={classNames(defaultWrapperClasses, {
            'bg-black dark:bg-white text-vega-clight-800 dark:text-vega-cdark-800':
              chainId === mainnet.id,
            'bg-vega-yellow text-vega-cdark-800': chainId === fairground.id,
            'bg-vega-blue text-vega-cdark-800': chainId === stagnet.id,
          })}
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
            'bg-black dark:bg-white text-vega-clight-800 dark:text-vega-cdark-800 text-xs'
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
            'border bg-white dark:bg-vega-clight-600'
          )}
        >
          <VegaIcon name={VegaIconNames.METAMASK} size={24} />
        </span>
      );
    }
    case 'readOnly': {
      return (
        <span
          className={classNames(
            defaultWrapperClasses,
            'bg-vega-blue-500 text-vega-clight-800'
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
            'bg-vega-cdark-600 dark:bg-vega-clight-600 text-vega-clight-800 dark:text-vega-cdark-800 text-xs'
          )}
        />
      );
    }
  }
};
