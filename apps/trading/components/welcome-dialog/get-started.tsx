import { cn } from '@vegaprotocol/ui-toolkit';
import {
  ExternalLink,
  Intent,
  Button,
  VegaIcon,
  VegaIconNames,
  AnchorButton,
} from '@vegaprotocol/ui-toolkit';
import { useVegaWallet, useDialogStore } from '@vegaprotocol/wallet-react';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { useOnboardingStore } from '../../stores/onboarding';
import {
  OnboardingStep,
  useGetOnboardingStep,
} from '../../lib/hooks/use-get-onboarding-step';
import { Links } from '../../lib/links';
import { useGlobalStore } from '../../stores';
import { useT } from '../../lib/use-t';
import { Trans } from 'react-i18next';

interface Props {
  lead?: string;
}

const GetStartedButton = ({ step }: { step: OnboardingStep }) => {
  const t = useT();
  const { VEGA_ENV } = useEnvironment();
  const dismiss = useOnboardingStore((store) => store.dismiss);
  const setDialog = useOnboardingStore((store) => store.setDialog);
  const risk = useOnboardingStore((store) => store.risk);
  const marketId = useGlobalStore((store) => store.marketId);

  const buttonProps = {
    size: 'sm' as const,
    'data-testid': 'get-started-button',
    intent: Intent.Info,
  };

  if (step <= OnboardingStep.ONBOARDING_CONNECT_STEP) {
    return (
      <Button
        {...buttonProps}
        onClick={() => {
          if (VEGA_ENV === Networks.MAINNET && risk !== 'accepted') {
            setDialog('risk');
          } else {
            setDialog('connect');
          }
        }}
      >
        {t('Connect')}
      </Button>
    );
  } else if (step === OnboardingStep.ONBOARDING_DEPOSIT_STEP) {
    return (
      <AnchorButton
        {...buttonProps}
        href={Links.DEPOSIT()}
        onClick={() => setDialog('inactive')}
      >
        {t('Deposit')}
      </AnchorButton>
    );
  } else if (step >= OnboardingStep.ONBOARDING_ORDER_STEP) {
    const link = marketId ? Links.MARKET(marketId) : Links.HOME();
    return (
      <AnchorButton
        {...buttonProps}
        href={link}
        onClick={() => {
          dismiss();
        }}
      >
        {t('Ready to trade')}
      </AnchorButton>
    );
  }

  return (
    <Button {...buttonProps} onClick={() => setDialog('connect')}>
      {t('Get started')}
    </Button>
  );
};

export const GetStartedCheckList = () => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const currentStep = useGetOnboardingStep();
  return (
    <ul className="list-none">
      <Step
        step={1}
        text={t('Connect')}
        complete={Boolean(
          currentStep > OnboardingStep.ONBOARDING_CONNECT_STEP || pubKey
        )}
      />
      <Step
        step={2}
        text={t('Deposit funds')}
        complete={currentStep > OnboardingStep.ONBOARDING_DEPOSIT_STEP}
      />
      <Step
        step={3}
        text={t('Open a position')}
        complete={currentStep > OnboardingStep.ONBOARDING_ORDER_STEP}
      />
    </ul>
  );
};

export const GetStarted = ({ lead }: Props) => {
  const t = useT();
  const { pubKey } = useVegaWallet();
  const { VEGA_ENV, VEGA_NETWORKS } = useEnvironment();
  const openVegaWalletDialog = useDialogStore((store) => store.open);
  const currentStep = useGetOnboardingStep();
  const dismissed = useOnboardingStore((store) => store.dismissed);

  const wrapperClasses = cn(
    'flex flex-col py-4 px-6 gap-4 rounded',
    'bg-vega-blue-300 dark:bg-vega-blue-700',
    'border border-vega-blue-350 dark:border-vega-blue-650',
    { 'mt-8': !lead }
  );

  if (!dismissed) {
    return (
      <div className={wrapperClasses} data-testid="get-started-banner">
        {lead && <h2>{lead}</h2>}
        <h3 className="text-lg">{t('Get started')}</h3>
        <div>
          <GetStartedCheckList />
        </div>
        <div>
          <GetStartedButton step={currentStep} />
        </div>
        {VEGA_ENV === Networks.MAINNET && (
          <p className="text-sm">
            <Trans
              defaults="Experiment for free with virtual assets on <0>Fairground Testnet</0>"
              components={[
                <ExternalLink href={VEGA_NETWORKS.TESTNET} key="link">
                  Fairground Testnet
                </ExternalLink>,
              ]}
            />
          </p>
        )}
        {VEGA_ENV === Networks.TESTNET && (
          <p className="text-sm">
            <Trans
              defaults="Ready to trade with real funds? <0>Switch to Mainnet</0>"
              components={[
                <ExternalLink
                  href={VEGA_NETWORKS.MAINNET}
                  key="link"
                  className="underline"
                >
                  Switch to Mainnet
                </ExternalLink>,
              ]}
            />
          </p>
        )}
      </div>
    );
  }

  if (!pubKey) {
    return (
      <div className={wrapperClasses}>
        <p className="mb-1 text-sm">
          <Trans
            defaults="You need a <0>Vega wallet</0> to start trading in this market."
            components={[
              <ExternalLink href="https://vega.xyz/wallet" key="link">
                Vega wallet
              </ExternalLink>,
            ]}
          />
        </p>
        <Button
          onClick={openVegaWalletDialog}
          size="sm"
          data-testid="order-connect-wallet"
          intent={Intent.Info}
        >
          {t('Connect wallet')}
        </Button>
      </div>
    );
  }

  return null;
};

const Step = ({
  step,
  text,
  complete,
}: {
  step: number;
  text: string;
  complete: boolean;
}) => {
  return (
    <li
      className={cn('flex', {
        'text-gs-200 ': complete,
      })}
    >
      <div className="flex justify-center w-5">
        {complete ? <Tick /> : <span>{step}.</span>}
      </div>
      <div className="ml-1">{text}</div>
    </li>
  );
};

const Tick = () => {
  return (
    <span className="relative right-[2px]">
      <VegaIcon name={VegaIconNames.TICK} size={18} />
    </span>
  );
};
