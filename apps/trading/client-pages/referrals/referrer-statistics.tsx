import classNames from 'classnames';
import { useReferrerStats } from './hooks/use-referrer-stats';
import {
  BaseCommissionTile,
  FinalCommissionTile,
  NoProgramTileFor,
  RefereesTile,
  StakingMultiplierTile,
  TeamTile,
  TotalCommissionTile,
  VolumeTile,
  dateFormatter,
} from './tiles';
import { CodeTile } from './tile';
import { useReferralProgram } from './hooks/use-referral-program';

export const ReferrerStatistics = ({
  aggregationEpochs,
  setId,
  createdAt,
}: {
  /** The aggregation epochs used to calculate statistics. */
  aggregationEpochs: number;
  /** The set id (code). */
  setId: string;
  /** The referral set date of creation. */
  createdAt: string;
}) => {
  const {
    baseCommission,
    finalCommission,
    multiplier,
    referees,
    runningVolume,
    totalCommission,
    volume,
  } = useReferrerStats(setId, aggregationEpochs);

  const { details } = useReferralProgram();
  const isProgramRunning = Boolean(details);

  return (
    <div
      data-testid="referral-statistics"
      data-as="referrer"
      className="relative mx-auto"
    >
      <div className={classNames('grid grid-cols-1 grid-rows-1 gap-5')}>
        {/** TEAM TILE - referral set id is the same as team id */}
        <TeamTile teamId={setId} />
        {/** TILES ROW 1 */}
        <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
          {isProgramRunning ? (
            <>
              <BaseCommissionTile
                aggregationEpochs={aggregationEpochs}
                baseCommission={baseCommission}
                runningVolume={runningVolume}
              />
              <StakingMultiplierTile multiplier={multiplier} />
              <FinalCommissionTile
                baseCommission={baseCommission}
                multiplier={multiplier}
                finalCommission={finalCommission}
              />
            </>
          ) : (
            <>
              <NoProgramTileFor tile={BaseCommissionTile.name} />
              <NoProgramTileFor tile={StakingMultiplierTile.name} />
              <NoProgramTileFor tile={FinalCommissionTile.name} />
            </>
          )}
        </div>
        {/** TILES ROW 2 */}
        <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <CodeTile code={setId} createdAt={dateFormatter(createdAt)} />
          {isProgramRunning ? (
            <VolumeTile aggregationEpochs={aggregationEpochs} volume={volume} />
          ) : (
            <NoProgramTileFor tile={VolumeTile.name} />
          )}
          <RefereesTile referees={referees} />
          <TotalCommissionTile
            aggregationEpochs={aggregationEpochs}
            totalCommission={totalCommission}
          />
        </div>
      </div>
    </div>
  );
};
