import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useEnvironment } from '@vegaprotocol/environment';
import {
  ConnectorIcon,
  ConnectionStatus,
  useConnect,
  useWallet,
} from '@vegaprotocol/wallet-react';
import { useT } from '../../lib/use-t';
import { Routes } from '../../lib/links';
import { WelcomeDialogContent } from './welcome-dialog-content';
import { useOnboardingStore } from './use-get-onboarding-step';
import { ensureSuffix } from '@vegaprotocol/utils';
import { type ConnectorType } from '@vegaprotocol/wallet';

/**
 * A list of paths on which the welcome dialog should be omitted.
 */
const OMIT_ON_LIST = [ensureSuffix(Routes.REFERRALS, '/*')];

export const WelcomeDialog = () => {
  const { pathname } = useLocation();
  const t = useT();
  const { VEGA_ENV } = useEnvironment();
  const dismissed = useOnboardingStore((store) => store.dismissed);
  const dialogOpen = useOnboardingStore((store) => store.dialogOpen);
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const setDialogOpen = useOnboardingStore((store) => store.setDialogOpen);
  const walletDialogOpen = useOnboardingStore(
    (store) => store.walletDialogOpen
  );
  const setWalletDialogOpen = useOnboardingStore(
    (store) => store.setWalletDialogOpen
  );

  useEffect(() => {
    const shouldOmit = OMIT_ON_LIST.map((path) =>
      matchPath(path, pathname)
    ).some((m) => !!m);

    if (dismissed || shouldOmit) return;

    setDialogOpen(true);
  }, [dismissed, pathname, setDialogOpen]);

  const content = walletDialogOpen ? (
    <ConnectionOptions
      onConnect={() => {
        setTimeout(() => setWalletDialogOpen(false), 1000);
      }}
    />
  ) : (
    <WelcomeDialogContent />
  );

  const onClose = walletDialogOpen
    ? () => setWalletDialogOpen(false)
    : () => {
        setDialogOpen(false);
        dismiss();
      };

  const title = walletDialogOpen
    ? t('Connect Vega Wallet')
    : t('Console {{env}}', { env: VEGA_ENV });

  return (
    <Dialog
      open={dismissed ? false : dialogOpen}
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
                  if (res?.success) {
                    onConnect();
                  }
                }}
              />
            );
          })}
        </ul>
        {error && !error.includes('the user rejected') && (
          <p className="text-danger text-sm first-letter:uppercase">{error}</p>
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
