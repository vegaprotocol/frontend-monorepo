import { Button } from '@vegaprotocol/ui-toolkit';
import {
  withdrawalProvider,
  WithdrawalsTable,
  useIncompleteWithdrawals,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { VegaWalletContainer } from '../../components/vega-wallet-container';
import { useSidebar } from '../../components/sidebar';

export const WithdrawalsContainer = () => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data, error } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const { setView } = useSidebar();
  const { ready, delayed } = useIncompleteWithdrawals();

  return (
    <VegaWalletContainer>
      <div className="h-full relative">
        <WithdrawalsTable
          data-testid="withdrawals-history"
          rowData={data}
          overlayNoRowsTemplate={error ? error.message : t('No withdrawals')}
          ready={ready}
          delayed={delayed}
        />
      </div>
      {!isReadOnly && (
        <div className="h-auto flex justify-end px-[11px] py-2 bottom-0 right-3 absolute dark:bg-black/75 bg-white/75 rounded">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setView('withdraw')}
            data-testid="withdraw-dialog-button"
          >
            {t('Make withdrawal')}
          </Button>
        </div>
      )}
    </VegaWalletContainer>
  );
};
