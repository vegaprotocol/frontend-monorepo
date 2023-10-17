import type { ReactNode } from 'react';
import compact from 'lodash/compact';
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
import { format, getReferralBenefitTier, getVolumeTier } from './utils';
import { Table, Td, Th, THead } from './table';

/**
 * TODO:
 * - 'Your tier' pills
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

  // Referral data
  const referralSetsStats = compact(data.referralSetStats.edges).map(
    (e) => e.node
  );
  const referralSets = compact(data.referralSetReferees.edges).map(
    (e) => e.node
  );

  if (referralSets.length > 1 || referralSetsStats.length > 1) {
    throw new Error('more than one referral set for user');
  }

  const referralSet = referralSets[0];
  const referralStats = referralSetsStats[0];

  const epochsInSet = Number(data.epoch.id) - referralSet.atEpoch;
  const referralDiscount = Number(referralStats.discountFactor || 0);

  const referralTiers = data.currentReferralProgram?.benefitTiers.length
    ? [...data.currentReferralProgram.benefitTiers].reverse()
    : [];

  const referralTierIndex = getReferralBenefitTier(
    epochsInSet,
    Number(referralStats.referralSetRunningNotionalTakerVolume),
    referralTiers
  );

  // Volume data
  const volumeStats = compact(data.volumeDiscountStats.edges).map(
    (e) => e.node
  );

  const volumeDiscount = Number(volumeStats[0].discountFactor || 0);

  const lastEpochVolumeStats = data.volumeDiscountStats
    ? maxBy(volumeStats, (s) => s.atEpoch)
    : undefined;
  const lastEpochVolume = Number(lastEpochVolumeStats?.runningVolume || 0);

  const volumeTiers = data.currentVolumeDiscountProgram?.benefitTiers.length
    ? [...data.currentVolumeDiscountProgram.benefitTiers].reverse()
    : [];

  const volumeTierIndex = getVolumeTier(lastEpochVolume, volumeTiers);

  return (
    <div className="p-3">
      <h1 className="px-4 pt-2 pb-4 text-2xl">{t('Fees')}</h1>
      <div className="grid lg:auto-rows-min lg:grid-cols-4 gap-3">
        <FeeCard title={t('My trading fees')}>
          <TradingFees params={params} markets={markets} />
        </FeeCard>
        <FeeCard title={t('Total discount')}>
          <TotalDiscount
            referralDiscount={referralDiscount}
            volumeDiscount={volumeDiscount}
          />
        </FeeCard>
        <FeeCard title={t('My current volume')}>
          <CurrentVolume
            volumeProgram={data.currentVolumeDiscountProgram}
            lastEpochVolume={lastEpochVolume}
            tierIndex={volumeTierIndex}
          />
        </FeeCard>
        <FeeCard title={t('Referral benefits')}>
          <ReferralBenefits
            setRunningNotionalTakerVolume={Number(
              referralStats.referralSetRunningNotionalTakerVolume
            )}
            epochsInSet={epochsInSet}
          />
        </FeeCard>
        <FeeCard title={t('Volume discount')} className="lg:col-span-2">
          <VolumeTiers
            tiers={volumeTiers}
            tierIndex={volumeTierIndex}
            lastEpochVolume={lastEpochVolume}
          />
        </FeeCard>
        <FeeCard title={t('Referral discount')} className="lg:col-span-2">
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
  volumeProgram,
  tierIndex,
  lastEpochVolume,
}: {
  volumeProgram?: FeesQuery['currentVolumeDiscountProgram'];
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

  if (tierIndex) {
    const nextTier = volumeProgram?.benefitTiers[tierIndex + 1];
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
      <Stat value={format(referralDiscount + volumeDiscount) + '%'} />
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
    return <p>{t('No referral program active')}</p>;
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
              <tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{tier.volumeDiscountFactor}%</Td>
                <Td>{tier.minimumRunningNotionalTakerVolume}</Td>
                <Td>{isUserTier ? lastEpochVolume : ''}</Td>
                <Td>{isUserTier ? <YourTier /> : null}</Td>
              </tr>
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
    return <p>{t('No referral program active')}</p>;
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
              <tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{t.referralDiscountFactor}%</Td>
                <Td>{t.minimumRunningNotionalTakerVolume}</Td>
                <Td>{t.minimumEpochs}</Td>
                <Td>{isUserTier ? <YourTier /> : null}</Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

const Stat = ({ value, text }: { value: string | number; text?: string }) => {
  return (
    <p className="pt-3 leading-none first:pt-6">
      <span className="block text-3xl leading-none">{value}</span>
      {text && <small className="block text-xs text-muted">{text}</small>}
    </p>
  );
};

const YourTier = () => {
  return (
    <span className="px-4 py-1.5 rounded-xl bg-rainbow">{t('Your tier')}</span>
  );
};
