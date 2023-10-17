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
import { format, getVolumeTier } from './utils';
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

  const referralStats = compact(data.referralSetStats.edges).map((e) => e.node);
  const referralDiscount = Number(referralStats[0].discountFactor || 0);
  const volumeStats = compact(data.volumeDiscountStats.edges).map(
    (e) => e.node
  );
  const volumeDiscount = Number(volumeStats[0].discountFactor || 0);

  const lastEpochVolumeStats = data.volumeDiscountStats
    ? maxBy(compact(data.volumeDiscountStats.edges), (e) => e.node.atEpoch)
    : undefined;
  const lastEpochVolume = Number(lastEpochVolumeStats?.node.runningVolume || 0);

  const tierIndex = data.currentVolumeDiscountProgram?.benefitTiers.length
    ? getVolumeTier(
        lastEpochVolume,
        data.currentVolumeDiscountProgram.benefitTiers
      )
    : undefined;

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
            tierIndex={tierIndex}
          />
        </FeeCard>
        <FeeCard title={t('Referral benefits')}>
          <ReferralBenefits
            currentEpoch={data.epoch}
            setReferees={data.referralSetReferees}
            setStats={data.referralSetStats}
          />
        </FeeCard>
        <FeeCard title={t('Volume discount')} className="lg:col-span-2">
          <VolumeTiers program={data.currentVolumeDiscountProgram} />
        </FeeCard>
        <FeeCard title={t('Referral discount')} className="lg:col-span-2">
          <ReferralTiers program={data.currentReferralProgram} />
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
  tierIndex: number | undefined;
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
  currentEpoch,
  setReferees,
  setStats,
}: {
  currentEpoch: FeesQuery['epoch'];
  setReferees: FeesQuery['referralSetReferees'];
  setStats: FeesQuery['referralSetStats'];
}) => {
  const referralSetsStats = compact(setStats.edges).map((e) => e.node);
  const referralSets = compact(setReferees.edges).map((e) => e.node);

  if (referralSets.length > 1 || referralSetsStats.length > 1) {
    throw new Error('more than one referral set for user');
  }

  // you can only be in one referral set at a time
  const referralSet = referralSets[0];
  const referralStats = referralSetsStats[0];
  const epochsInSet = Number(currentEpoch.id) - referralSet.atEpoch;

  return (
    <div>
      <Stat
        // all sets volume (not just current party)
        value={referralStats.referralSetRunningNotionalTakerVolume}
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
            <Th>{t('Min. trading volume')}</Th>
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
            <Th>{t('Min. trading volume')}</Th>
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

const Stat = ({ value, text }: { value: string | number; text?: string }) => {
  return (
    <p className="pt-3 leading-none first:pt-6">
      <span className="block text-3xl leading-none">{value}</span>
      {text && <small className="block text-xs text-muted">{text}</small>}
    </p>
  );
};
