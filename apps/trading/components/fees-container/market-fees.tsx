import compact from 'lodash/compact';
import {
  getProductType,
  type MarketMaybeWithDataAndCandles,
} from '@vegaprotocol/markets';
import { AgGrid, MarketProductPill, StackedCell } from '@vegaprotocol/datagrid';
import { formatPercentage, getAdjustedFee } from './utils';
import BigNumber from 'bignumber.js';
import { useNavigateWithMeta } from '../../lib/hooks/use-market-click-handler';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';
import { useMemo } from 'react';
import { type ColDef } from 'ag-grid-community';
import { Emblem } from '@vegaprotocol/emblem';
import type { ProductType } from '@vegaprotocol/types';

const useFeesTableColumnDefs = (): ColDef[] => {
  const t = useT();
  return useMemo(
    () =>
      [
        {
          field: 'code',
          cellRenderer: ({
            value,
            data,
          }: {
            value: string | undefined; // market code
            data: {
              id: string;
              productType: ProductType | undefined;
              parentMarketID: string | null | undefined;
              successorMarketID?: string | null | undefined;
              name: string;
            };
          }) => {
            const productType = data?.productType;
            return (
              <span className="flex items-center gap-2 cursor-pointer">
                <Emblem market={data.id} />
                <StackedCell
                  primary={
                    <span className="flex gap-1 items-center">
                      {value}
                      <MarketProductPill productType={productType} />
                    </span>
                  }
                  secondary={data.name}
                />
              </span>
            );
          },
          pinned: 'left',
          minWidth: 300,
        },
        {
          field: 'feeAfterDiscount',
          headerName: t('Taker fee after discount'),
          cellClass: 'font-bold',
          valueFormatter: ({ value }: { value: number }) => value + '%',
        },
        {
          field: 'totalFee',
          headerName: t('Taker fee before discount'),
          valueFormatter: ({ value }: { value: number }) => value + '%',
        },
        {
          field: 'liquidityFee',
          cellClass: 'text-surface-1-fg',
          valueFormatter: ({ value }: { value: number }) => value + '%',
        },
        {
          field: 'infraFee',
          cellClass: 'text-surface-1-fg',
          valueFormatter: ({ value }: { value: number }) => value + '%',
        },
        {
          field: 'makerFee',
          cellClass: 'text-surface-1-fg',
          valueFormatter: ({ value }: { value: number }) => value + '%',
        },
      ] as ColDef[],
    [t]
  );
};

const feesTableDefaultColDef = {
  flex: 1,
  minWidth: 62,
  resizable: true,
  sortable: true,
  suppressMovable: true,
  pinned: false,
};

export const MarketFees = ({
  markets,
  referralDiscount,
  volumeDiscount,
}: {
  markets: MarketMaybeWithDataAndCandles[] | null;
  referralDiscount: number;
  volumeDiscount: number;
}) => {
  const navigateWithMeta = useNavigateWithMeta();
  const colDef = useFeesTableColumnDefs();

  const rows = compact(markets || []).map(
    (m: MarketMaybeWithDataAndCandles) => {
      const infraFee = new BigNumber(m.fees.factors.infrastructureFee);
      const makerFee = new BigNumber(m.fees.factors.makerFee);
      const liquidityFee = new BigNumber(m.fees.factors.liquidityFee);
      const totalFee = infraFee.plus(makerFee).plus(liquidityFee);

      const feeAfterDiscount = getAdjustedFee(
        [infraFee, makerFee, liquidityFee],
        [new BigNumber(referralDiscount), new BigNumber(volumeDiscount)]
      );

      return {
        id: m.id,
        code: m.tradableInstrument.instrument.code,
        name: m.tradableInstrument.instrument.name,
        productType: getProductType(m),
        infraFee: formatPercentage(infraFee.toNumber()),
        makerFee: formatPercentage(makerFee.toNumber()),
        liquidityFee: formatPercentage(liquidityFee.toNumber()),
        totalFee: formatPercentage(totalFee.toNumber()),
        feeAfterDiscount: formatPercentage(feeAfterDiscount),
        parentMarketID: m.parentMarketID,
        successorMarketID: m.successorMarketID,
      };
    }
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-surface-1/70">
      <AgGrid
        columnDefs={colDef}
        rowData={rows}
        getRowId={({ data }) => data.id}
        defaultColDef={feesTableDefaultColDef}
        domLayout="autoHeight"
        rowHeight={55}
        rowClass="cursor-pointer"
        autoSizeStrategy={{
          type: 'fitGridWidth',
        }}
        onRowClicked={({ data, event }) => {
          navigateWithMeta(
            Links.MARKET(data.id),
            // @ts-ignore metaKey and ctrlKey exist
            event.metaKey || event.ctrlKey
          );
        }}
      />
    </div>
  );
};
