import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { t } from '@vegaprotocol/i18n';
import { useVegaWallet } from '@vegaprotocol/wallet';
import {
  useNetworkParams,
  NetworkParams,
} from '@vegaprotocol/network-parameters';
import { useMarketList } from '@vegaprotocol/markets';
import { formatNumber, formatNumberRounded } from '@vegaprotocol/utils';
import { useDiscountProgramsQuery, useFeesQuery } from './__generated__/Fees';
import { FeeCard } from './fees-card';
import { MarketFees } from './market-fees';
import { Stat } from './stat';
import { useVolumeStats } from './use-volume-stats';
import { useReferralStats } from './use-referral-stats';
import { formatPercentage, getAdjustedFee } from './utils';
import { Table, Td, Th, THead, Tr } from './table';
import BigNumber from 'bignumber.js';
import { Links } from '../../lib/links';
import { Link } from 'react-router-dom';
import {
  Tooltip,
  VegaIcon,
  VegaIconNames,
  truncateMiddle,
} from '@vegaprotocol/ui-toolkit';

export const FeesContainer = () => {
  const { pubKey } = useVegaWallet();
  const { params, loading: paramsLoading } = useNetworkParams([
    NetworkParams.market_fee_factors_makerFee,
    NetworkParams.market_fee_factors_infrastructureFee,
  ]);

  const { data: markets, loading: marketsLoading } = useMarketList();

  const { data: programData, loading: programLoading } =
    useDiscountProgramsQuery({ errorPolicy: 'ignore' });

  const volumeDiscountWindowLength =
    programData?.currentVolumeDiscountProgram?.windowLength || 1;
  const referralDiscountWindowLength =
    programData?.currentReferralProgram?.windowLength || 1;
  const { data: feesData, loading: feesLoading } = useFeesQuery({
    variables: {
      partyId: pubKey || '',
    },
    skip: !pubKey,
  });

  const previousEpoch = (Number(feesData?.epoch.id) || 0) - 1;

  const { volumeDiscount, volumeTierIndex, volumeInWindow, volumeTiers } =
    useVolumeStats(
      previousEpoch,
      feesData?.volumeDiscountStats.edges?.[0]?.node,
      programData?.currentVolumeDiscountProgram
    );

  const {
    referralDiscount,
    referralVolumeInWindow,
    referralTierIndex,
    referralTiers,
    epochsInSet,
    code,
    isReferrer,
  } = useReferralStats(
    previousEpoch,
    feesData?.referralSetStats.edges?.[0]?.node,
    feesData?.referralSetReferees.edges?.[0]?.node,
    programData?.currentReferralProgram,
    feesData?.referrer.edges?.[0]?.node,
    feesData?.referee.edges?.[0]?.node
  );

  const loading = paramsLoading || feesLoading || programLoading;
  const isConnected = Boolean(pubKey);

  const isReferralProgramRunning = Boolean(programData?.currentReferralProgram);
  const isVolumeDiscountProgramRunning = Boolean(
    programData?.currentVolumeDiscountProgram
  );

  return (
    <div className="grid auto-rows-min grid-cols-4 gap-3">
      {isConnected && (
        <>
          <FeeCard
            title={t('My trading fees')}
            className="sm:col-span-2"
            loading={loading}
          >
            <TradingFees
              params={params}
              markets={markets}
              referralDiscount={referralDiscount}
              volumeDiscount={volumeDiscount}
            />
          </FeeCard>
          <FeeCard
            title={t('Total discount')}
            className="sm:col-span-2"
            loading={loading}
          >
            <TotalDiscount
              referralDiscount={referralDiscount}
              volumeDiscount={volumeDiscount}
              isReferralProgramRunning={isReferralProgramRunning}
              isVolumeDiscountProgramRunning={isVolumeDiscountProgramRunning}
            />
          </FeeCard>
          <FeeCard
            title={t('My current volume')}
            className="sm:col-span-2"
            loading={loading}
          >
            {isVolumeDiscountProgramRunning ? (
              <CurrentVolume
                tiers={volumeTiers}
                tierIndex={volumeTierIndex}
                windowLengthVolume={volumeInWindow}
                windowLength={volumeDiscountWindowLength}
              />
            ) : (
              <p className="pt-3 text-sm text-muted">
                {t('No volume discount program active')}
              </p>
            )}
          </FeeCard>
          <FeeCard
            title={t('Referral benefits')}
            className="sm:col-span-2"
            loading={loading}
          >
            {isReferrer ? (
              <ReferrerInfo code={code} />
            ) : isReferralProgramRunning ? (
              <ReferralBenefits
                setRunningNotionalTakerVolume={referralVolumeInWindow}
                epochsInSet={epochsInSet}
                epochs={referralDiscountWindowLength}
              />
            ) : (
              <p className="pt-3 text-sm text-muted">
                {t('No referral program active')}
              </p>
            )}
          </FeeCard>
        </>
      )}
      <FeeCard
        title={t('Volume discount')}
        className="lg:col-span-full xl:col-span-2"
        loading={loading}
      >
        <VolumeTiers
          tiers={volumeTiers}
          tierIndex={volumeTierIndex}
          lastEpochVolume={volumeInWindow}
          windowLength={volumeDiscountWindowLength}
        />
      </FeeCard>
      <FeeCard
        title={t('Referral discount')}
        className="lg:col-span-full xl:col-span-2"
        loading={loading}
      >
        <ReferralTiers
          tiers={referralTiers}
          tierIndex={referralTierIndex}
          epochsInSet={epochsInSet}
          referralVolumeInWindow={referralVolumeInWindow}
        />
      </FeeCard>
      <FeeCard
        title={t('Fees by market')}
        className="lg:col-span-full"
        loading={marketsLoading}
      >
        <MarketFees
          markets={markets}
          referralDiscount={referralDiscount}
          volumeDiscount={volumeDiscount}
        />
      </FeeCard>
    </div>
  );
};

