import React from 'react';
import { AgGridLazy as AgGrid } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import * as Types from '@vegaprotocol/types';
import { MarketNameProposalCell, useColumnDefs } from './use-column-defs';
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

interface ProposalListProps {
  SuccessorMarketRenderer: React.FC<{ value: string }>;
}

export const ProposalsList = ({
  SuccessorMarketRenderer,
}: ProposalListProps) => {
  const { data } = useProposalsListQuery({
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
    <AgGrid
      columnDefs={columnDefs}
      rowData={filteredData}
      defaultColDef={defaultColDef}
      getRowId={({ data }) => data.id}
      overlayNoRowsTemplate={t('No markets')}
      components={{ SuccessorMarketRenderer, MarketNameProposalCell }}
    />
  );
};
