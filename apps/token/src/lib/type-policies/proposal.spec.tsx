import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../routes/governance/test-helpers/generate-proposals';
import { ProposalHeader } from './proposal';
import type { Proposals_proposals } from '../../routes/governance/proposals/__generated__/Proposals';

const proposal = generateProposal();

const renderComponent = (proposal: Proposals_proposals) => (
  <ProposalHeader proposal={proposal} />
);

it('New market', () => {
  render(
    renderComponent({
      ...proposal,
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'NewMarket',
          decimalPlaces: 1,
          instrument: {
            __typename: 'InstrumentConfiguration',
            name: 'Some market',
          },
          metadata: [],
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-primary-text')).toHaveTextContent(
    'New market: Some market'
  );
});

it('New asset', () => {
  render(
    renderComponent({
      ...proposal,
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'NewAsset',
          symbol: 'FAKE',
          source: {
            __typename: 'ERC20',
            contractAddress: '0x0',
          },
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-primary-text')).toHaveTextContent(
    'Asset change: FAKE'
  );
});

it('Update market', () => {
  render(
    renderComponent({
      ...proposal,
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'UpdateMarket',
          marketId: 'MarketId',
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-primary-text')).toHaveTextContent(
    'Market change: MarketId'
  );
});

it('Update network', () => {
  render(
    renderComponent({
      ...proposal,
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'UpdateNetworkParameter',
          networkParameter: {
            __typename: 'NetworkParameter',
            key: 'key',
            value: 'value',
          },
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-primary-text')).toHaveTextContent(
    'Network parameter change: key'
  );
});

it('Freeform network', () => {
  render(
    renderComponent({
      ...proposal,
      rationale: {
        ...proposal.rationale,
        hash: '0x0',
      },
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'NewFreeform',
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-primary-text')).toHaveTextContent('0x0');
});

it("Renders unknown proposal if it's a different proposal type", () => {
  render(
    renderComponent({
      ...proposal,
      terms: {
        ...proposal.terms,
        change: {
          // @ts-ignore unknown proposal
          __typename: 'Foo',
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-primary-text')).toHaveTextContent(
    'Unknown proposal'
  );
});
