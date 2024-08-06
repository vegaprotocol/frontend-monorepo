import type BigNumber from 'bignumber.js';

export const VoteProgress = ({
  progress,
  threshold,
}: {
  threshold: BigNumber;
  progress: BigNumber;
}) => {
  return (
    <div data-testid="vote-progress" className="w-full h-1 relative bg-gs-500">
      <div
        data-testid="vote-progress-indicator"
        className="absolute -top-1 w-[1px] h-3 bg-gs-300 z-1"
        style={{ left: `${threshold}%` }}
      />
      <div className="w-full h-2">
        <div
          className="absolute left-0 bg-vega-green h-1"
          data-testid="vote-progress-bar-for"
          style={{
            width: `${progress}%`,
          }}
        />
        <div
          className="absolute right-0 bg-vega-pink h-1"
          data-testid="vote-progress-bar-against"
          style={{
            width: `${100 - progress.toNumber()}%`,
          }}
        />
      </div>
    </div>
  );
};
