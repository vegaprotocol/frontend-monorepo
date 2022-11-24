import React, { useMemo } from 'react';
import { addDecimalsFormatNumber, t } from '@vegaprotocol/react-helpers';
import type { AccountFields } from '@vegaprotocol/accounts';
import { useAssetDetailsDialogStore } from '@vegaprotocol/assets';
import type { ColDef, GroupCellRendererParams } from 'ag-grid-community';
import type { VegaValueFormatterParams } from '@vegaprotocol/ui-toolkit';

const useAccountColumnDefinitions = () => {
  const { open } = useAssetDetailsDialogStore();
  const columnDefs: ColDef[] = useMemo(() => {
    return [
      {
        colId: 'account-asset',
        headerName: t('Asset'),
        field: 'asset.symbol',
        headerClass: 'uppercase justify-start',
        cellClass: 'uppercase flex h-full items-center md:pl-4',
        cellRenderer: ({ value, data }: GroupCellRendererParams) =>
          value && value.length > 0 ? (
            <div className="md:pl-4 grid h-full items-center" title={value}>
              <div className="truncate min-w-0">
                <button
                  className="hover:underline"
                  onClick={() => {
                    open(data.asset.id);
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
        colId: 'deposited',
        headerName: t('Deposited'),
        field: 'deposited',
        cellRenderer: 'PriceCell',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<AccountFields, 'deposited'>) => {
          if (value && data) {
            return addDecimalsFormatNumber(value, data.asset.decimals);
          }
          return '-';
        },
      },
      {
        colId: 'used',
        headerName: t('Used'),
        field: 'used',
        cellRenderer: 'PriceCell',
        valueFormatter: ({
          value,
          data,
        }: VegaValueFormatterParams<AccountFields, 'used'>) => {
          if (value && data) {
            return addDecimalsFormatNumber(value, data.asset.decimals);
          }
          return '-';
        },
      },
    ];
  }, [open]);

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
