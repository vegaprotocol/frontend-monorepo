import { useEffect } from 'react';
import { Link, matchPath, useLocation } from 'react-router-dom';
import {
  Dialog,
  Intent,
  TradingButton as Button,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  ConnectorIcon,
  ConnectionStatus,
  useConnect,
  useWallet,
} from '@vegaprotocol/wallet-react';
import { ConnectorErrors, type ConnectorType } from '@vegaprotocol/wallet';
import { ensureSuffix } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { Links, Routes } from '../../lib/links';
import { WelcomeDialogContent } from './welcome-dialog-content';
import { useOnboardingStore } from './use-get-onboarding-step';
import { Trans } from 'react-i18next';

/**
 * A list of paths on which the welcome dialog should be omitted.
 */
const OMIT_ON_LIST = [ensureSuffix(Routes.REFERRALS, '/*')];

export const WelcomeDialog = () => {
  const { pathname } = useLocation();
  const dismissed = useOnboardingStore((store) => store.dismissed);
  const dialog = useOnboardingStore((store) => store.dialog);
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const setDialog = useOnboardingStore((store) => store.setDialog);
  const title = useTitle();

  useEffect(() => {
    const shouldOmit = OMIT_ON_LIST.map((path) =>
      matchPath(path, pathname)
    ).some((m) => !!m);

    if (dismissed || shouldOmit) return;

    setDialog('intro');
  }, [dismissed, pathname, setDialog]);

  let content = null;

  if (dialog === 'intro') {
    content = <WelcomeDialogContent />;
  } else if (dialog === 'connect') {
    content = (
      <ConnectionOptions
        onConnect={() => {
          setTimeout(() => setDialog('intro'), 1000);
        }}
      />
    );
  } else if (dialog === 'risk') {
    content = <Risk />;
  }

  const onClose = () => {
    setDialog('inactive');
    dismiss();
  };

  return (
    <Dialog
      open={dismissed ? false : dialog !== 'inactive'}
      title={title}
      size="medium"
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      {content}
    </Dialog>
  );
};

const useTitle = () => {
  const t = useT();
  const { VEGA_ENV } = useEnvironment();
  const dialog = useOnboardingStore((store) => store.dialog);

  if (dialog === 'risk') {
    return t('Understand the risk');
  }

  if (dialog === 'connect') {
    return t('Connect Vega Wallet');
  }

  return t('Console {{env}}', { env: VEGA_ENV });
};

const ConnectionOptions = ({ onConnect }: { onConnect: () => void }) => {
  const error = useWallet((store) => store.error);
  const { connect, connectors } = useConnect();
  const status = useWallet((store) => store.status);

  if (status === 'disconnected') {
    return (
      <div className="flex flex-col gap-6">
        <ul className="flex flex-col -mx-4 -mb-4">
          {connectors.map((c) => {
            return (
              <ConnectionOption
                key={c.id}
                id={c.id}
                name={c.name}
                description={c.description}
                onClick={async () => {
                  const res = await connect(c.id);
                  if (res.status === 'connected') {
                    onConnect();
                  }
                }}
              />
            );
          })}
        </ul>
        {error && error.code !== ConnectorErrors.userRejected.code && (
          <p className="text-danger text-sm first-letter:uppercase">
            {error.message}
          </p>
        )}
      </div>
    );
  }

  return <ConnectionStatus status={status} />;
};

export const ConnectionOption = ({
  id,
  name,
  description,
  onClick,
}: {
  id: ConnectorType;
  name: string;
  description: string;
  onClick: () => void;
}) => {
  return (
    <li>
      <button
        className="flex gap-2 w-full hover:bg-vega-clight-800 dark:hover:bg-vega-cdark-800 p-4 rounded"
        onClick={onClick}
      >
        <span>
          <ConnectorIcon id={id} />
        </span>
        <span className="flex flex-col justify-start text-left">
          <span className="capitalize leading-5">{name}</span>
          <span className="text-muted text-sm">{description}</span>
        </span>
      </button>
    </li>
  );
};

const Risk = () => {
  const t = useT();
  const accept = useOnboardingStore((store) => store.acceptRisk);
  const reject = useOnboardingStore((store) => store.rejectRisk);

  return (
    <>
      <div className="p-6 mb-6 bg-vega-light-100 dark:bg-vega-dark-100">
        <ul className="list-[square] ml-4">
          <li className="mb-1">
            {t(
              'Conduct your own due diligence and consult your financial advisor before making any investment decisions.'
            )}
          </li>
          <li className="mb-1">
            {t(
              'You may encounter bugs, loss of functionality or loss of assets.'
            )}
          </li>
          <li>
            {t('No party accepts any liability for any losses whatsoever.')}
          </li>
        </ul>
      </div>
      <p className="mb-8">
        <Trans
          defaults="By using the Vega Console, you acknowledge that you have read and understood the <0>Vega Console Disclaimer</0>"
          components={[<DisclaimerLink key="link" onClick={() => {}} />]}
        />
      </p>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <Button onClick={reject} fill>
            {t('Cancel')}
          </Button>
        </div>
        <div>
          <Button onClick={accept} intent={Intent.Info} fill>
            {t('I agree')}
          </Button>
        </div>
      </div>
    </>
  );
};

const DisclaimerLink = ({
  children,
  onClick,
}: {
  children?: string[];
  onClick: () => void;
}) => (
  <Link to={Links.DISCLAIMER()} target="_blank" onClick={onClick}>
    <span className="inline-flex items-center gap-1 underline underline-offset-4">
      <span>{children}</span>
      <VegaIcon name={VegaIconNames.OPEN_EXTERNAL} />
    </span>
  </Link>
);
