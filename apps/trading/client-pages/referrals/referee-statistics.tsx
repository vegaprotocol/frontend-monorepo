import { cn } from '@vegaprotocol/utils';
import { useRefereeStats } from './hooks/use-referee-stats';
import {
  BenefitTierTile,
  DiscountTile,
  EpochsTile,
  NextTierEpochsTile,
  NextTierVolumeTile,
  NoProgramTileFor,
  RunningVolumeTile,
  TeamTile,
} from './tiles';
import { useStakeAvailable } from '../../lib/hooks/use-stake-available';
import { CodeTile } from './tile';
import { useT } from '../../lib/use-t';
import { ApplyCodeForm } from './apply-code-form';
import { useVegaWallet } from '@vegaprotocol/wallet-react';
import { useReferralProgram } from './hooks/use-referral-program';
import { DEFAULT_AGGREGATION_DAYS } from './constants';
import { useReferralSet } from './hooks/use-find-referral-set';
import { Loader } from '@vegaprotocol/ui-toolkit';
import minBy from 'lodash/minBy';
import BigNumber from 'bignumber.js';

export const RefereeStatistics = ({
  aggregationEpochs,
  setId,
  pubKey,
  referrerPubKey,
}: {
  /** The aggregation epochs used to calculate statistics. */
  aggregationEpochs: number;
  /** The set id (code). */
  setId: string;
  /** The referee public key. */
  pubKey: string;
  /** The referrer's public key. */
  referrerPubKey: string;
}) => {
  const t = useT();
  const {
    benefitTier,
    discountFactor,
    epochs,
    nextBenefitTier,
    runningVolume,
  } = useRefereeStats(pubKey, setId, aggregationEpochs);

  const { isEligible } = useStakeAvailable(referrerPubKey);

  const { details } = useReferralProgram();
  const isProgramRunning = Boolean(details);

  return (
    <>
      <div
        data-testid="referral-statistics"
        data-as="referee"
        className="relative mx-auto mb-20"
      >
        <div className={cn('grid grid-cols-1 grid-rows-1 gap-5')}>
          {/** TEAM TILE - referral set id is the same as team id */}
          <TeamTile teamId={setId} />
          {/** TILES ROW 1 */}
          <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
            {isProgramRunning ? (
              <>
                <BenefitTierTile
                  benefitTier={benefitTier}
                  nextBenefitTier={nextBenefitTier}
                />
                <RunningVolumeTile
                  aggregationEpochs={aggregationEpochs}
                  runningVolume={runningVolume}
                />
              </>
            ) : (
              <>
                <NoProgramTileFor tile={BenefitTierTile.name} />
                <NoProgramTileFor tile={RunningVolumeTile.name} />
              </>
            )}
            <CodeTile code={setId} />
          </div>
          {/** TILES ROW 2 */}
          <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {isProgramRunning ? (
              <>
                <DiscountTile discountFactor={discountFactor} />
                <NextTierVolumeTile
                  nextBenefitTier={nextBenefitTier}
                  runningVolume={runningVolume}
                />
              </>
            ) : (
              <>
                <NoProgramTileFor tile={DiscountTile.name} />
                <NoProgramTileFor tile={NextTierVolumeTile.name} />
              </>
            )}
            <EpochsTile epochs={epochs} />
            {isProgramRunning ? (
              <NextTierEpochsTile
                epochs={epochs}
                nextBenefitTier={nextBenefitTier}
              />
            ) : (
              <NoProgramTileFor tile={NextTierEpochsTile.name} />
            )}
          </div>
        </div>
        {/** ELIGIBILITY WARNING */}
        {!isEligible ? (
          <div
            data-testid="referral-eligibility-warning"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-1/2 lg:w-1/3"
          >
            <h2 className="text-2xl mb-2">
              {t('Referral code no longer valid')}
            </h2>
            <p>
              {t(
                'Your referral code is no longer valid as the referrer no longer meets the minimum requirements. Apply a new code to continue receiving discounts.'
              )}
            </p>
          </div>
        ) : null}
      </div>
      {!isEligible && <ApplyCodeForm />}
    </>
  );
};

export const PreviewRefereeStatistics = ({
  setId,
  withTeamTile = true,
  className,
}: {
  setId: string;
  withTeamTile?: boolean;
  className?: string;
}) => {
  const program = useReferralProgram();
  const aggregationEpochs =
    program.details?.windowLength || DEFAULT_AGGREGATION_DAYS;

  const { pubKey } = useVegaWallet();

  const { data: referralSet, loading } = useReferralSet(setId);

  const {
    epochs,
    runningVolume,
    benefitTier,
    nextBenefitTier,
    discountFactor,
  } = useRefereeStats(pubKey || '', referralSet?.id || '', aggregationEpochs);

  if (loading) {
    return (
      <div
        data-testid="referral-statistics"
        data-as="referee"
        data-preview
        className="relative mx-auto mb-20"
      >
        <Loader size="small" />
      </div>
    );
  }

  if (!referralSet) {
    return null;
  }

  const stat = <T,>(value: T) => ({
    value,
    loading: false,
    error: undefined,
  });

  const firstBenefitTier = stat(minBy(program.benefitTiers, (bt) => bt.epochs));

  const secondBenefitTier = stat(
    program.benefitTiers.find(
      (bt) =>
        bt.tier ===
        (firstBenefitTier.value?.tier
          ? firstBenefitTier.value.tier + 1
          : undefined)
    )
  );

  const firstDiscountFactor = stat(
    firstBenefitTier.value?.discountFactor
      ? BigNumber(firstBenefitTier.value?.discountFactor)
      : BigNumber(0)
  );

  return (
    <div
      data-testid="referral-statistics"
      data-as="referee"
      data-preview
      className={cn('relative mx-auto mb-20', className)}
    >
      <div className={cn('grid grid-cols-1 grid-rows-1 gap-5')}>
        {/** TEAM TILE - referral set id is the same as team id */}
        {withTeamTile && <TeamTile teamId={setId} />}
        {/** TILES ROW 1 */}
        <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
          <BenefitTierTile
            benefitTier={
              benefitTier.value != null ? benefitTier : firstBenefitTier
            }
            nextBenefitTier={
              benefitTier.value != null ? nextBenefitTier : secondBenefitTier
            }
          />
          <RunningVolumeTile
            aggregationEpochs={aggregationEpochs}
            runningVolume={runningVolume}
          />
          <CodeTile code={setId} />
        </div>
        {/** TILES ROW 2 */}
        <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <DiscountTile
            discountFactor={
              !discountFactor.value.isZero()
                ? discountFactor
                : firstDiscountFactor || stat(BigNumber(0))
            }
          />
          <NextTierVolumeTile
            nextBenefitTier={
              benefitTier.value != null ? nextBenefitTier : secondBenefitTier
            }
            runningVolume={runningVolume}
          />
          <EpochsTile epochs={pubKey ? epochs : stat(BigNumber(0))} />
          <NextTierEpochsTile
            epochs={pubKey ? epochs : stat(BigNumber(0))}
            nextBenefitTier={
              benefitTier.value != null ? nextBenefitTier : secondBenefitTier
            }
          />
        </div>
      </div>
    </div>
  );
};
