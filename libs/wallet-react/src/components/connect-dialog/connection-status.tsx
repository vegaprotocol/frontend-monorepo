import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { type Status } from '@vegaprotocol/wallet';

export const ConnectionStatus = ({ status }: { status: Status }) => {
  if (status === 'connecting') {
    return (
      <>
        <h3 className="text-lg">Connecting...</h3>
        <p className="text-secondary">Confirm connection in your wallet</p>
      </>
    );
  }
  if (status === 'connected') {
    return (
      <div className="flex items-center gap-3">
        <VegaIcon name={VegaIconNames.TICK} className="text-vega-green" />
        <h3 className="text-lg">Connected</h3>
      </div>
    );
  }

  return null;
};
