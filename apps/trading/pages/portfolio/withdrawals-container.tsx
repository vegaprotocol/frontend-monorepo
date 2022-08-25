import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import {
  useWithdrawals,
  WithdrawalDialogs,
  WithdrawalsTable,
} from '@vegaprotocol/withdraws';
import { t } from '@vegaprotocol/react-helpers';
import { useState } from 'react';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { Web3Container } from '@vegaprotocol/web3';

export const WithdrawalsContainer = () => {
  const { withdrawals, loading, error } = useWithdrawals();
  const [withdrawDialog, setWithdrawDialog] = useState(false);

  return (
    <Web3Container>
      <VegaWalletContainer>
        <div className="h-full grid gap-4 grid-rows-[min-content_1fr]">
          <header className="flex justify-between items-center p-4">
            <h4 className="text-lg text-black dark:text-white">
              {t('Withdrawals')}
            </h4>
            <Button onClick={() => setWithdrawDialog(true)}>
              {t('Withdraw')}
            </Button>
          </header>
          <div>
            <AsyncRenderer
              data={withdrawals}
              loading={loading}
              error={error}
              render={(data) => {
                return <WithdrawalsTable withdrawals={data} />;
              }}
            />
          </div>
        </div>
        <WithdrawalDialogs
          withdrawDialog={withdrawDialog}
          setWithdrawDialog={setWithdrawDialog}
        />
      </VegaWalletContainer>
    </Web3Container>
  );
};
