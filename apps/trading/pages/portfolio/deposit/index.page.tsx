import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@vegaprotocol/web3-provider';
import { connectors } from '../../../lib/web3-connectors';

const Deposit = () => {
  return (
    <Web3Provider connectors={connectors}>
      <div>
        <h1>Deposit</h1>
        <Info />
      </div>
    </Web3Provider>
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
