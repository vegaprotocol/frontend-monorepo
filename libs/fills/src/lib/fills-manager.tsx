import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FillsTable } from './fills-table';
import { useFillsList } from './use-fills-list';
import {
  GridNowRowsOverlay,
  useBottomPlaceholder,
} from '@vegaprotocol/datagrid';

interface FillsManagerProps {
  partyId: string;
  marketId?: string;
  onMarketClick?: (marketId: string, metaKey?: boolean) => void;
  storeKey?: string;
}

export const FillsManager = ({
  partyId,
  marketId,
  onMarketClick,
  storeKey,
}: FillsManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const scrolledToTop = useRef(true);
  const { data, error, reload } = useFillsList({
    partyId,
    marketId,
    gridRef,
    scrolledToTop,
  });

  const bottomPlaceholderProps = useBottomPlaceholder({
    gridRef,
  });

  return (
    <div className="h-full relative">
      <FillsTable
        ref={gridRef}
        rowData={data}
        partyId={partyId}
        onMarketClick={onMarketClick}
        storeKey={storeKey}
        {...bottomPlaceholderProps}
        noRowsOverlayComponent={() => (
          <GridNowRowsOverlay
            error={error}
            message={t('No fills')}
            reload={reload}
          />
        )}
      />
    </div>
  );
};
