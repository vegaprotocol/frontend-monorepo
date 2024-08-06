import { render, screen } from '@testing-library/react';
import { v1UndelegateSubmissionMethod as UndelegateSubmissionMethod } from '@vegaprotocol/rest-clients/dist/trading-data';

import { locators as dataTableLocators } from '@/components/data-table';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';

import { fairground } from '../../../../config/well-known-networks';
import { locators } from '../../vega-entities/node-link';
import { UndelegateSubmission } from './undelegate-submission';

jest.mock('../utils/receipt-wrapper', () => ({
  ReceiptWrapper: ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="receipt-wrapper">{children}</div>;
  },
}));

describe('UndelegateSubmission', () => {
  it('render nodeId, amount and method at end of epoch', () => {
    // 1136-UDLG-001 I can see the node Id of the node I want to undelegate from
    // 1136-UDLG-002 I can see a link to see the node information
    // 1136-UDLG-003 I can see the amount I am undelegating
    // 1136-UDLG-004 I can see the method of undelegation I am using
    render(
      <MockNetworkProvider>
        <UndelegateSubmission
          transaction={{
            undelegateSubmission: {
              nodeId: '1'.repeat(64),
              amount: '1' + '0'.repeat(18),
              method: UndelegateSubmissionMethod.METHOD_AT_END_OF_EPOCH,
            },
          }}
        />
      </MockNetworkProvider>
    );
    const rows = screen.getAllByTestId(dataTableLocators.dataRow);
    expect(rows[0]).toHaveTextContent('111111…1111');
    expect(rows[0]).toHaveTextContent('Node Id');

    expect(rows[1]).toHaveTextContent('Amount');
    expect(rows[1]).toHaveTextContent('1');
    expect(rows[1]).toHaveTextContent('VEGA');

    expect(screen.getByTestId(locators.nodeLink)).toHaveAttribute(
      'href',
      `${fairground.governance}/validators/${'1'.repeat(64)}`
    );

    expect(rows[2]).toHaveTextContent('Method');
    expect(rows[2]).toHaveTextContent('End of epoch');
  });
});
