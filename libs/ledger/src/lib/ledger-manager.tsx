import { AsyncRenderer } from '@vegaprotocol/ui-toolkit';
import { useLedgerEntriesDataProvider } from './ledger-entries-data-provider';
import { LedgerTable } from './ledger-table';

type LedgerManagerProps = { partyId: string };
export const LedgerManager = ({ partyId }: LedgerManagerProps) => {
  const { data, error, loading } = useLedgerEntriesDataProvider(partyId);

  return (
    <AsyncRenderer data={data} error={error} loading={loading}>
      <LedgerTable rowData={data} />
    </AsyncRenderer>
  );
};
