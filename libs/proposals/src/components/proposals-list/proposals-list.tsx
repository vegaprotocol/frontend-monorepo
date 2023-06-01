import { useRef } from 'react';
import { AgGridLazy as AgGrid } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import * as Types from '@vegaprotocol/types';
import type { AgGridReact } from 'ag-grid-react';
import { useColumnDefs } from './use-column-defs';
import type { ProposalListFieldsFragment } from '../../lib/proposals-data-provider/__generated__/Proposals';
import { useProposalsListQuery } from '../../lib/proposals-data-provider/__generated__/Proposals';
import { removePaginationWrapper } from '@vegaprotocol/utils';

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
  const { data, error } = useProposalsListQuery({
    variables: {
      proposalType: Types.ProposalType.TYPE_NEW_MARKET,
    },
    errorPolicy: 'all', // currently there are some proposals failing due to proposals existing without settlement asset ids
  });
  const filteredData = getNewMarketProposals(
    removePaginationWrapper(data?.proposalsConnection?.edges)
  );
  const { columnDefs, defaultColDef } = useColumnDefs();

  return (
    <div className="relative h-full">
      <AgGrid
        ref={gridRef}
        className="w-full h-full"
        columnDefs={columnDefs}
        rowData={filteredData}
        defaultColDef={defaultColDef}
        storeKey="proposedMarkets"
        getRowId={({ data }) => data.id}
        style={{ width: '100%', height: '100%' }}
        overlayNoRowsTemplate={error ? error.message : t('No markets')}
      />
    </div>
  );
};
