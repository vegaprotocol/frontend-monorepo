import type { BigNumber } from '../../../../lib/bignumber';

export const VoteProgress = ({
  progress,
  threshold,
}: {
  threshold: BigNumber;
  progress: BigNumber;
}) => {
  return (
    <div className="w-full h-4 relative bg-black-50">
      <div
        data-testid="vote-progress-indicator"
        className="absolute top-[-5px] w-[1px] h-16 bg-white z-[1]"
        style={{ left: `${threshold}%` }}
      />
      <div className="w-full h-4">
        <div
          className="absolute left-0 bg-vega-green h-4"
          data-testid="vote-progress-bar"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
};
