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
import { Card, CardStat, CardTable, CardTableTD, CardTableTH } from '../card';
import { MarketFees } from './market-fees';
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
    useDiscountProgramsQuery();

  const volumeDiscountWindowLength =
    programData?.currentVolumeDiscountProgram?.windowLength || 1;
  const referralDiscountWindowLength =
    programData?.currentReferralProgram?.windowLength || 1;

  const { data: feesData, loading: feesLoading } = useFeesQuery({
    variables: {
      partyId: pubKey || '',
      volumeDiscountEpochs: volumeDiscountWindowLength,
      referralDiscountEpochs: referralDiscountWindowLength,
    },
    skip: !pubKey || !programData,
  });

  const { volumeDiscount, volumeTierIndex, volumeInWindow, volumeTiers } =
    useVolumeStats(
      feesData?.volumeDiscountStats,
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
    feesData?.referralSetStats,
    feesData?.referralSetReferees,
    programData?.currentReferralProgram,
    feesData?.epoch,
    feesData?.referrer,
    feesData?.referee
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
          <Card
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
          </Card>
          <Card
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
          </Card>
          <Card
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
              <p className="text-muted pt-3 text-sm">
                {t('No volume discount program active')}
              </p>
            )}
          </Card>
          <Card
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
              <p className="text-muted pt-3 text-sm">
                {t('No referral program active')}
              </p>
            )}
          </Card>
        </>
      )}
      <Card
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
      </Card>
      <Card
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
      </Card>
      <Card
        title={t('Fees by market')}
        className="lg:col-span-full"
        loading={marketsLoading}
      >
        <MarketFees
          markets={markets}
          referralDiscount={referralDiscount}
          volumeDiscount={volumeDiscount}
        />
      </Card>
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
    <div className="pt-4">
      <div className="leading-none">
        <p className="block text-3xl leading-none" data-testid="adjusted-fees">
          {minAdjustedTotal !== undefined && maxAdjustedTotal !== undefined
            ? `${formatPercentage(minAdjustedTotal)}%-${formatPercentage(
                maxAdjustedTotal
              )}%`
            : `${formatPercentage(adjustedTotal)}%`}
        </p>
        <CardTable>
          <tr className="text-default">
            <CardTableTH>{t('Total fee before discount')}</CardTableTH>
            <CardTableTD>
              {minTotal !== undefined && maxTotal !== undefined
                ? `${formatPercentage(minTotal.toNumber())}%-${formatPercentage(
                    maxTotal.toNumber()
                  )}%`
                : `${formatPercentage(total.toNumber())}%`}
            </CardTableTD>
          </tr>
          <tr>
            <CardTableTH>{t('Infrastructure')}</CardTableTH>
            <CardTableTD>
              {formatPercentage(
                Number(params.market_fee_factors_infrastructureFee)
              )}
              %
            </CardTableTD>
          </tr>
          <tr>
            <CardTableTH>{t('Maker')}</CardTableTH>
            <CardTableTD>
              {formatPercentage(Number(params.market_fee_factors_makerFee))}%
            </CardTableTD>
          </tr>
          {minLiq && maxLiq && (
            <tr>
              <CardTableTH>{t('Liquidity')}</CardTableTH>
              <CardTableTD>
                {formatPercentage(Number(minLiq.fees.factors.liquidityFee))}%
                {'-'}
                {formatPercentage(Number(maxLiq.fees.factors.liquidityFee))}%
              </CardTableTD>
            </tr>
          )}
        </CardTable>
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
    <div className="flex flex-col gap-3 pt-4">
      <CardStat
        value={formatNumberRounded(new BigNumber(windowLengthVolume))}
        text={t('Past %s epochs', windowLength.toString())}
      />
      {requiredForNextTier > 0 && (
        <CardStat
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
    <div className="flex flex-col gap-3 pt-4">
      <CardStat
        // all sets volume (not just current party)
        value={formatNumber(setRunningNotionalTakerVolume)}
        text={t(
          'Combined running notional over the %s epochs',
          epochs.toString()
        )}
      />
      <CardStat value={epochsInSet} text={t('epochs in referral set')} />
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
    <div className="pt-4">
      <CardStat
        description={
          <>
            {totalDiscountDescription}
            {formula}
          </>
        }
        value={formatPercentage(totalDiscount) + '%'}
        highlight={true}
      />
      <CardTable>
        <tr>
          <CardTableTH>{t('Volume discount')}</CardTableTH>
          <CardTableTD>
            {formatPercentage(volumeDiscount)}%
            {!isVolumeDiscountProgramRunning && (
              <Tooltip description={t('No active volume discount programme')}>
                <span className="cursor-help">
                  {' '}
                  <VegaIcon name={VegaIconNames.INFO} size={12} />
                </span>
              </Tooltip>
            )}
          </CardTableTD>
        </tr>
        <tr>
          <CardTableTH>{t('Referral discount')}</CardTableTH>
          <CardTableTD>
            {formatPercentage(referralDiscount)}%
            {!isReferralProgramRunning && (
              <Tooltip description={t('No active referral programme')}>
                <span className="cursor-help">
                  {' '}
                  <VegaIcon name={VegaIconNames.INFO} size={12} />
                </span>
              </Tooltip>
            )}
          </CardTableTD>
        </tr>
      </CardTable>
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
      <p className="text-muted text-sm">
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
          {Array.from(tiers)
            .reverse()
            .map((tier, i) => {
              const isUserTier = tiers.length - 1 - tierIndex === i;

              return (
                <Tr key={i}>
                  <Td>{i + 1}</Td>
                  <Td>
                    {formatPercentage(Number(tier.volumeDiscountFactor))}%
                  </Td>
                  <Td>
                    {formatNumber(tier.minimumRunningNotionalTakerVolume)}
                  </Td>
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
      <p className="text-muted text-sm">{t('No referral program active')}</p>
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
          {Array.from(tiers)
            .reverse()
            .map((t, i) => {
              const isUserTier = tiers.length - 1 - tierIndex === i;

              const requiredVolume = Number(
                t.minimumRunningNotionalTakerVolume
              );
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
    <span className="bg-rainbow whitespace-nowrap rounded-xl px-4 py-1.5 text-white">
      {t('Your tier')}
    </span>
  );
};

const ReferrerInfo = ({ code }: { code?: string }) => (
  <div className="text-vega-clight-200 dark:vega-cdark-200 pt-3 text-sm">
    <p className="mb-1">
      {t('Connected key is owner of the referral set')}
      {code && (
        <>
          {' '}
          <span className="bg-rainbow bg-clip-text text-transparent">
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
        className="text-black underline dark:text-white"
        to={Links.REFERRALS()}
      >
        {t('Referrals')}
      </Link>{' '}
      {t('for more information.')}
    </p>
  </div>
);
