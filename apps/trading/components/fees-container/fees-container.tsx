import type { ReactNode } from 'react';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import classNames from 'classnames';
import { t } from '@vegaprotocol/i18n';
import type { FeesQuery } from './__generated__/Fees';
import { useFeesQuery } from './__generated__/Fees';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  useNetworkParams,
  NetworkParams,
} from '@vegaprotocol/network-parameters';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { useMarketList } from '@vegaprotocol/markets';
import { MarketFees } from './market-fees';
import { format } from './utils';
import { Table, Td, Th, THead, Tr } from './table';
import { useVolumeStats } from './use-volume-stats';
import { useReferralStats } from './use-referral-stats';

/**
 * TODO:
 * - Styles for ag grid dont work inside these cards
 * - Better loading states
 * - Remove hardcoded partyId
 */

const VOLUME_EPOCHS = 7;

export const FeesContainer = () => {
  const { pubKey } = useVegaWallet();
  const { params } = useNetworkParams([
    NetworkParams.market_fee_factors_makerFee,
    NetworkParams.market_fee_factors_infrastructureFee,
  ]);
  const { data, loading, error } = useFeesQuery({
    variables: {
      partyId:
        // TODO: change for pubkey
        '9e2445e0e98c0e0ca1c260baaab1e7a2f1b9c7256c27196be6e614ee44d1a1e7',
      volumeDiscountStatsEpochs: VOLUME_EPOCHS,
    },
    skip: !pubKey,
  });
  const { data: markets } = useMarketList();

  const { volumeDiscount, volumeTierIndex, volumeLastEpoch, volumeTiers } =
    useVolumeStats(
      data?.volumeDiscountStats,
      data?.currentVolumeDiscountProgram
    );

  const {
    referralDiscount,
    referralVolume,
    referralTierIndex,
    referralTiers,
    epochsInSet,
  } = useReferralStats(
    data?.referralSetStats,
    data?.referralSetReferees,
    data?.currentReferralProgram,
    data?.epoch
  );

  if (!pubKey) {
    return <p>Please connect wallet</p>;
  }

  if (error) {
    return <p>Failed to fetch fee data</p>;
  }

  // TODO: skeleton loading states
  if (loading || !data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-3">
      <h1 className="px-4 pt-2 pb-4 text-2xl">{t('Fees')}</h1>
      <div className="grid auto-rows-min grid-cols-4 gap-3">
        <FeeCard title={t('My trading fees')} className="sm:col-span-2">
          <TradingFees params={params} markets={markets} />
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
            lastEpochVolume={volumeLastEpoch}
          />
        </FeeCard>
        <FeeCard title={t('Referral benefits')} className="sm:col-span-2">
          <ReferralBenefits
            setRunningNotionalTakerVolume={referralVolume}
            epochsInSet={epochsInSet}
          />
        </FeeCard>
        <FeeCard
          title={t('Volume discount')}
          className="lg:col-span-full xl:col-span-2"
        >
          <VolumeTiers
            tiers={volumeTiers}
            tierIndex={volumeTierIndex}
            lastEpochVolume={volumeLastEpoch}
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
}: {
  params: {
    market_fee_factors_infrastructureFee: string;
    market_fee_factors_makerFee: string;
  };
  markets: MarketMaybeWithDataAndCandles[] | null;
}) => {
  // Show min and max liquidity fees from all markets
  const minLiq = minBy(markets, (m) => Number(m.fees.factors.liquidityFee));
  const maxLiq = maxBy(markets, (m) => Number(m.fees.factors.liquidityFee));

  const total =
    Number(params.market_fee_factors_makerFee) +
    Number(params.market_fee_factors_infrastructureFee);

  let minTotal = total;
  let maxTotal = total;

  if (minLiq && maxLiq) {
    minTotal = total + Number(minLiq.fees.factors.liquidityFee);
    maxTotal = total + Number(maxLiq.fees.factors.liquidityFee);
  }

  return (
    <div>
      <div className="pt-6 leading-none">
        <p className="block text-3xl leading-none">
          {minLiq && maxLiq
            ? `${format(minTotal)}%-${format(maxTotal)}%`
            : `${format(total)}%`}
        </p>
        <table className="w-full text-xs text-muted">
          <tbody>
            <tr>
              <th className="font-normal text-left">{t('Infrastructure')}</th>
              <td className="text-right">
                {format(Number(params.market_fee_factors_infrastructureFee))}%
              </td>
            </tr>
            <tr>
              <th className="font-normal text-left ">{t('Maker')}</th>
              <td className="text-right">
                {format(Number(params.market_fee_factors_makerFee))}%
              </td>
            </tr>
            {minLiq && maxLiq && (
              <tr>
                <th className="font-normal text-left ">{t('Liquidity')}</th>
                <td className="text-right">
                  {format(Number(minLiq.fees.factors.liquidityFee))}%{'-'}
                  {format(Number(maxLiq.fees.factors.liquidityFee))}%
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
  lastEpochVolume,
}: {
  tiers?: Array<{ minimumRunningNotionalTakerVolume: string }>;
  tierIndex: number;
  lastEpochVolume: number;
}) => {
  // TODO: clarify if volume discount is only for the last epoch, so no need
  // to sum up running volume

  // const total = compact(volumeStats.edges)
  //   .map((e) => e.node)
  //   .reduce((sum, d) => {
  //     return sum + BigInt(d.runningVolume);
  //   }, BigInt(0));

  let requiredForNextTier = 0;

  if (tiers && tierIndex) {
    const nextTier = tiers[tierIndex - 1];
    requiredForNextTier = nextTier
      ? Number(nextTier.minimumRunningNotionalTakerVolume) - lastEpochVolume
      : 0;
  }

  return (
    <div>
      <Stat value={lastEpochVolume} text={t('Over the last epoch')} />
      {requiredForNextTier > 0 && (
        <Stat value={requiredForNextTier} text={t('Required for next tier')} />
      )}
    </div>
  );
};

const ReferralBenefits = ({
  epochsInSet,
  setRunningNotionalTakerVolume,
}: {
  epochsInSet: number;
  setRunningNotionalTakerVolume: number;
}) => {
  return (
    <div>
      <Stat
        // all sets volume (not just current party)
        value={setRunningNotionalTakerVolume}
        text={'Combined running notional over the last epoch'}
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
        value={format(referralDiscount + volumeDiscount) + '%'}
        highlight={true}
      />
      <table className="w-full text-xs text-muted">
        <tbody>
          <tr>
            <th className="font-normal text-left">{t('Volume discount')}</th>
            <td className="text-right">{format(volumeDiscount)}%</td>
          </tr>
          <tr>
            <th className="font-normal text-left ">{t('Referral discount')}</th>
            <td className="text-right">{referralDiscount}%</td>
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
                <Td>{tier.volumeDiscountFactor}%</Td>
                <Td>{tier.minimumRunningNotionalTakerVolume}</Td>
                <Td>{isUserTier ? lastEpochVolume : ''}</Td>
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
                <Td>{t.referralDiscountFactor}%</Td>
                <Td>{t.minimumRunningNotionalTakerVolume}</Td>
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

const Stat = ({
  value,
  text,
  highlight,
}: {
  value: string | number;
  text?: string;
  highlight?: boolean;
}) => {
  return (
    <p className="pt-3 leading-none first:pt-6">
      <span
        className={classNames('inline-block text-3xl leading-none', {
          'text-transparent bg-rainbow bg-clip-text': highlight,
        })}
      >
        {value}
      </span>
      {text && <small className="block text-xs text-muted">{text}</small>}
    </p>
  );
};

const YourTier = () => {
  return (
    <span className="px-4 py-1.5 rounded-xl bg-rainbow whitespace-nowrap text-white">
      {t('Your tier')}
    </span>
  );
};
