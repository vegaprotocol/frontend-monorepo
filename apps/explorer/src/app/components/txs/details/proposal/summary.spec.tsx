import { render } from '@testing-library/react';
import { ProposalSummary } from './summary';
import type { ProposalTerms } from '../tx-proposal';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../../../config/flags', () => ({
  successorMarkets: true,
}));

describe('tx-proposal', () => {
  it('should render extra paragraph when parentMarketId is set', () => {
    const terms = {
      newMarket: {
        changes: {
          successorConfiguration: {
            parentMarketId: 'market123',
          },
        },
      },
    };

    const { getByTestId } = render(
      <MemoryRouter>
        <MockedProvider>
          <ProposalSummary id="123" terms={terms as unknown as ProposalTerms} />
        </MockedProvider>
      </MemoryRouter>
    );

    expect(getByTestId('successor-link')).toBeInTheDocument();
  });

  it('should not render extra paragraph when parentMarketId is not set', () => {
    const terms: ProposalTerms = {
      // add other required properties for terms object
    };

    const { queryByTestId } = render(
      <MemoryRouter>
        <MockedProvider>
          <ProposalSummary id="123" terms={terms} />
        </MockedProvider>
      </MemoryRouter>
    );

    expect(queryByTestId('successor-link')).not.toBeInTheDocument();
  });
});
