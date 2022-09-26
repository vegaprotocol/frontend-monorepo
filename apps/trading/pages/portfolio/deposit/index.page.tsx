import { t, titlefy } from '@vegaprotocol/react-helpers';
import { Web3Container } from '@vegaprotocol/web3';
import { useEffect } from 'react';
import { useGlobalStore } from '../../../stores';
import { DepositContainer } from './deposit-container';

const Deposit = () => {
  const { update } = useGlobalStore((store) => ({
    update: store.update,
  }));
  useEffect(() => {
    update({ pageTitle: titlefy([t('Deposits')]) });
  }, [update]);

  return (
    <Web3Container>
      <div className="max-w-[420px] p-8 mx-auto">
        <h1 className="text-2xl mb-4">{t('Deposit')}</h1>
        <DepositContainer />
      </div>
    </Web3Container>
  );
};

Deposit.getInitialProps = () => ({
  page: 'deposit',
});

export default Deposit;
