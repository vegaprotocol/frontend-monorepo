import type { BigNumber } from '../../../../lib/bignumber';

export const VoteProgress = ({
  progress,
  threshold,
}: {
  threshold: BigNumber;
  progress: BigNumber;
}) => {
  return (
    <>
      <div
        data-testid="vote-progress-indicator"
        className="relative top-[10px] w-[1px] h-16 bg-white z-[1]"
        style={{ left: `${threshold}%` }}
      />
      <div className="bp3-progress-bar bp3-no-stripes bg-intent-danger rounded-none h-5">
        <div
          className="bp3-progress-meter bg-vega-green rounded-none"
          data-testid="vote-progress-bar"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </>
  );
};
