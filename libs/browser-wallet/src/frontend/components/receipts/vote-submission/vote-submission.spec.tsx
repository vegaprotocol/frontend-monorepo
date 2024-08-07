import { render, screen } from '@testing-library/react';
import { vegaVoteValue } from '@vegaprotocol/rest-clients/dist/trading-data';

import { locators as dataTableLocators } from '@/components/data-table';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { fairground } from '../../../../config/well-known-networks';
import { locators } from '../../vega-entities/proposal-link';
import { VoteSubmission } from './vote-submission';

jest.mock('../utils/receipt-wrapper', () => ({
  ReceiptWrapper: ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="receipt-wrapper">{children}</div>;
  },
}));

describe('VoteSubmission', () => {
  it('renders proposalId with link and value', () => {
    // 1134-VTSB-001 I can see the proposals Id of the proposal I am voting on
    // 1134-VTSB-002 I can see a link to see the proposal information
    // 1134-VTSB-003 I can see the direction I am voting in
    render(
      <MockNetworkProvider>
        <VoteSubmission
          transaction={{
            voteSubmission: {
              proposalId: '1'.repeat(64),
              value: vegaVoteValue.VALUE_YES,
            },
          }}
        />
      </MockNetworkProvider>
    );
    const rows = screen.getAllByTestId(dataTableLocators.dataRow);
    expect(rows[0]).toHaveTextContent('111111…1111');
    expect(rows[0]).toHaveTextContent('Proposal Id');
    expect(rows[1]).toHaveTextContent('Value');
    expect(rows[1]).toHaveTextContent('For');

    expect(screen.getByTestId(locators.proposalLink)).toHaveAttribute(
      'href',
      `${fairground.governance}/proposals/${'1'.repeat(64)}`
    );
  });
});
