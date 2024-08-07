import { formatNumber } from '@vegaprotocol/utils';

import type { RowConfig } from '@/components/data-table/conditional-data-table';
import { ConditionalDataTable } from '@/components/data-table/conditional-data-table';
import { VegaMarket } from '@/components/vega-entities/vega-market';
import { MARGIN_MODE_MAP, processMarginMode } from '@/lib/enums';

import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';

export const UpdateMarginMode = ({
  transaction,
}: ReceiptComponentProperties) => {
  const items: RowConfig<typeof transaction.updateMarginMode>[] = [
    {
      prop: 'marketId',
      render: (marketId) => [
        'Market',
        <VegaMarket key="update-margin-mode-market" marketId={marketId} />,
      ],
    },
    {
      prop: 'mode',
      render: (mode) => ['Mode', MARGIN_MODE_MAP[processMarginMode(mode)]],
    },
    {
      prop: 'marginFactor',
      render: (marginFactor) => [
        'Leverage',
        `${formatNumber(1 / Number(marginFactor), 2)}X`,
      ],
    },
    {
      prop: 'marginFactor',
      render: (marginFactor) => ['Margin Factor', marginFactor],
    },
  ];

  return (
    <ReceiptWrapper>
      <ConditionalDataTable items={items} data={transaction.updateMarginMode} />
    </ReceiptWrapper>
  );
};
