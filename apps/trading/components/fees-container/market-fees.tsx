import compact from 'lodash/compact';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { ProductTypeMapping } from '@vegaprotocol/types';
import { format } from './utils';
import { AgGrid } from '@vegaprotocol/datagrid';

const feesTableColumnDefs = [
  { field: 'code' },
  {
    field: 'product',
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
    valueFormatter: ({ value }: { value: number }) => value + '%',
  },
  {
    field: 'feeAfterDiscount',
    valueFormatter: ({ value }: { value: number }) => value + '%',
  },
];

const feesTableDefaultColDef = {
  flex: 1,
  resizable: true,
  sortable: true,
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
      product: m.tradableInstrument.instrument.product.__typename
        ? ProductTypeMapping[m.tradableInstrument.instrument.product.__typename]
        : '-',
      infraFee: format(infraFee),
      makerFee: format(makerFee),
      liquidityFee: format(liquidityFee),
      totalFee: format(totalFee),
      feeAfterDiscount: format(feeAfterDiscount),
    };
  });

  return (
    <div className="border border-default">
      <AgGrid
        columnDefs={feesTableColumnDefs}
        rowData={rows}
        defaultColDef={feesTableDefaultColDef}
        domLayout="autoHeight"
      />
    </div>
  );
};
