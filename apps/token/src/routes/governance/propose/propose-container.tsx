import { VegaWalletContainer } from '../../../components/vega-wallet-container';
import { Propose } from './propose';

export const ProposeContainer = () => {
  return (
    <VegaWalletContainer>
      {(currVegaKey) => <Propose pubKey={currVegaKey} />}
    </VegaWalletContainer>
  );
};
