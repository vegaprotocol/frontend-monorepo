import { Button, Splash } from '@vegaprotocol/ui-toolkit';
import {
  withdrawalProvider,
  WithdrawalsTable,
  useIncompleteWithdrawals,
} from '@vegaprotocol/withdraws';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { ViewType, useSidebar } from '../../components/sidebar';

export const WithdrawalsContainer = () => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data, error } = useDataProvider({
    dataProvider: withdrawalProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const setView = useSidebar((store) => store.setView);
  const { ready, delayed } = useIncompleteWithdrawals();
  if (!pubKey) {
    return <Splash>{t('Please connect Vega wallet')}</Splash>;
  }
  return (
    <>
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
        <div className="h-auto flex justify-end p-2 bottom-0 right-0 absolute dark:bg-black/75 bg-white/75 rounded">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setView({ type: ViewType.Withdraw })}
            data-testid="withdraw-dialog-button"
          >
            {t('Make withdrawal')}
          </Button>
        </div>
      )}
    </>
  );
};
