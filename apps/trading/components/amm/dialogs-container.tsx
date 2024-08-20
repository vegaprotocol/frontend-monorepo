import { ConnectEthDialog } from './connect-eth-wallet';
import { ConnectVegaDialog } from './connect-vega-wallet';

export const DialogsContainer = () => {
  return (
    <>
      <ConnectEthDialog />
      <ConnectVegaDialog />
    </>
  );
};
