import { useCallback, useEffect, useRef, useState } from 'react';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { AgGridDynamic as AgGrid } from '@vegaprotocol/datagrid';
import { useDataProvider } from '@vegaprotocol/react-helpers';
import { t } from '@vegaprotocol/i18n';
import * as Types from '@vegaprotocol/types';
import { proposalsDataProvider } from '../proposals-data-provider';
import type { AgGridReact } from 'ag-grid-react';
import { useColumnDefs } from './use-column-defs';
import type { ProposalListFieldsFragment } from '../proposals-data-provider/__generated__/Proposals';

// prevent cutting filter windows by auto-height layout
const CUSTOM_GRID_STYLES = `
  .ag-layout-auto-height {
    min-height: 200px !important;
  }
`;

export const getNewMarketProposals = (data: ProposalListFieldsFragment[]) =>
  data.filter((proposal) =>
    [
      Types.ProposalState.STATE_OPEN,
      Types.ProposalState.STATE_PASSED,
      Types.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
    ].includes(proposal.state)
  );

export const ProposalsList = () => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [dataCount, setDataCount] = useState(0);
  const handleOnGridReady = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [gridRef]);
  const { data, loading, error, reload } = useDataProvider({
    dataProvider: proposalsDataProvider,
    variables: {
      proposalType: Types.ProposalType.TYPE_NEW_MARKET,
    },
  });
  const filteredData = getNewMarketProposals(data || []);
  const { columnDefs, defaultColDef } = useColumnDefs();
  useEffect(() => {
    setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
  }, [filteredData]);
  const onFilterChanged = useCallback(() => {
    setDataCount(gridRef.current?.api?.getModel().getRowCount() ?? 0);
  }, []);
  return (
    <div className="relative">
      <AgGrid
        ref={gridRef}
        className="w-full h-full"
        domLayout="autoHeight"
        columnDefs={columnDefs}
        rowData={filteredData}
        defaultColDef={defaultColDef}
        onGridReady={handleOnGridReady}
        suppressLoadingOverlay
        suppressNoRowsOverlay
        onFilterChanged={onFilterChanged}
        customThemeParams={CUSTOM_GRID_STYLES}
      />
      <div className="pointer-events-none absolute inset-0">
        <AsyncRenderer
          loading={loading}
          error={error}
          data={filteredData}
          noDataMessage={t('No markets')}
          noDataCondition={() => !dataCount}
          reload={reload}
        />
      </div>
    </div>
  );
};
