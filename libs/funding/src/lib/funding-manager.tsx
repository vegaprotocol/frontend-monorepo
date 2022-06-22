import { useRef, useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';

import type { AgGridReact } from 'ag-grid-react';
import { FundingTable } from './funding-table';
import { FUNDING_QUERY } from './funding-query';
import type {
  Funding,
  Funding_party_deposits,
  Funding_party_withdrawals,
} from './__generated__/Funding';

export type FundingData = Funding_party_deposits | Funding_party_withdrawals;

interface FundingManagerProps {
  partyId: string;
}

const compileFunding = (data?: Funding): FundingData[] => {
  const deposits = data?.party?.deposits ?? [];
  const withdrawals = data?.party?.withdrawals ?? [];

  return [...deposits, ...withdrawals].sort(
    (a, b) =>
      new Date(b.createdTimestamp).getTime() -
      new Date(a.createdTimestamp).getTime()
  );
};

export const FundingManager = ({ partyId }: FundingManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const variables = useMemo(() => ({ partyId }), [partyId]);

  const { data, error, loading } = useQuery<Funding>(FUNDING_QUERY, {
    variables,
  });

  const funding = compileFunding(data);

  return (
    <AsyncRenderer loading={loading} error={error} data={funding}>
      <FundingTable ref={gridRef} data={funding} />
    </AsyncRenderer>
  );
};
