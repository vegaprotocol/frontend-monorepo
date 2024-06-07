import { useMarkets } from '../../lib/hooks/use-markets';
import type { ReactNode } from 'react';
import { localLoggerFactory } from '@vegaprotocol/logger';

const logger = localLoggerFactory({ application: 'data-loader' });

/**
 * Loads all required static data
 */
export const DataLoader = ({
  children,
  failure,
  skeleton,
}: {
  children: ReactNode;
  failure: ReactNode;
  skeleton: ReactNode;
}) => {
  const { status: statusMarkets, error: errorMarkets } = useMarkets();
  const { status: statusAssets, error: errorAssets } = useMarkets();

  if ([statusMarkets, statusAssets].some((s) => s === 'pending')) {
    // eslint-disable-next-line
    return <>{skeleton}</>;
  }

  if ([statusMarkets, statusAssets].some((s) => s === 'error')) {
    logger.error(
      'failed to mount app',
      errorMarkets?.message,
      errorAssets?.message
    );
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{failure}</>;
  }

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
};
