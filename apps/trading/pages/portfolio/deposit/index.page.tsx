import { useWeb3React } from '@web3-react/core';
import { Web3Container } from '../../../components/web3-container';

const Deposit = () => {
  return (
    <Web3Container>
      <div>
        <h1>Deposit</h1>
        <Info />
      </div>
    </Web3Container>
  );
};

const Info = () => {
  const { isActive, chainId, account } = useWeb3React();
  if (!isActive) {
    return <div>Not active</div>;
  }
  return (
    <div>
      <p>{chainId}</p>
      <p>{account}</p>
    </div>
  );
};

export default Deposit;
