import { AsyncRenderer, Button } from '@vegaprotocol/ui-toolkit';
import {
  useWithdrawals,
  useWithdrawalDialog,
  WithdrawalsTable,
} from '@vegaprotocol/withdraws';
import { t } from '@vegaprotocol/react-helpers';
import { VegaWalletContainer } from '../../components/vega-wallet-container';

export const WithdrawalsContainer = () => {
  const { data, loading, error } = useWithdrawals();
  const openWithdrawDialog = useWithdrawalDialog((state) => state.open);

  return (
    <VegaWalletContainer>
      <div className="h-full relative grid grid-rows-[1fr,min-content]">
        <div className="h-full relative">
          <WithdrawalsTable
            data-testid="withdrawals-history"
            rowData={data}
            noRowsOverlayComponent={() => null}
          />
          <div className="pointer-events-none absolute inset-0">
            <AsyncRenderer
              data={data}
              loading={loading}
              error={error}
              noDataCondition={(data) => !(data && data.length)}
              noDataMessage={t('No withdrawals')}
            />
          </div>
        </div>
        <div className="w-full dark:bg-black bg-white absolute bottom-0 h-auto flex justify-end px-[11px] py-2">
          <Button
            size="sm"
            onClick={() => openWithdrawDialog()}
            data-testid="withdraw-dialog-button"
          >
            {t('Make withdrawal')}
          </Button>
        </div>
      </div>
    </VegaWalletContainer>
  );
};
