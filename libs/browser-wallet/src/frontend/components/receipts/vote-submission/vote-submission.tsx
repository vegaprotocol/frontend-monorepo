import type { RowConfig } from '@/components/data-table/conditional-data-table';
import { ConditionalDataTable } from '@/components/data-table/conditional-data-table';
import { processVoteValue, VOTE_VALUE_MAP } from '@/lib/enums';

import { ProposalLink } from '../../vega-entities/proposal-link';
import type { ReceiptComponentProperties } from '../receipts';
import { ReceiptWrapper } from '../utils/receipt-wrapper';

export const VoteSubmission = ({ transaction }: ReceiptComponentProperties) => {
  const items: RowConfig<typeof transaction.voteSubmission>[] = [
    {
      prop: 'proposalId',
      render: (proposalId) => [
        'Proposal Id',
        <ProposalLink proposalId={proposalId} />,
      ],
    },
    {
      prop: 'value',
      render: (value) => ['Value', VOTE_VALUE_MAP[processVoteValue(value)]],
    },
  ];

  return (
    <ReceiptWrapper>
      <ConditionalDataTable items={items} data={transaction.voteSubmission} />
    </ReceiptWrapper>
  );
};
