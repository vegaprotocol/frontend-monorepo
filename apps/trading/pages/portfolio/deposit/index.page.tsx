import { Web3Container } from '../../../components/web3-container';
import { DepositContainer } from './deposit-container';

const Deposit = () => {
  return (
    <Web3Container>
      <div className="max-w-[420px] p-24 mx-auto">
        <h1 className="text-h3 mb-12">Deposit</h1>
        <DepositContainer />
      </div>
    </Web3Container>
  );
};

Deposit.getInitialProps = () => ({
  page: 'deposit',
});

export default Deposit;
