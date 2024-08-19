import { useEffect } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import {
  ConnectionStatus,
  useConnect,
  useWallet,
  Links,
  RiskAck,
  ConnectionOptionRecord,
  ConnectionOptionDefault,
} from '@vegaprotocol/wallet-react';
import { ConnectorErrors } from '@vegaprotocol/wallet';
import { ensureSuffix } from '@vegaprotocol/utils';
import { useT } from '../../lib/use-t';
import { Routes } from '../../lib/links';
import { WelcomeDialogContent } from './welcome-dialog-content';
import {
  useOnboardingStore,
  type OnboardingDialog,
} from '../../stores/onboarding';
import { RiskAckContent } from '../risk-ack-content';

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

  useEffect(() => {
    const shouldOmit = OMIT_ON_LIST.map((path) =>
      matchPath(path, pathname)
    ).some((m) => !!m);

    if (dismissed || shouldOmit) return;

    setDialog('intro');
  }, [dismissed, pathname, setDialog]);

  const onClose = () => {
    if (dialog === 'connect' || dialog === 'risk') {
      setDialog('intro');
    } else {
      setDialog('inactive');
      dismiss();
    }
  };

  return (
    <Dialog
      open={dismissed ? false : dialog !== 'inactive'}
      size="medium"
      onChange={onClose}
      intent={Intent.None}
      dataTestId="welcome-dialog"
    >
      <DialogStepSwitch
        dialog={dialog}
        onConnect={() => {
          setTimeout(() => setDialog('intro'), 1000);
        }}
      />
    </Dialog>
  );
};

const DialogStepSwitch = ({
  dialog,
  onConnect,
}: {
  dialog: OnboardingDialog;
  onConnect: () => void;
}) => {
  const accept = useOnboardingStore((store) => store.acceptRisk);
  const reject = useOnboardingStore((store) => store.rejectRisk);
  const setDialog = useOnboardingStore((store) => store.setDialog);

  if (dialog === 'intro') {
    return <WelcomeDialogContent />;
  }

  if (dialog === 'connect') {
    return <OnboardConnectionOptions onConnect={onConnect} />;
  }

  if (dialog === 'risk') {
    return (
      <RiskAck
        onAccept={() => {
          accept();
          setDialog('connect');
        }}
        onReject={() => {
          reject();
          setDialog('intro');
        }}
      >
        <RiskAckContent />
      </RiskAck>
    );
  }
};

const OnboardConnectionOptions = ({ onConnect }: { onConnect: () => void }) => {
  const t = useT();
  const error = useWallet((store) => store.error);
  const { connect, connectors } = useConnect();
  const status = useWallet((store) => store.status);

  if (status === 'disconnected') {
    return (
      <div className="flex flex-col gap-2 md:gap-4">
        <h2>{t('Connect to Vega')}</h2>
        <div className="flex flex-col items-start gap-6">
          <ul className="flex flex-col -mx-4 -mb-4">
            {connectors.map((c) => {
              const ConnectionOption = ConnectionOptionRecord[c.id];
              const props = {
                id: c.id,
                name: c.name,
                description: c.description,
                showDescription: true,
                onClick: async () => {
                  const res = await connect(c.id);
                  if (res.status === 'connected') {
                    onConnect();
                  }
                },
              };

              if (ConnectionOption) {
                return (
                  <li key={c.id}>
                    <ConnectionOption {...props} />
                  </li>
                );
              }

              return (
                <li key={c.id}>
                  <ConnectionOptionDefault {...props} />
                </li>
              );
            })}
          </ul>
          {error && error.code !== ConnectorErrors.userRejected.code && (
            <p className="text-intent-danger text-sm first-letter:uppercase">
              {error.message}
            </p>
          )}
          <a
            href={Links.walletOverview}
            target="_blank"
            rel="noreferrer"
            className="text-sm underline underline-offset-4"
          >
            Dont have a wallet?
          </a>
        </div>
      </div>
    );
  }

  return <ConnectionStatus status={status} />;
};
