import { t } from '@vegaprotocol/i18n';
import { GetStarted } from './get-started';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { useNavigate } from 'react-router-dom';
import { Links, Routes } from '../../pages/client-router';
import { useLocalStorage } from '@vegaprotocol/react-helpers';
import * as constants from '../constants';
import { Networks, useEnvironment } from '@vegaprotocol/environment';
import type { ReactNode } from 'react';

export const WelcomeDialogContent = () => {
  const { VEGA_ENV } = useEnvironment();
  const [, setOnboardingViewed] = useLocalStorage(
    constants.ONBOARDING_VIEWED_KEY
  );
  const navigate = useNavigate();
  const browseMarkets = () => {
    const link = Links[Routes.MARKETS]();
    navigate(link);
    setOnboardingViewed('true');
  };
  const lead =
    VEGA_ENV === Networks.MAINNET
      ? t('Start trading on the worlds most advanced decentralised exchange.')
      : t(
          'Free from the risks of real trading, Fairground is a safe and fun place to try out Vega yourself with virtual assets.'
        );
  return (
    <div className="flex flex-col sm:flex-row gap-8">
      <div className="sm:w-1/2 flex flex-col justify-between pt-3">
        <ul className="ml-0">
          <ListItemContent
            icon={<NonCustodialIcon />}
            title={t('Non-cutodial and pseudonymous')}
            text={t('No third party has access to your funds.')}
          />
          <ListItemContent
            icon={<PurposeBuiltIcon />}
            title={t('Purpose built proof of stake blockhain')}
            text={t(
              'Fully decentralised high performance peer-to-network trading.'
            )}
          />
          <ListItemContent
            icon={<RewardIcon />}
            title={t('Low fees and no cost to place orders')}
            text={t(
              'Fees work like a CEX with no per-transaction gas for orders'
            )}
          />
        </ul>
        <TradingButton
          onClick={browseMarkets}
          className="block w-full"
          data-testid="browse-markets-button"
        >
          {t('Browse the markets')}
        </TradingButton>
      </div>
      <div className="sm:w-1/2">
        <GetStarted lead={lead} />
      </div>
    </div>
  );
};

const ListItemContent = ({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) => {
  return (
    <li className="my-4 flex gap-3">
      <div className="shrink-0 pt-1">{icon}</div>
      <div>
        <h3 className="text-lg leading-snug mb-2">{title}</h3>
        <p className="text-sm text-secondary">{text}</p>
      </div>
    </li>
  );
};

const PurposeBuiltIcon = () => {
  return (
    <svg width="40" height="40" viewBox="0 0 30 30" fill="currentColor">
      <rect x="14" y="20" width="2" height="2" />
      <rect x="12" y="18" width="2" height="2" />
      <rect x="10" y="8" width="2" height="10" />
      <rect x="16" y="18" width="2" height="2" />
      <rect x="20" y="16" width="2" height="2" />
      <rect x="18" y="8" width="2" height="8" />
      <rect x="28" y="2" width="2" height="26" />
      <rect y="2" width="2" height="26" />
      <rect x="28" width="2" height="26" transform="rotate(90 28 0)" />
      <rect x="28" y="28" width="2" height="26" transform="rotate(90 28 28)" />
    </svg>
  );
};

const NonCustodialIcon = () => {
  return (
    <svg width="40" height="40" viewBox="0 0 30 30" className="fill-current">
      <rect x="8" y="22" width="14" height="2" />
      <rect x="8" y="12" width="14" height="2" />
      <rect
        x="22"
        y="24"
        width="2"
        height="12"
        transform="rotate(-180 22 24)"
      />
      <rect
        x="10"
        y="24"
        width="2"
        height="12"
        transform="rotate(-180 10 24)"
      />
      <rect x="12" y="12" width="2" height="2" transform="rotate(-180 12 12)" />
      <rect x="20" y="12" width="2" height="2" transform="rotate(-180 20 12)" />
      <rect x="12" y="10" width="2" height="2" transform="rotate(-180 12 10)" />
      <rect x="20" y="10" width="2" height="2" transform="rotate(-180 20 10)" />
      <rect x="18" y="8" width="2" height="2" transform="rotate(-180 18 8)" />
      <rect x="14" y="8" width="2" height="2" transform="rotate(-180 14 8)" />
      <rect x="16" y="8" width="2" height="2" transform="rotate(-180 16 8)" />
      <rect x="28" y="2" width="2" height="26" />
      <rect y="2" width="2" height="26" />
      <rect x="28" width="2" height="26" transform="rotate(90 28 0)" />
      <rect x="28" y="28" width="2" height="26" transform="rotate(90 28 28)" />
    </svg>
  );
};

const RewardIcon = () => {
  return (
    <svg width="40" height="40" viewBox="0 0 30 30" fill="currentColor">
      <rect x="6" y="16" width="4" height="2" />
      <rect x="10" y="14" width="2" height="2" />
      <rect x="12" y="24" width="4" height="2" transform="rotate(-90 12 24)" />
      <rect x="10" y="20" width="2" height="2" transform="rotate(-90 10 20)" />
      <rect x="20" y="18" width="4" height="2" transform="rotate(-180 20 18)" />
      <rect x="16" y="20" width="2" height="2" transform="rotate(-180 16 20)" />
      <rect x="16" y="14" width="2" height="2" transform="rotate(90 16 14)" />
      <rect x="22" y="10" width="2" height="2" transform="rotate(90 22 10)" />
      <rect x="20" y="8" width="2" height="2" transform="rotate(90 20 8)" />
      <rect x="24" y="8" width="2" height="2" transform="rotate(90 24 8)" />
      <rect x="22" y="6" width="2" height="2" transform="rotate(90 22 6)" />
      <rect x="12" y="10" width="2" height="4" />
      <rect x="28" y="2" width="2" height="26" />
      <rect y="2" width="2" height="26" />
      <rect x="28" width="2" height="26" transform="rotate(90 28 0)" />
      <rect x="28" y="28" width="2" height="26" transform="rotate(90 28 28)" />
    </svg>
  );
};
