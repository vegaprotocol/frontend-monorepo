import { DocsLinks, ExternalLinks } from '@vegaprotocol/environment';
import { t } from '@vegaprotocol/i18n';
import { Link } from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import type { VegaConnector } from '../connectors';
import { RestConnector } from '../connectors';

export const ConnectDialogTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h1
      data-testid="wallet-dialog-title"
      className="text-2xl uppercase mb-6 text-center font-alpha calt"
    >
      {children}
    </h1>
  );
};

export const ConnectDialogContent = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

export const ConnectDialogFooter = ({
  connector,
}: {
  connector: VegaConnector | undefined;
}) => {
  const wrapperClasses = classNames(
    'flex justify-center gap-4',
    'px-4 md:px-8 pt-4 md:pt-6',
    'border-t border-vega-light-200 dark:border-vega-dark-200',
    'text-vega-light-400 dark:text-vega-dark-400'
  );
  const isHostedWalletSelected = connector instanceof RestConnector;
  return (
    <footer className={wrapperClasses}>
      {isHostedWalletSelected ? (
        <p className="text-center">
          {t('For demo purposes get a ')}
          <Link
            href={ExternalLinks.VEGA_WALLET_HOSTED_URL}
            target="_blank"
            rel="noreferrer"
          >
            {t('hosted wallet')}
          </Link>
          {t(', or for the real experience create a wallet in the ')}
          <Link href={ExternalLinks.VEGA_WALLET_URL}>
            {t('Vega wallet app')}
          </Link>
        </p>
      ) : (
        <>
          <Link href={ExternalLinks.VEGA_WALLET_URL}>
            {t('Get a Vega Wallet')}
          </Link>
          {' | '}
          {DocsLinks && (
            <Link href={DocsLinks.VEGA_WALLET_CONCEPTS_URL}>
              {t('Having trouble?')}
            </Link>
          )}
        </>
      )}
    </footer>
  );
};
