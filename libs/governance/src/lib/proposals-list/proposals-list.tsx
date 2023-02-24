import {
  AgGridDynamic as AgGrid,
  AsyncRenderer,
} from '@vegaprotocol/ui-toolkit';
import { useDataProvider } from '@vegaprotocol/utils';
import * as Types from '@vegaprotocol/types';
import { proposalsDataProvider } from '../proposals-data-provider';
import { useCallback, useMemo, useRef } from 'react';
import type { AgGridReact } from 'ag-grid-react';
import { useColumnDefs } from './use-column-defs';
import type { ProposalListFieldsFragment } from '../proposals-data-provider/__generated__/Proposals';

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
  const handleOnGridReady = useCallback(() => {
    gridRef.current?.api?.sizeColumnsToFit();
  }, [gridRef]);
  const variables = useMemo(() => {
    return {
      proposalType: Types.ProposalType.TYPE_NEW_MARKET,
    };
  }, []);
  const { data, loading, error, reload } = useDataProvider({
    dataProvider: proposalsDataProvider,
    variables,
  });
  const filteredData = getNewMarketProposals(data || []);
  const { columnDefs, defaultColDef } = useColumnDefs();
  return (
    <AsyncRenderer
      loading={loading}
      error={error}
      data={filteredData}
      reload={reload}
    >
      <AgGrid
        ref={gridRef}
        domLayout="autoHeight"
        className="min-w-full"
        columnDefs={columnDefs}
        rowData={filteredData}
        defaultColDef={defaultColDef}
        onGridReady={handleOnGridReady}
      />
    </AsyncRenderer>
  );
};
