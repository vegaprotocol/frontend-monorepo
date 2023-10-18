import type { ReactNode } from 'react';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import { useDiscountProgramsQuery, useFeesQuery } from './__generated__/Fees';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  useNetworkParams,
  NetworkParams,
} from '@vegaprotocol/network-parameters';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { useMarketList } from '@vegaprotocol/markets';
import { MarketFees } from './market-fees';
import { formatPercentage, getAdjustedFee } from './utils';
import { Table, Td, Th, THead, Tr } from './table';
import { useVolumeStats } from './use-volume-stats';
import { useReferralStats } from './use-referral-stats';
import { formatNumber } from '@vegaprotocol/utils';
import { Stat } from './stat';
import { Splash } from '@vegaprotocol/ui-toolkit';

/**
 * TODO:
 * - Better loading states
 * - Remove hardcoded partyId
 */

export const FeesContainer = () => {
  const { pubKey } = useVegaWallet();
  const { params } = useNetworkParams([
    NetworkParams.market_fee_factors_makerFee,
    NetworkParams.market_fee_factors_infrastructureFee,
  ]);

  const { data: markets } = useMarketList();

  const {
    data: programData,
    loading: programLoading,
    error: programError,
  } = useDiscountProgramsQuery();

  const volumeDiscountEpochs =
    programData?.currentVolumeDiscountProgram?.windowLength || 1;
  const referralDiscountEpochs =
    programData?.currentReferralProgram?.windowLength || 1;

  const { data, loading, error } = useFeesQuery({
    variables: {
      partyId:
        // TODO: change for pubkey
        '9e2445e0e98c0e0ca1c260baaab1e7a2f1b9c7256c27196be6e614ee44d1a1e7',
      volumeDiscountEpochs,
      referralDiscountEpochs,
    },
    skip: !pubKey || !programData,
  });

  const { volumeDiscount, volumeTierIndex, volumeInWindow, volumeTiers } =
    useVolumeStats(
      data?.volumeDiscountStats,
      programData?.currentVolumeDiscountProgram
    );

  const {
    referralDiscount,
    referralVolumeInWindow,
    referralTierIndex,
    referralTiers,
    epochsInSet,
  } = useReferralStats(
    data?.referralSetStats,
    data?.referralSetReferees,
    programData?.currentReferralProgram,
    data?.epoch
  );

  if (!pubKey) {
    return (
      <Splash>
        <p className="text-xs">{t('Please connect Vega wallet')}</p>
      </Splash>
    );
  }

  if (error) {
    return (
      <Splash>
        <p className="text-xs">{t('Failed to fetch fees data')}</p>
      </Splash>
    );
  }

  // TODO: skeleton loading states
  if (loading || programLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-3">
      <h1 className="px-4 pt-2 pb-4 text-2xl">{t('Fees')}</h1>
      <div className="grid auto-rows-min grid-cols-4 gap-3">
        <FeeCard title={t('My trading fees')} className="sm:col-span-2">
          <TradingFees
            params={params}
            markets={markets}
            referralDiscount={referralDiscount}
            volumeDiscount={volumeDiscount}
          />
        </FeeCard>
        <FeeCard title={t('Total discount')} className="sm:col-span-2">
          <TotalDiscount
            referralDiscount={referralDiscount}
            volumeDiscount={volumeDiscount}
          />
        </FeeCard>
        <FeeCard title={t('My current volume')} className="sm:col-span-2">
          <CurrentVolume
            tiers={volumeTiers}
            tierIndex={volumeTierIndex}
            windowLengthVolume={volumeInWindow}
            epochs={volumeDiscountEpochs}
          />
        </FeeCard>
        <FeeCard title={t('Referral benefits')} className="sm:col-span-2">
          <ReferralBenefits
            setRunningNotionalTakerVolume={referralVolumeInWindow}
            epochsInSet={epochsInSet}
            epochs={referralDiscountEpochs}
          />
        </FeeCard>
        <FeeCard
          title={t('Volume discount')}
          className="lg:col-span-full xl:col-span-2"
        >
          <VolumeTiers
            tiers={volumeTiers}
            tierIndex={volumeTierIndex}
            lastEpochVolume={volumeInWindow}
          />
        </FeeCard>
        <FeeCard
          title={t('Referral discount')}
          className="lg:col-span-full xl:col-span-2"
        >
          <ReferralTiers tiers={referralTiers} tierIndex={referralTierIndex} />
        </FeeCard>
        <FeeCard title={t('Liquidity fees')} className="lg:col-span-full">
          <MarketFees
            markets={markets}
            referralDiscount={referralDiscount}
            volumeDiscount={volumeDiscount}
          />
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

const TradingFees = ({
  params,
  markets,
  referralDiscount,
  volumeDiscount,
}: {
  params: {
    market_fee_factors_infrastructureFee: string;
    market_fee_factors_makerFee: string;
  };
  markets: MarketMaybeWithDataAndCandles[] | null;
  referralDiscount: number;
  volumeDiscount: number;
}) => {
  // Show min and max liquidity fees from all markets
  const minLiq = minBy(markets, (m) => Number(m.fees.factors.liquidityFee));
  const maxLiq = maxBy(markets, (m) => Number(m.fees.factors.liquidityFee));

  const total =
    Number(params.market_fee_factors_makerFee) +
    Number(params.market_fee_factors_infrastructureFee);

  const adjustedTotal = getAdjustedFee(
    [total],
    [referralDiscount, volumeDiscount]
  );

  let minTotal;
  let maxTotal;

  let minAdjustedTotal;
  let maxAdjustedTotal;

  if (minLiq && maxLiq) {
    const minLiqFee = Number(minLiq.fees.factors.liquidityFee);
    const maxLiqFee = Number(maxLiq.fees.factors.liquidityFee);

    minTotal = total + minLiqFee;
    maxTotal = total + maxLiqFee;

    minAdjustedTotal = getAdjustedFee(
      [total, minLiqFee],
      [referralDiscount, volumeDiscount]
    );

    maxAdjustedTotal = getAdjustedFee(
      [total, maxLiqFee],
      [referralDiscount, volumeDiscount]
    );
  }

  return (
    <div>
      <div className="pt-6 leading-none">
        <p className="block text-3xl leading-none">
          {minAdjustedTotal !== undefined && maxAdjustedTotal !== undefined
            ? `${formatPercentage(minAdjustedTotal)}%-${formatPercentage(
                maxAdjustedTotal
              )}%`
            : `${formatPercentage(adjustedTotal)}%`}
        </p>
        <table className="w-full mt-0.5 text-xs text-muted">
          <tbody>
            <tr>
              <th className="font-normal text-left text-default">
                {t('Total fee before discount')}
              </th>
              <td className="text-right text-default">
                {minTotal !== undefined && maxTotal !== undefined
                  ? `${formatPercentage(minTotal)}%-${formatPercentage(
                      maxTotal
                    )}%`
                  : `${formatPercentage(total)}%`}
              </td>
            </tr>
            <tr>
              <th className="font-normal text-left">{t('Infrastructure')}</th>
              <td className="text-right">
                {formatPercentage(
                  Number(params.market_fee_factors_infrastructureFee)
                )}
                %
              </td>
            </tr>
            <tr>
              <th className="font-normal text-left ">{t('Maker')}</th>
              <td className="text-right">
                {formatPercentage(Number(params.market_fee_factors_makerFee))}%
              </td>
            </tr>
            {minLiq && maxLiq && (
              <tr>
                <th className="font-normal text-left ">{t('Liquidity')}</th>
                <td className="text-right">
                  {formatPercentage(Number(minLiq.fees.factors.liquidityFee))}%
                  {'-'}
                  {formatPercentage(Number(maxLiq.fees.factors.liquidityFee))}%
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CurrentVolume = ({
  tiers,
  tierIndex,
  windowLengthVolume,
  epochs,
}: {
  tiers?: Array<{ minimumRunningNotionalTakerVolume: string }>;
  tierIndex: number;
  windowLengthVolume: number;
  epochs: number;
}) => {
  // TODO sum windowLength volume

  let requiredForNextTier = 0;

  if (tiers && tierIndex) {
    const nextTier = tiers[tierIndex - 1];
    requiredForNextTier = nextTier
      ? Number(nextTier.minimumRunningNotionalTakerVolume) - windowLengthVolume
      : 0;
  }

  return (
    <div>
      <Stat
        value={formatNumber(windowLengthVolume)}
        text={t('Past %s epochs', epochs.toString())}
      />
      {requiredForNextTier > 0 && (
        <Stat
          value={formatNumber(requiredForNextTier)}
          text={t('Required for next tier')}
        />
      )}
    </div>
  );
};

const ReferralBenefits = ({
  epochsInSet,
  setRunningNotionalTakerVolume,
  epochs,
}: {
  epochsInSet: number;
  setRunningNotionalTakerVolume: number;
  epochs: number;
}) => {
  return (
    <div>
      <Stat
        // all sets volume (not just current party)
        value={formatNumber(setRunningNotionalTakerVolume)}
        text={t(
          'Combined running notional over the %s epochs',
          epochs.toString()
        )}
      />
      <Stat value={epochsInSet} text={t('epochs in referral set')} />
    </div>
  );
};

const TotalDiscount = ({
  referralDiscount,
  volumeDiscount,
}: {
  referralDiscount: number;
  volumeDiscount: number;
}) => {
  return (
    <div>
      <Stat
        value={formatPercentage(referralDiscount + volumeDiscount) + '%'}
        highlight={true}
      />
      <table className="w-full mt-0.5 text-xs text-muted">
        <tbody>
          <tr>
            <th className="font-normal text-left">{t('Volume discount')}</th>
            <td className="text-right">{formatPercentage(volumeDiscount)}%</td>
          </tr>
          <tr>
            <th className="font-normal text-left ">{t('Referral discount')}</th>
            <td className="text-right">
              {formatPercentage(referralDiscount)}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const VolumeTiers = ({
  tiers,
  tierIndex,
  lastEpochVolume,
}: {
  tiers: Array<{
    volumeDiscountFactor: string;
    minimumRunningNotionalTakerVolume: string;
  }>;
  tierIndex: number;
  lastEpochVolume: number;
}) => {
  if (!tiers.length) {
    return (
      <p className="text-sm text-muted">
        {t('No volume discount program active')}
      </p>
    );
  }

  return (
    <div>
      <Table>
        <THead>
          <tr>
            <Th>{t('Tier')}</Th>
            <Th>{t('Discount')}</Th>
            <Th>{t('Min. trading volume')}</Th>
            <Th>{t('My volume (last epoch)')}</Th>
            <Th />
          </tr>
        </THead>
        <tbody>
          {tiers.map((tier, i) => {
            const isUserTier = tierIndex === i;

            return (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{formatPercentage(Number(tier.volumeDiscountFactor))}%</Td>
                <Td>{formatNumber(tier.minimumRunningNotionalTakerVolume)}</Td>
                <Td>{isUserTier ? formatNumber(lastEpochVolume) : ''}</Td>
                <Td>{isUserTier ? <YourTier /> : null}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const ReferralTiers = ({
  tiers,
  tierIndex,
}: {
  tiers: Array<{
    referralDiscountFactor: string;
    minimumRunningNotionalTakerVolume: string;
    minimumEpochs: number;
  }>;
  tierIndex: number;
}) => {
  if (!tiers.length) {
    return (
      <p className="text-sm text-muted">{t('No referral program active')}</p>
    );
  }

  return (
    <div>
      <Table>
        <THead>
          <tr>
            <Th>{t('Tier')}</Th>
            <Th>{t('Discount')}</Th>
            <Th>{t('Min. trading volume')}</Th>
            <Th>{t('Required epochs')}</Th>
            <Th />
          </tr>
        </THead>
        <tbody>
          {tiers.map((t, i) => {
            const isUserTier = tierIndex === i;

            return (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{formatPercentage(Number(t.referralDiscountFactor))}%</Td>
                <Td>{formatNumber(t.minimumRunningNotionalTakerVolume)}</Td>
                <Td>{t.minimumEpochs}</Td>
                <Td>{isUserTier ? <YourTier /> : null}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const YourTier = () => {
  return (
    <span className="px-4 py-1.5 rounded-xl bg-rainbow whitespace-nowrap text-white">
      {t('Your tier')}
    </span>
  );
};
