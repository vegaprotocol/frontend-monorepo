import classNames from 'classnames';
import { useReferrerStats } from './hooks/use-referrer-stats';
import {
  BaseCommissionTile,
  FinalCommissionTile,
  RefereesTile,
  StakingMultiplierTile,
  TeamTile,
  TotalCommissionTile,
  VolumeTile,
  dateFormatter,
} from './tiles';
import { CodeTile } from './tile';

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

  return (
    <div
      data-testid="referral-statistics"
      data-as="referrer"
      className="relative mx-auto mb-20"
    >
      <div className={classNames('grid grid-cols-1 grid-rows-1 gap-5')}>
        {/** TEAM TILE - referral set id is the same as team id */}
        <TeamTile teamId={setId} />
        {/** TILES ROW 1 */}
        <div className="grid grid-rows-1 gap-5 grid-cols-1 md:grid-cols-3">
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
        </div>
        {/** TILES ROW 2 */}
        <div className="grid grid-rows-1 gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <CodeTile code={setId} createdAt={dateFormatter(createdAt)} />
          <VolumeTile aggregationEpochs={aggregationEpochs} volume={volume} />
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
