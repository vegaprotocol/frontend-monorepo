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
        <div className="h-full relative grid grid-rows-[1fr,min-content]">
          <div className="h-full">
            <AsyncRenderer
              data={{ pending, completed }}
              loading={loading}
              error={error}
              render={({ pending, completed }) => (
                <>
                  {pending && pending.length > 0 && (
                    <>
                      <h4 className="pt-3 pb-1">{t('Pending withdrawals')}</h4>
                      <PendingWithdrawalsTable rowData={pending} />
                    </>
                  )}
                  <WithdrawalsTable rowData={completed} />
                </>
              )}
            />
          </div>
          <div className="w-full dark:bg-black bg-white absolute bottom-0 h-auto flex justify-end px-[11px] py-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setWithdrawDialog(true)}
              data-testid="withdraw-dialog-button"
            >
              {t('Make withdrawal')}
            </Button>
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
