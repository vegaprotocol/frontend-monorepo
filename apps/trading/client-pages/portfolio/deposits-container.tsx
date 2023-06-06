import { Button } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog, DepositsTable } from '@vegaprotocol/deposits';
import { depositsProvider } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';
import { useBottomPlaceholder } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';

export const DepositsContainer = () => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data, error } = useDataProvider({
    dataProvider: depositsProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const openDepositDialog = useDepositDialog((state) => state.open);
  const bottomPlaceholderProps = useBottomPlaceholder({ gridRef });
  return (
    <div className="h-full">
      <div className="h-full relative">
        <DepositsTable
          rowData={data || []}
          ref={gridRef}
          {...bottomPlaceholderProps}
          overlayNoRowsTemplate={error ? error.message : t('No deposits')}
        />
      </div>
      {!isReadOnly && (
        <div className="h-auto flex justify-end px-[11px] py-2 bottom-0 right-3 absolute dark:bg-black/75 bg-white/75 rounded">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openDepositDialog()}
            data-testid="deposit-button"
          >
            {t('Deposit')}
          </Button>
        </div>
      )}
    </div>
  );
};
