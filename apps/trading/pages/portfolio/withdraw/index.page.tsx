import { WithdrawsContainer } from './withdraws-container';
import { Web3Container } from '../../../components/web3-container';

const Withdraw = () => {
  return (
    <Web3Container>
      {({ ethereumConfig }) => (
        <div className="max-w-[420px] p-24 mx-auto">
          <h1 className="text-h3 mb-12">Withdraw</h1>
          <WithdrawsContainer ethereumConfig={ethereumConfig} />
        </div>
      )}
    </Web3Container>
  );
};

export default Withdraw;
