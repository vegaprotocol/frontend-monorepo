import type { ReactNode } from 'react';
import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import type { FeesQuery } from './__generated__/Fees';
import { useFeesQuery } from './__generated__/Fees';

export const FeesContainer = () => {
  const { data, loading, error } = useFeesQuery();

  if (error) {
    return <p>Failed to fetch fee data</p>;
  }

  if (loading || !data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-2">
      <h1 className="mb-2 text-xl">{t('Fees')}</h1>
      <div className="grid lg:auto-rows-min lg:grid-cols-4 gap-2">
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
          <VolumeTiers program={data.currentVolumeDiscountProgram} />
        </FeeCard>
        <FeeCard title={t('Referral discount')} className="lg:col-span-2">
          <ReferralTiers program={data.currentReferralProgram} />
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
        'p-4 bg-vega-clight-800 dark:bg-vega-cdark-800 col-span-full lg:col-auto',
        'rounded-lg',
        className
      )}
    >
      <h2 className="mb-3">{title}</h2>
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

const VolumeTiers = ({
  program,
}: {
  program?: FeesQuery['currentVolumeDiscountProgram'];
}) => {
  if (!program || !program.benefitTiers.length) {
    return <p>{t('No referral program active')}</p>;
  }

  const tiers = Array.from(program.benefitTiers).reverse();

  return (
    <div>
      <Table>
        <THead>
          <tr>
            <Th>{t('Tier')}</Th>
            <Th>{t('Discount')}</Th>
            <Th>{t('Combined trading volume')}</Th>
          </tr>
        </THead>
        <tbody>
          {tiers.map((t, i) => {
            return (
              <tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{t.volumeDiscountFactor}%</Td>
                <Td>{t.minimumRunningNotionalTakerVolume}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const ReferralTiers = ({
  program,
}: {
  program?: FeesQuery['currentReferralProgram'];
}) => {
  if (!program || !program.benefitTiers.length) {
    return <p>{t('No referral program active')}</p>;
  }

  const tiers = Array.from(program.benefitTiers).reverse();

  return (
    <div>
      <Table>
        <THead>
          <tr>
            <Th>{t('Tier')}</Th>
            <Th>{t('Discount')}</Th>
            <Th>{t('Combined trading volume')}</Th>
            <Th>{t('Required epochs')}</Th>
          </tr>
        </THead>
        <tbody>
          {tiers.map((t, i) => {
            return (
              <tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{t.referralDiscountFactor}%</Td>
                <Td>{t.minimumRunningNotionalTakerVolume}</Td>
                <Td>{t.minimumEpochs}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const LiquidityFees = () => {
  return <div>Liquidity Fees</div>;
};

const cellClass = 'px-4 py-2 text-sm font-normal text-left';

const Th = ({ children }: { children: ReactNode }) => {
  return <th className={cellClass}>{children}</th>;
};

const Td = ({ children }: { children: ReactNode }) => {
  return <th className={cellClass}>{children}</th>;
};

const Table = ({ children }: { children: ReactNode }) => {
  return (
    <table className="w-full border border-vega-clight-600 dark:border-vega-cdark-600">
      {children}
    </table>
  );
};

const THead = ({ children }: { children: ReactNode }) => {
  return (
    <thead className="border-b bg-vega-clight-700 dark:bg-vega-cdark-700 border-vega-clight-600 dark:border-vega-cdark-600">
      {children}
    </thead>
  );
};
