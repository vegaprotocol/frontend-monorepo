import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import {
  PendingWithdrawalsTable,
  useWithdrawals,
  WithdrawalDialogs,
  WithdrawalsTable,
} from '@vegaprotocol/withdraws';
import { t } from '@vegaprotocol/react-helpers';
import { useState } from 'react';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { Web3Container } from '@vegaprotocol/web3';

export const WithdrawalsContainer = () => {
  const { pending, completed, loading, error } = useWithdrawals();
  const [withdrawDialog, setWithdrawDialog] = useState(false);

  return (
    <Web3Container>
      <VegaWalletContainer>
        <div className="h-full grid grid-rows-[min-content_1fr]">
          <header className="flex justify-between items-center p-4">
            <h4 className="text-lg text-black dark:text-white">
              {t('Withdrawals')}
            </h4>
            <Button
              onClick={() => setWithdrawDialog(true)}
              data-testid="withdraw-dialog-button"
            >
              {t('Make withdrawal')}
            </Button>
          </header>
          <div className="h-full px-4">
            <AsyncRenderer
              data={{ pending, completed }}
              loading={loading}
              error={error}
              render={({ pending, completed }) => (
                <>
                  {pending && pending.length > 0 && (
                    <>
                      <h4 className="pt-3 pb-1">{t('Pending withdrawals')}</h4>
                      <PendingWithdrawalsTable withdrawals={pending} />
                    </>
                  )}

                  <h4 className="pt-3 pb-1">{t('Withdrawal history')}</h4>
                  <WithdrawalsTable withdrawals={completed} />
                </>
              )}
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