export const TradingFees = ({
  params,
  markets,
  referralDiscount,
  volumeDiscount,
}: {
  params: {
    market_fee_factors_infrastructureFee: string;
    market_fee_factors_makerFee: string;
  };
  markets: Array<{ fees: { factors: { liquidityFee: string } } }> | null;
  referralDiscount: number;
  volumeDiscount: number;
}) => {
  const referralDiscountBigNum = new BigNumber(referralDiscount);
  const volumeDiscountBigNum = new BigNumber(volumeDiscount);

  // Show min and max liquidity fees from all markets
  const minLiq = minBy(markets, (m) => Number(m.fees.factors.liquidityFee));
  const maxLiq = maxBy(markets, (m) => Number(m.fees.factors.liquidityFee));

  const total = new BigNumber(params.market_fee_factors_makerFee).plus(
    new BigNumber(params.market_fee_factors_infrastructureFee)
  );

  const adjustedTotal = getAdjustedFee(
    [total],
    [referralDiscountBigNum, volumeDiscountBigNum]
  );

  let minTotal;
  let maxTotal;

  let minAdjustedTotal;
  let maxAdjustedTotal;

  if (minLiq && maxLiq) {
    const minLiqFee = new BigNumber(minLiq.fees.factors.liquidityFee);
    const maxLiqFee = new BigNumber(maxLiq.fees.factors.liquidityFee);

    minTotal = total.plus(minLiqFee);
    maxTotal = total.plus(maxLiqFee);

    minAdjustedTotal = getAdjustedFee(
      [total, minLiqFee],
      [referralDiscountBigNum, volumeDiscountBigNum]
    );

    maxAdjustedTotal = getAdjustedFee(
      [total, maxLiqFee],
      [referralDiscountBigNum, volumeDiscountBigNum]
    );
  }

  return (
    <div>
      <div className="pt-6 leading-none">
        <p className="block text-3xl leading-none" data-testid="adjusted-fees">
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
                  ? `${formatPercentage(
                      minTotal.toNumber()
                    )}%-${formatPercentage(maxTotal.toNumber())}%`
                  : `${formatPercentage(total.toNumber())}%`}
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

export const CurrentVolume = ({
  tiers,
  tierIndex,
  windowLengthVolume,
  windowLength,
}: {
  tiers: Array<{ minimumRunningNotionalTakerVolume: string }>;
  tierIndex: number;
  windowLengthVolume: number;
  windowLength: number;
}) => {
  const nextTier = tiers[tierIndex + 1];
  const requiredForNextTier = nextTier
    ? Number(nextTier.minimumRunningNotionalTakerVolume) - windowLengthVolume
    : 0;

  return (
    <div>
      <Stat
        value={formatNumberRounded(new BigNumber(windowLengthVolume))}
        text={t('Past %s epochs', windowLength.toString())}
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
  isReferralProgramRunning,
  isVolumeDiscountProgramRunning,
}: {
  referralDiscount: number;
  volumeDiscount: number;
  isReferralProgramRunning: boolean;
  isVolumeDiscountProgramRunning: boolean;
}) => {
  const totalDiscount = 1 - (1 - volumeDiscount) * (1 - referralDiscount);
  const totalDiscountDescription = t(
    'The total discount is calculated according to the following formula: '
  );
  const formula = (
    <span className="italic">
      1 - (1 - d<sub>volume</sub>) ⋇ (1 - d<sub>referral</sub>)
    </span>
  );

  return (
    <div>
      <Stat
        description={
          <>
            {totalDiscountDescription}
            {formula}
          </>
        }
        value={formatPercentage(totalDiscount) + '%'}
        highlight={true}
      />
      <table className="w-full mt-0.5 text-xs text-muted">
        <tbody>
          <tr>
            <th className="font-normal text-left">{t('Volume discount')}</th>
            <td className="text-right">
              {formatPercentage(volumeDiscount)}%
              {!isVolumeDiscountProgramRunning && (
                <Tooltip description={t('No active volume discount programme')}>
                  <span className="cursor-help">
                    {' '}
                    <VegaIcon name={VegaIconNames.INFO} size={12} />
                  </span>
                </Tooltip>
              )}
            </td>
          </tr>
          <tr>
            <th className="font-normal text-left ">{t('Referral discount')}</th>
            <td className="text-right">
              {formatPercentage(referralDiscount)}%
              {!isReferralProgramRunning && (
                <Tooltip description={t('No active referral programme')}>
                  <span className="cursor-help">
                    {' '}
                    <VegaIcon name={VegaIconNames.INFO} size={12} />
                  </span>
                </Tooltip>
              )}
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
  windowLength,
}: {
  tiers: Array<{
    volumeDiscountFactor: string;
    minimumRunningNotionalTakerVolume: string;
  }>;
  tierIndex: number;
  lastEpochVolume: number;
  windowLength: number;
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
            <Th>{t('My volume (last %s epochs)', windowLength.toString())}</Th>
            <Th />
          </tr>
        </THead>
        <tbody>
          {Array.from(tiers).map((tier, i) => {
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
  epochsInSet,
  referralVolumeInWindow,
}: {
  tiers: Array<{
    referralDiscountFactor: string;
    minimumRunningNotionalTakerVolume: string;
    minimumEpochs: number;
  }>;
  tierIndex: number;
  epochsInSet: number;
  referralVolumeInWindow: number;
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
          {Array.from(tiers).map((t, i) => {
            const isUserTier = tierIndex === i;

            const requiredVolume = Number(t.minimumRunningNotionalTakerVolume);
            let unlocksIn = null;

            if (
              referralVolumeInWindow >= requiredVolume &&
              epochsInSet < t.minimumEpochs
            ) {
              unlocksIn = (
                <span className="text-muted">
                  Unlocks in {t.minimumEpochs - epochsInSet} epochs
                </span>
              );
            }

            return (
              <Tr key={i}>
                <Td>{i + 1}</Td>
                <Td>{formatPercentage(Number(t.referralDiscountFactor))}%</Td>
                <Td>{formatNumber(t.minimumRunningNotionalTakerVolume)}</Td>
                <Td>{t.minimumEpochs}</Td>
                <Td>{isUserTier ? <YourTier /> : unlocksIn}</Td>
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

const ReferrerInfo = ({ code }: { code?: string }) => (
  <div className="pt-3 text-sm text-vega-clight-200 dark:vega-cdark-200">
    <p className="mb-1">
      {t('Connected key is owner of the referral set')}
      {code && (
        <>
          {' '}
          <span className="text-transparent bg-rainbow bg-clip-text">
            {truncateMiddle(code)}
          </span>
        </>
      )}
      {'. '}
      {t('As owner, it is eligible for commission not fee discounts.')}
    </p>
    <p>
      {t('See')}{' '}
      <Link
        className="underline text-black dark:text-white"
        to={Links.REFERRALS()}
      >
        {t('Referrals')}
      </Link>{' '}
      {t('for more information.')}
    </p>
  </div>
);
