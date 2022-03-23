import { Web3Container } from '../../../components/web3-container';
import { DepositContainer } from './deposit-container';

const Deposit = () => {
  return (
    <Web3Container>
      {({ ethereumConfig }) => (
        <DepositContainer ethereumConfig={ethereumConfig} />
      )}
    </Web3Container>
  );
};

export default Deposit;
