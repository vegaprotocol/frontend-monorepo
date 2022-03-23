import { Web3Container } from '../../../components/web3-container';
import { DepositForm } from './deposit-form';

const Deposit = () => {
  return (
    <Web3Container>
      {({ ethereumConfig }) => (
        <div className="p-24">
          <h1 className="text-h3">Deposit</h1>
          <p>
            Bridge address: {ethereumConfig.collateral_bridge_contract.address}
          </p>
          <DepositForm />
        </div>
      )}
    </Web3Container>
  );
};

export default Deposit;
