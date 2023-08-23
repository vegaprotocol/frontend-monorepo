import { LedgerExportForm } from './ledger-export-form';

export const LedgerManager = ({ partyId }: { partyId: string }) => {
  return (
    <div className="h-full relative">
      <LedgerExportForm partyId={partyId} />
    </div>
  );
};
