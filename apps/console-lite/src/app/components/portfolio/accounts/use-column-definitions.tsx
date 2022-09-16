import React, { useMemo } from 'react';
import {
  addDecimalsFormatNumber,
  t,
  PriceCell,
} from '@vegaprotocol/react-helpers';
import type { SummaryRow } from '@vegaprotocol/react-helpers';
import type { AccountFieldsFragment } from '@vegaprotocol/accounts';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type {
  ColDef,
  GroupCellRendererParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import type { AccountType } from '@vegaprotocol/types';
import { AccountTypeMapping } from '@vegaprotocol/types';

interface AccountsTableValueFormatterParams extends ValueFormatterParams {
  data: AccountFieldsFragment;
}

const comparator = (
  valueA: string,
  valueB: string,
  nodeA: { data: AccountFieldsFragment & SummaryRow },
  nodeB: { data: AccountFieldsFragment & SummaryRow },
  isInverted: boolean
) => {
  if (valueA < valueB) {
    return -1;
  }

  if (valueA > valueB) {
    return 1;
  }

  if (nodeA.data.__summaryRow) {
    return isInverted ? -1 : 1;
  }

  if (nodeB.data.__summaryRow) {
    return isInverted ? 1 : -1;
  }

  return 0;
};

const useAccountColumnDefinitions = () => {
  const { setAssetDetailsDialogOpen, setAssetDetailsDialogSymbol } =
    useAssetDetailsDialogStore();
  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        colId: 'account-asset',
        headerName: t('Asset'),
        field: 'asset.symbol',
        comparator,
        headerClass: 'uppercase justify-start',
        cellClass: 'uppercase flex h-full items-center md:pl-4',
        cellRenderer: ({ value }: GroupCellRendererParams) =>
          value && value.length > 0 ? (
            <div className="md:pl-4 grid h-full items-center" title={value}>
              <div className="truncate min-w-0">
                <button
                  className="hover:underline"
                  onClick={() => {
                    setAssetDetailsDialogOpen(true);
                    setAssetDetailsDialogSymbol(value);
                  }}
                >
                  {value}
                </button>
              </div>
            </div>
          ) : (
            ''
          ),
      },
      {
        colId: 'type',
        headerName: t('Type'),
        field: 'type',
        cellClass: 'uppercase !flex h-full items-center',
        valueFormatter: ({ value }: ValueFormatterParams) =>
          value ? AccountTypeMapping[value as AccountType] : '-',
      },
      {
        colId: 'market',
        headerName: t('Market'),
        cellClass: 'uppercase !flex h-full items-center',
        field: 'market.tradableInstrument.instrument.name',
        valueFormatter: "value || '—'",
      },
      {
        colId: 'balance',
        headerName: t('Balance'),
        field: 'balance',
        cellClass: 'uppercase !flex h-full items-center',
        cellRenderer: 'PriceCell',
        valueFormatter: ({ value, data }: AccountsTableValueFormatterParams) =>
          addDecimalsFormatNumber(value, data.asset.decimals),
      },
    ];
  }, [setAssetDetailsDialogOpen, setAssetDetailsDialogSymbol]);

  const defaultColDef = useMemo(() => {
    return {
      sortable: true,
      unSortIcon: true,
      headerClass: 'uppercase',
      editable: false,
    };
  }, []);
  return { columnDefs, defaultColDef };
};

export default useAccountColumnDefinitions;
