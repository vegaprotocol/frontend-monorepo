import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useLedgerEntriesDataProvider } from './ledger-entries-data-provider';
import { LedgerTable } from './ledger-table';

// '3ac37999796c2be3546e0c1d87daa8ec7e99d8c423969be44c2f63256c415004'
type LedgerManagerProps = { partyId: string };
export const LedgerManager = ({ partyId }: LedgerManagerProps) => {
  console.log('partyId', partyId);
  const { data, error, loading } = useLedgerEntriesDataProvider(partyId);

  return (
    <AsyncRenderer data={data} error={error} loading={loading}>
      <LedgerTable rowData={data} />
    </AsyncRenderer>
  );
};
