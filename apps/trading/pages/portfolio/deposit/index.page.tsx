import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '../../../components/web3-provider';

const Deposit = () => {
  return (
    <Web3Provider>
      <div>
        <h1>Deposit</h1>
        <Info />
      </div>
    </Web3Provider>
  );
};

const Info = () => {
  const { isActive, chainId, accounts } = useWeb3React();
  if (!isActive) {
    return <div>Not active</div>;
  }
  return (
    <div>
      <p>{chainId}</p>
      <p>{accounts[0]}</p>
    </div>
  );
};

export default Deposit;
