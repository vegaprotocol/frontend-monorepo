import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import {
  ExternalLink,
  Intent,
  TradingButton,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import {
  GetWalletButton,
  useVegaWallet,
  useVegaWalletDialogStore,
} from '@vegaprotocol/wallet';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import { useNavigate } from 'react-router-dom';
import {
  OnboardingStep,
  useGetOnboardingStep,
} from './use-get-onboarding-step';
import { Links, Routes } from '../../pages/client-router';
import { useGlobalStore } from '../../stores';
import { useSidebar, ViewType } from '../sidebar';
import * as constants from '../constants';
import { useOnboardingStore } from './welcome-dialog';

interface Props {
  lead?: string;
}

const GetStartedButton = ({ step }: { step: OnboardingStep }) => {
  const navigate = useNavigate();
  const [, setOnboardingViewed] = useLocalStorage(
    constants.ONBOARDING_VIEWED_KEY
  );

  const dismiss = useOnboardingStore((store) => store.dismiss);
  const marketId = useGlobalStore((store) => store.marketId);
  const link = marketId ? Links[Routes.MARKET](marketId) : Links[Routes.HOME]();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );
  const setView = useSidebar((store) => store.setView);
  let buttonText = t('Get started');
  let onClickHandle = () => {
    openVegaWalletDialog();
  };
  if (step === OnboardingStep.ONBOARDING_WALLET_STEP) {
    return <GetWalletButton className="justify-between" />;
  } else if (step === OnboardingStep.ONBOARDING_CONNECT_STEP) {
    buttonText = t('Connect');
  } else if (step === OnboardingStep.ONBOARDING_DEPOSIT_STEP) {
    buttonText = t('Deposit');
    onClickHandle = () => {
      navigate(link);
      setView({ type: ViewType.Deposit });
      dismiss();
    };
  } else if (step === OnboardingStep.ONBOARDING_ORDER_STEP) {
    buttonText = t('Dismiss');
    onClickHandle = () => {
      navigate(link);
      setView({ type: ViewType.Order });
      setOnboardingViewed('true');
    };
  }

  return (
    <TradingButton
      onClick={onClickHandle}
      size="small"
      data-testid="get-started-button"
      intent={Intent.Info}
    >
      {buttonText}
    </TradingButton>
  );
};

export const GetStarted = ({ lead }: Props) => {
  const { pubKey } = useVegaWallet();
  const { VEGA_ENV, VEGA_NETWORKS } = useEnvironment();
  const CANONICAL_URL = VEGA_NETWORKS[VEGA_ENV] || 'https://console.vega.xyz';
  const [onBoardingViewed] = useLocalStorage(constants.ONBOARDING_VIEWED_KEY);
  const currentStep = useGetOnboardingStep();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  const getStartedNeeded =
    onBoardingViewed !== 'true' &&
    currentStep &&
    currentStep < OnboardingStep.ONBOARDING_COMPLETE_STEP;

  const wrapperClasses = classNames(
    'flex flex-col py-4 px-6 gap-4 rounded',
    'bg-vega-blue-300 dark:bg-vega-blue-700',
    'border border-vega-blue-350 dark:border-vega-blue-650',
    { 'mt-8': !lead }
  );

  if (getStartedNeeded) {
    return (
      <div className={wrapperClasses} data-testid="get-started-banner">
        {lead && <h2>{lead}</h2>}
        <h3 className="text-lg">{t('Get started')}</h3>
        <div>
          <ul className="list-none">
            <Step
              step={1}
              text={t('Get a Vega wallet')}
              complete={currentStep > OnboardingStep.ONBOARDING_WALLET_STEP}
            />
            <Step
              step={2}
              text={t('Connect')}
              complete={Boolean(
                currentStep > OnboardingStep.ONBOARDING_CONNECT_STEP || pubKey
              )}
            />
            <Step
              step={3}
              text={t('Deposit funds')}
              complete={currentStep > OnboardingStep.ONBOARDING_DEPOSIT_STEP}
            />
            <Step
              step={4}
              text={t('Open a position')}
              complete={currentStep > OnboardingStep.ONBOARDING_ORDER_STEP}
            />
          </ul>
        </div>
        <div>
          <GetStartedButton step={currentStep} />
        </div>
        {VEGA_ENV === Networks.MAINNET && (
          <p className="text-sm">
            {t('Experiment for free with virtual assets on')}{' '}
            <ExternalLink href={CANONICAL_URL}>
              {t('Fairground Testnet')}
            </ExternalLink>
          </p>
        )}
        {VEGA_ENV === Networks.TESTNET && (
          <p className="text-sm">
            {t('Ready to trade with real funds?')}{' '}
            <ExternalLink href={CANONICAL_URL}>
              {t('Switch to Mainnet')}
            </ExternalLink>
          </p>
        )}
      </div>
    );
  }

  if (!pubKey) {
    return (
      <div className={wrapperClasses}>
        <p className="mb-1 text-sm">
          You need a{' '}
          <ExternalLink href="https://vega.xyz/wallet">
            Vega wallet
          </ExternalLink>{' '}
          to start trading in this market.
        </p>
        <TradingButton
          onClick={openVegaWalletDialog}
          size="small"
          data-testid="order-connect-wallet"
          intent={Intent.Info}
        >
          {t('Connect wallet')}
        </TradingButton>
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
      className={classNames('flex', {
        'text-vega-clight-200 dark:text-vega-cdark-200': complete,
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
