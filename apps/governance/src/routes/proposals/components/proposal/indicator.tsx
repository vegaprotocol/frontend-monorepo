import { getIndicatorStyle } from './colours';

export const Indicator = ({ indicator }: { indicator: number }) => (
  <div className={getIndicatorStyle(indicator)}>
    <span className="absolute top-0 left-0 p-1 w-full text-center z-1">
      {indicator}
    </span>
  </div>
);
