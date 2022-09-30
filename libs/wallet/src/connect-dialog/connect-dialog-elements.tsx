import { t } from '@vegaprotocol/react-helpers';
import { Link } from '@vegaprotocol/ui-toolkit';
import type { ReactNode } from 'react';

export const ConnectDialogTitle = ({ children }: { children: ReactNode }) => {
  return <h1 className="text-2xl uppercase mb-6 text-center">{children}</h1>;
};

export const ConnectDialogContent = ({ children }: { children: ReactNode }) => {
  return <div className="mb-6">{children}</div>;
};

export const ConnectDialogFooter = ({ children }: { children?: ReactNode }) => {
  return (
    <footer className="flex justify-center gap-4 px-6 pt-6 -px-4 md:px-8 md:-mx-8 border-t border-neutral-500 text-neutral-500 dark:text-neutral-400">
      {children ? (
        children
      ) : (
        <>
          <Link href="https://github.com/vegaprotocol/vega/releases">
            {t('Get a Vega Wallet')}
          </Link>
          {' | '}
          <Link href="https://docs.vega.xyz/docs/mainnet/concepts/vega-wallet">
            {t('Having trouble?')}
          </Link>
        </>
      )}
    </footer>
  );
};
