import { Button } from '@vegaprotocol/ui-toolkit';
import { DepositsTable } from '@vegaprotocol/deposits';
import { depositsProvider } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import { useVegaWallet } from '@vegaprotocol/wallet';
import { useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { useSidebar } from '../../components/sidebar';

export const DepositsContainer = () => {
  const gridRef = useRef<AgGridReact | null>(null);
  const { pubKey, isReadOnly } = useVegaWallet();
  const { data, error } = useDataProvider({
    dataProvider: depositsProvider,
    variables: { partyId: pubKey || '' },
    skip: !pubKey,
  });
  const { setView } = useSidebar();
  return (
    <div className="h-full">
      <DepositsTable
        rowData={data}
        ref={gridRef}
        overlayNoRowsTemplate={error ? error.message : t('No deposits')}
      />
      {!isReadOnly && (
        <div className="h-auto flex justify-end px-[11px] py-2 bottom-0 right-3 absolute dark:bg-black/75 bg-white/75 rounded">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setView('deposit')}
            data-testid="deposit-button"
          >
            {t('Deposit')}
          </Button>
        </div>
      )}
    </div>
  );
};
