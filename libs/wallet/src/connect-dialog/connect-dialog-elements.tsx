import { t } from '@vegaprotocol/react-helpers';
import { Link } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';
import * as constants from '../constants';

export const ConnectDialogTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h1
      data-testid="wallet-dialog-title"
      className="text-2xl uppercase mb-6 text-center"
    >
      {children}
    </h1>
  );
};

export const ConnectDialogContent = ({ children }: { children: ReactNode }) => {
  return <div className="mb-6">{children}</div>;
};

export const ConnectDialogFooter = ({ children }: { children?: ReactNode }) => {
  return (
    <footer className="flex justify-center gap-4 px-4 md:px-8 pt-4 md:pt-6 -mx-4 md:-mx-8 border-t border-neutral-500 text-neutral-500 dark:text-neutral-400">
      {children ? (
        children
      ) : (
        <>
          <Link href={constants.VEGA_WALLET_RELEASE_URL}>
            {t('Get a Vega Wallet')}
          </Link>
          {' | '}
          <Link href={constants.VEGA_WALLET_CONCEPTS_URL}>
            {t('Having trouble?')}
          </Link>
        </>
      )}
    </footer>
  );
};
