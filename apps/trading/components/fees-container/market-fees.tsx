import compact from 'lodash/compact';
import type { MarketMaybeWithDataAndCandles } from '@vegaprotocol/markets';
import { AgGrid } from '@vegaprotocol/datagrid';
import { t } from '@vegaprotocol/i18n';
import { formatPercentage, getAdjustedFee } from './utils';
import { MarketCodeCell } from '../../client-pages/markets/market-code-cell';
import BigNumber from 'bignumber.js';

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
    const infraFee = new BigNumber(m.fees.factors.infrastructureFee);
    const makerFee = new BigNumber(m.fees.factors.makerFee);
    const liquidityFee = new BigNumber(m.fees.factors.liquidityFee);
    const totalFee = infraFee.plus(makerFee).plus(liquidityFee);

    const feeAfterDiscount = getAdjustedFee(
      [infraFee, makerFee, liquidityFee],
      [new BigNumber(referralDiscount), new BigNumber(volumeDiscount)]
    );

    return {
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
