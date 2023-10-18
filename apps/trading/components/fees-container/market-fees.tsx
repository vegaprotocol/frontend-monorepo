import compact from 'lodash/compact';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { AgGrid } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { formatPercentage } from './utils';
import { MarketCodeCell } from '../../client-pages/markets/market-code-cell';

const feesTableColumnDefs = [
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
];

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
  const rows = compact(markets || []).map((m) => {
    const infraFee = Number(m.fees.factors.infrastructureFee);
    const makerFee = Number(m.fees.factors.makerFee);
    const liquidityFee = Number(m.fees.factors.liquidityFee);
    const totalFee = infraFee + makerFee + liquidityFee;
    const totalDiscount = referralDiscount + volumeDiscount;
    const feeAfterDiscount = totalFee * Math.max(0, 1 - totalDiscount);

    return {
      code: m.tradableInstrument.instrument.code,
      productType: m.tradableInstrument.instrument.product.__typename,
      infraFee: formatPercentage(infraFee),
      makerFee: formatPercentage(makerFee),
      liquidityFee: formatPercentage(liquidityFee),
      totalFee: formatPercentage(totalFee),
      feeAfterDiscount: formatPercentage(feeAfterDiscount),
      parentMarketID: m.parentMarketID,
      successorMarketID: m.successorMarketID,
    };
  });

  return (
    <div className="border border-default">
      <AgGrid
        columnDefs={feesTableColumnDefs}
        rowData={rows}
        defaultColDef={feesTableDefaultColDef}
        domLayout="autoHeight"
        components={components}
        rowHeight={45}
      />
    </div>
  );
};
