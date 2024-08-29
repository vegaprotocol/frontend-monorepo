import {
  useAMMs,
  useLiquidityFees,
  useMakerFees,
  useLiquidityProvisions,
  type Market,
} from '@vegaprotocol/rest';
import {
  v1AMMStatus,
  vegaLiquidityProvisionStatus,
} from '@vegaprotocol/rest-clients/dist/trading-data';
import BigNumber from 'bignumber.js';
import compact from 'lodash/compact';
import { t } from '../../../lib/use-t';
import { truncateMiddle } from '@vegaprotocol/ui-toolkit';
import { AgGrid } from '@vegaprotocol/datagrid';

type Commitment = {
  amount: BigNumber;
  partyId: string;
};

export const LiquidityTable = ({ market }: { market: Market }) => {
  const { data: ammsData } = useAMMs({ marketId: market.id });
  const { data: provisionsData, status: provisionsStatus } =
    useLiquidityProvisions(market.id);
  const { data: liquidityFees, status: liquidityFeesStatus } = useLiquidityFees(
    market.id
  );
  const { data: makerFees, status: makerFeesStatus } = useMakerFees(market.id);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loading = [
    provisionsStatus,
    liquidityFeesStatus,
    makerFeesStatus,
  ].includes('pending');

  const amms = compact(
    ammsData
      ?.filter((a) => a.status === v1AMMStatus.STATUS_ACTIVE)
      ?.map((a) => {
        return {
          amount: a.commitment.value,
          partyId: a.partyId,
        };
      })
  );
  const provisions = compact(
    provisionsData
      ?.filter((p) => p.status === vegaLiquidityProvisionStatus.STATUS_ACTIVE)
      ?.map((p) => {
        return {
          amount: p.commitmentAmount.value,
          partyId: p.partyId,
        };
      })
  );

  const combined: Commitment[] = [];
  for (const commitment of [...amms, ...provisions]) {
    const idx = combined.findIndex((a) => a.partyId === commitment.partyId);
    if (idx >= 0) {
      combined[idx].amount = combined[idx].amount.plus(commitment.amount);
    } else {
      combined.push(commitment);
    }
  }

  const rowData = combined.map((c) => {
    const lfs = compact(
      liquidityFees?.perParty
        .filter((f) => f.partyId === c.partyId)
        .map((f) => f.amount.value)
    );
    const lf = lfs.length > 0 ? BigNumber.sum.apply(null, lfs) : BigNumber(0);

    const mfs = compact(
      makerFees?.perParty
        .filter((f) => f.partyId === c.partyId)
        .map((f) => f.amount.value)
    );
    const mf = mfs.length > 0 ? BigNumber.sum.apply(null, mfs) : BigNumber(0);

    return {
      ...c,
      fees: lf.plus(mf),
    };
  });

  return (
    <div className="h-full border rounded border-gs-300 dark:border-gs-700">
      <AgGrid
        rowData={rowData}
        rowClass={
          '!border-b !last:border-b-0 mb-1 border-gs-200 dark:border-gs-800'
        }
        domLayout="autoHeight"
        suppressDragLeaveHidesColumns
        overlayLoadingTemplate={t('AMM_TABLE_LOADING')}
        overlayNoRowsTemplate={t('AMM_TABLE_NO_DATA')}
        columnDefs={[
          {
            headerName: t('AMM_LIQUIDITY_TABLE_PARTY'),
            field: 'partyId',
            valueFormatter: (value) =>
              truncateMiddle(value.data?.partyId || ''),
            flex: 1,
          },
          {
            headerName: t('AMM_LIQUIDITY_TABLE_COMMITMENT'),
            field: 'amount',
            valueFormatter: (value) =>
              value.data?.amount.toFormat(market.decimalPlaces) || '-',
            flex: 1,
          },
          {
            headerName: t('AMM_LIQUIDITY_TABLE_FEES'),
            field: 'fees',
            valueFormatter: (value) =>
              value.data?.fees.toFormat(market.decimalPlaces) || '-',
            flex: 1,
          },
        ]}
      />
    </div>
  );
};
