import { VegaWalletContainer } from '../../../components/vega-wallet-container';
import { Web3Container } from '../../../components/web3-container';
import { WithdrawalsContainer } from '../withdrawals-container';

const Withdrawals = () => {
  return (
    <VegaWalletContainer>
      <Web3Container>
        <WithdrawalsContainer />
      </Web3Container>
    </VegaWalletContainer>
  );
};

export default Withdrawals;
