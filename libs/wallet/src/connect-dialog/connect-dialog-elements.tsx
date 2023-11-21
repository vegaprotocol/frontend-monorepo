import {
  ExternalLink,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { MozillaIcon } from './mozilla-icon';
import { ChromeIcon } from './chrome-icon';
import { useVegaWallet } from '../use-vega-wallet';
import { useT } from '../use-t';

export const ConnectDialogTitle = ({ children }: { children: ReactNode }) => {
  return (
    <h1 data-testid="wallet-dialog-title" className="font-alpha mb-6 text-2xl">
      {children}
    </h1>
  );
};

export const ConnectDialogContent = ({ children }: { children: ReactNode }) => {
  return <div>{children}</div>;
};

export const ConnectDialogFooter = () => {
  const t = useT();
  const { links } = useVegaWallet();
  const wrapperClasses = classNames(
    'flex justify-center gap-4 mt-4',
    'px-4 md:px-8 pt-4 md:pt-6',
    'border-t border-vega-light-200 dark:border-vega-dark-200',
    'text-vega-light-400 dark:text-vega-dark-400 text-sm'
  );
  return (
    <footer className={wrapperClasses}>
      <ExternalLink href={links.about} className="underline">
        {t('About the Vega wallet')}{' '}
        <VegaIcon name={VegaIconNames.ARROW_TOP_RIGHT} />
      </ExternalLink>
      {' | '}
      <ExternalLink href={links.browserList} className="underline">
        {t('Supported browsers')}{' '}
        <VegaIcon name={VegaIconNames.ARROW_TOP_RIGHT} />
      </ExternalLink>
    </footer>
  );
};

export const BrowserIcon = ({
  chromeExtensionUrl,
  mozillaExtensionUrl,
}: {
  chromeExtensionUrl: string;
  mozillaExtensionUrl: string;
}) => {
  const isItChrome = window.navigator.userAgent.includes('Chrome');
  const isItMozilla =
    window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  return (
    <div className="absolute right-1 top-0 flex h-8 items-center">
      {!isItChrome && !isItMozilla ? (
        <>
          <a href={mozillaExtensionUrl} target="_blank" rel="noreferrer">
            <MozillaIcon />
          </a>{' '}
          <a href={chromeExtensionUrl} target="_blank" rel="noreferrer">
            <ChromeIcon />
          </a>
        </>
      ) : (
        <>
          {isItChrome && <ChromeIcon />}
          {isItMozilla && <MozillaIcon />}
        </>
      )}
    </div>
  );
};
