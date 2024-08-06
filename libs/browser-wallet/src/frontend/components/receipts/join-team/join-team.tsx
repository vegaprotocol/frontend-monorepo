import type { RowConfig } from '@/components/data-table/conditional-data-table';
import { ConditionalDataTable } from '@/components/data-table/conditional-data-table';
import { TeamLink } from '@/components/vega-entities/team-link';
import { VegaTeam } from '@/components/vega-entities/vega-team';

import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';

export const JoinTeam = ({ transaction }: ReceiptComponentProperties) => {
  const items: RowConfig<typeof transaction.joinTeam>[] = [
    {
      prop: 'id',
      render: (id) => ['Team', <VegaTeam key="join-team-name" id={id} />],
    },
    {
      prop: 'id',
      render: (id) => ['Team Id', <TeamLink key="join-team-id" id={id} />],
    },
  ];
  return (
    <ReceiptWrapper>
      <ConditionalDataTable items={items} data={transaction.joinTeam} />
    </ReceiptWrapper>
  );
};
