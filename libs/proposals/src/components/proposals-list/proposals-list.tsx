import type { FC } from 'react';
import { AgGrid } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import * as Types from '@vegaprotocol/types';
import { removePaginationWrapper } from '@vegaprotocol/utils';
import type { ProposalListFieldsFragment } from '../../lib/proposals-data-provider/__generated__/Proposals';
import { useProposalsListQuery } from '../../lib/proposals-data-provider/__generated__/Proposals';
import { useColumnDefs } from './use-column-defs';

export const getNewMarketProposals = (data: ProposalListFieldsFragment[]) =>
  data.filter((proposal) =>
    [
      Types.ProposalState.STATE_OPEN,
      Types.ProposalState.STATE_PASSED,
      Types.ProposalState.STATE_WAITING_FOR_NODE_VOTE,
    ].includes(proposal.state)
  );

const defaultColDef = {
  sortable: true,
  filter: true,
  filterParams: { buttons: ['reset'] },
};

interface ProposalListProps {
  cellRenderers: {
    [name: string]: FC<{ value: string; data: ProposalListFieldsFragment }>;
  };
}

export const ProposalsList = ({ cellRenderers }: ProposalListProps) => {
  const { data } = useProposalsListQuery({
    variables: {
      proposalType: Types.ProposalType.TYPE_NEW_MARKET,
    },
    errorPolicy: 'all', // currently there are some proposals failing due to proposals existing without settlement asset ids
  });
  const filteredData = getNewMarketProposals(
    removePaginationWrapper(data?.proposalsConnection?.edges)
  );
  const columnDefs = useColumnDefs();

  return (
    <AgGrid
      columnDefs={columnDefs}
      rowData={filteredData}
      defaultColDef={defaultColDef}
      getRowId={({ data }) => data.id}
      overlayNoRowsTemplate={t('No proposed markets')}
      components={cellRenderers}
      rowHeight={45}
    />
  );
};
