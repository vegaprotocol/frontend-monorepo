import compact from 'lodash/compact';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { AgGrid } from '@vegaprotocol/datagrid';
import { formatPercentage, getAdjustedFee } from './utils';
import { MarketCodeCell } from '../../client-pages/markets/market-code-cell';
import BigNumber from 'bignumber.js';
import { useNavigateWithMeta } from '../../lib/hooks/use-market-click-handler';
import { Links } from '../../lib/links';
import { useT } from '../../lib/use-t';
import { useMemo } from 'react';

const useFeesTableColumnDefs = () => {
  const t = useT();
  return useMemo(
    () => [
      { field: 'code', cellRenderer: 'MarketCodeCell' },
      {
        field: 'feeAfterDiscount',
        headerName: t('Total fee after discount'),
        valueFormatter: ({ value }: { value: number }) => value + '%',
      },
      {
        field: 'infraFee',
        valueFormatter: ({ value }: { value: number }) => value + '%',
      },
      {
        field: 'makerFee',
        valueFormatter: ({ value }: { value: number }) => value + '%',
      },
      {
        field: 'liquidityFee',
        valueFormatter: ({ value }: { value: number }) => value + '%',
      },
      {
        field: 'totalFee',
        headerName: t('Total fee before discount'),
        valueFormatter: ({ value }: { value: number }) => value + '%',
      },
    ],
    [t]
  );
};

const feesTableDefaultColDef = {
  flex: 1,
  resizable: true,
  sortable: true,
};

const components = {
  MarketCodeCell,
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

  const rows = compact(markets || []).map((m) => {
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
      productType: m.tradableInstrument.instrument.product.__typename,
      infraFee: formatPercentage(infraFee.toNumber()),
      makerFee: formatPercentage(makerFee.toNumber()),
      liquidityFee: formatPercentage(liquidityFee.toNumber()),
      totalFee: formatPercentage(totalFee.toNumber()),
      feeAfterDiscount: formatPercentage(feeAfterDiscount),
      parentMarketID: m.parentMarketID,
      successorMarketID: m.successorMarketID,
    };
  });

  return (
    <div className="border rounded-sm border-default">
      <AgGrid
        columnDefs={useFeesTableColumnDefs()}
        rowData={rows}
        getRowId={({ data }) => data.id}
        defaultColDef={feesTableDefaultColDef}
        domLayout="autoHeight"
        components={components}
        rowHeight={45}
        rowClass="cursor-pointer"
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
