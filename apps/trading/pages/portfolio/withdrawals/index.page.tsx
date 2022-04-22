import { t } from '@vegaprotocol/react-helpers';
import { AnchorButton, AsyncRenderer, Splash } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useWithdrawals, WithdrawalsTable } from '@vegaprotocol/withdraws';
import orderBy from 'lodash/orderBy';
import { Web3Container } from '../../../components/web3-container';

const Withdrawals = () => {
  const { keypair } = useVegaWallet();
  const { data, loading, error } = useWithdrawals();

  if (!keypair) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }

  return (
    <Web3Container>
      {() => (
        <AsyncRenderer data={data} loading={loading} error={error}>
          {(data) => {
            const withdrawals = orderBy(
              data.party?.withdrawals || [],
              (w) => new Date(w.createdTimestamp).getTime(),
              'desc'
            );
            return (
              <div className="h-full grid grid grid-rows-[min-content,1fr]">
                <header className="flex justify-between p-24">
                  <h1 className="text-h3">{t('Withdrawals')}</h1>
                  <AnchorButton href="/portfolio/withdraw">
                    {t('Start withdrawal')}
                  </AnchorButton>
                </header>
                <WithdrawalsTable withdrawals={withdrawals} />
              </div>
            );
          }}
        </AsyncRenderer>
      )}
    </Web3Container>
  );
};

export default Withdrawals;
