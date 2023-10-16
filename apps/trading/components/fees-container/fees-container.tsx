import type { ReactNode } from 'react';
import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';

export const FeesContainer = () => {
  return (
    <div className="p-2">
      <h1 className="mb-2 text-xl">{t('Fees')}</h1>
      <div className="grid lg:grid-rows-3 lg:grid-cols-4 gap-2">
        <FeeCard title={t('Trading fees')}>
          <TradingFees />
        </FeeCard>
        <FeeCard title={t('Current volume')}>
          <CurrentVolume />
        </FeeCard>
        <FeeCard title={t('Referral benefits')}>
          <ReferralBenefits />
        </FeeCard>
        <FeeCard title={t('Total discount')}>
          <TotalDiscount />
        </FeeCard>
        <FeeCard title={t('Volume discount')} className="lg:col-span-2">
          <VolumeTiers />
        </FeeCard>
        <FeeCard title={t('Referral discount')} className="lg:col-span-2">
          <ReferralTiers />
        </FeeCard>
        <FeeCard title={t('Liquidity fees')} className="lg:col-span-full">
          <LiquidityFees />
        </FeeCard>
      </div>
    </div>
  );
};

const FeeCard = ({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        'px-4 py-3 bg-vega-clight-600 dark:bg-vega-cdark-600 col-span-full lg:col-auto',
        'rounded-lg',
        className
      )}
    >
      <h2 className="text-sm">{title}</h2>
      {children}
    </div>
  );
};

const TradingFees = () => {
  return <div>Trading Fees</div>;
};

const CurrentVolume = () => {
  return <div>Current Volume</div>;
};

const ReferralBenefits = () => {
  return <div>Referral Benefits</div>;
};

const TotalDiscount = () => {
  return <div>Total Discount</div>;
};

const VolumeTiers = () => {
  return <div>Volume Tiers</div>;
};

const ReferralTiers = () => {
  return <div>Referral Tiers</div>;
};

const LiquidityFees = () => {
  return <div>Liquidity Fees</div>;
};
