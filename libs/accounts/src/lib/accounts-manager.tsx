import { useRef, memo, useState } from 'react';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';
import { t } from '@vegaprotocol/i18n';
import { useDataProvider } from '@vegaprotocol/data-provider';
import type { AgGridReact } from 'ag-grid-react';
import {
  aggregatedAccountsDataProvider,
  aggregatedAccountDataProvider,
} from './accounts-data-provider';
import type { PinnedAsset } from './accounts-table';
import { AccountTable } from './accounts-table';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import BreakdownTable from './breakdown-table';

const AccountBreakdown = ({
  assetId,
  partyId,
}: {
  assetId: string;
  partyId: string;
}) => {
  const { data } = useDataProvider({
    dataProvider: aggregatedAccountDataProvider,
    variables: { partyId, assetId },
  });
  return (
    <div
      className="h-[35vh] w-full m-auto flex flex-col"
      data-testid="usage-breakdown"
    >
      <h1 className="text-xl mb-4">
        {data?.asset?.symbol} {t('usage breakdown')}
      </h1>
      {data && (
        <p className="mb-2 text-sm">
          {t('You have %s %s in total.', [
            addDecimalsFormatNumber(data.total, data.asset.decimals),
            data.asset.symbol,
          ])}
        </p>
      )}
      <BreakdownTable data={data?.breakdown || null} domLayout="autoHeight" />
    </div>
  );
};

interface AccountManagerProps {
  partyId: string;
  onClickAsset: (assetId: string) => void;
  onClickWithdraw?: (assetId?: string) => void;
  onClickDeposit?: (assetId?: string) => void;
  isReadOnly: boolean;
  pinnedAsset?: PinnedAsset;
  storeKey?: string;
}

export const AccountManager = ({
  onClickAsset,
  onClickWithdraw,
  onClickDeposit,
  partyId,
  isReadOnly,
  pinnedAsset,
  storeKey,
}: AccountManagerProps) => {
  const gridRef = useRef<AgGridReact | null>(null);
  const [breakdownAssetId, setBreakdownAssetId] = useState<string>();

  const { data, error } = useDataProvider({
    dataProvider: aggregatedAccountsDataProvider,
    variables: { partyId },
  });

  return (
    <div className="relative h-full">
      <AccountTable
        ref={gridRef}
        rowData={data}
        onClickAsset={onClickAsset}
        onClickDeposit={onClickDeposit}
        onClickWithdraw={onClickWithdraw}
        onClickBreakdown={setBreakdownAssetId}
        isReadOnly={isReadOnly}
        pinnedAsset={pinnedAsset}
        storeKey={storeKey}
        overlayNoRowsTemplate={error ? error.message : t('No accounts')}
      />
      <Dialog
        size="medium"
        open={Boolean(breakdownAssetId)}
        onChange={(isOpen) => {
          if (!isOpen) {
            setBreakdownAssetId(undefined);
          }
        }}
      >
        {breakdownAssetId && (
          <AccountBreakdown assetId={breakdownAssetId} partyId={partyId} />
        )}
      </Dialog>
    </div>
  );
};

export default memo(AccountManager);
