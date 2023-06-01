import compact from 'lodash/compact';
import type { AgGridReact } from 'ag-grid-react';
import { useRef } from 'react';
import { t } from '@vegaprotocol/i18n';
import { FillsTable } from './fills-table';
import { useFillsList } from './use-fills-list';
import {
  DataGridNoRowsOverlay,
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

  const fills = compact(data).map((e) => e.node);

  return (
    <div className="h-full relative">
      <FillsTable
        ref={gridRef}
        rowData={fills}
        partyId={partyId}
        onMarketClick={onMarketClick}
        storeKey={storeKey}
        {...bottomPlaceholderProps}
        noRowsOverlayComponent={() => (
          <DataGridNoRowsOverlay
            error={error}
            message={t('No fills')}
            reload={reload}
          />
        )}
      />
    </div>
  );
};
