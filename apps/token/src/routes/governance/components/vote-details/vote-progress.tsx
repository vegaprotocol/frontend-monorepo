import "./vote-progress.scss";

import { BigNumber } from "../../../../lib/bignumber";

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
        className="vote-progress__indicator"
        style={{ left: `${threshold}%` }}
      ></div>
      <div className="bp3-progress-bar bp3-no-stripes vote-progress__container">
        <div
          className="bp3-progress-meter vote-progress__bar"
          data-testid="vote-progress-bar"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>
    </>
  );
};
