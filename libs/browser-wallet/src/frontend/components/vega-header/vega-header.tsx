import { Vega } from '../icons/vega';
import { VegaIcon } from '../icons/vega-icon';

export const VegaHeader = () => {
  return (
    <>
      <div className="flex justify-center mt-16">
        <VegaIcon />
      </div>
      <div className="flex justify-center mt-5 mb-10">
        <div className="px-3 mt-1 border-r border-surface-0-fg-muted flex flex-col justify-center">
          <Vega />
        </div>
        <div className="calt text-surface-0-fg px-3 text-3xl flex flex-col justify-center">
          wallet
        </div>
      </div>
    </>
  );
};
