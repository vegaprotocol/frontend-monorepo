import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { ProposalDetailHeader } from './proposal';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

const proposal = generateProposal();

const renderComponent = (proposal: Proposals_proposals) => (
  <ProposalDetailHeader proposal={proposal} />
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
            code: 'FX:BTCUSD/DEC99',
            futureProduct: {
              __typename: 'FutureProduct',
              settlementAsset: {
                __typename: 'Asset',
                symbol: 'tGBP',
              },
            },
          },
          metadata: [],
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'New market: Some market'
  );
  expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
    'tGBP settled future.'
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
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'Market change: MarketId'
  );
});

it('New asset - ERC20', () => {
  render(
    renderComponent({
      ...proposal,
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'NewAsset',
          name: 'Fake currency',
          symbol: 'FAKE',
          source: {
            __typename: 'ERC20',
            contractAddress: '0x0',
          },
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'New asset: Fake currency'
  );
  expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
    'Symbol: FAKE. ERC20 0x0'
  );
});

it('New asset - BuiltInAsset', () => {
  render(
    renderComponent({
      ...proposal,
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'NewAsset',
          name: 'Fake currency',
          symbol: 'BIA',
          source: {
            __typename: 'BuiltinAsset',
            maxFaucetAmountMint: '300',
          },
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'New asset: Fake currency'
  );
  expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
    'Symbol: BIA. Max faucet amount mint: 300'
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
            key: 'Network key',
            value: 'Network value',
          },
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'Network parameter'
  );
  expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
    'Network key to Network value'
  );
});

it('Freeform network - short rationale', () => {
  render(
    renderComponent({
      ...proposal,
      id: 'short',
      rationale: {
        ...proposal.rationale,
        hash: '0x0',
        description: 'freeform description',
      },
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'NewFreeform',
        },
      },
    })
  );
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'freeform description'
  );
  expect(screen.getByTestId('proposal-details-one')).toBeEmptyDOMElement();
  expect(screen.getByTestId('proposal-details-two')).toHaveTextContent('short');
});

it('Freeform network - long rationale (105 chars)', () => {
  render(
    renderComponent({
      ...proposal,
      id: 'long',
      rationale: {
        ...proposal.rationale,
        hash: '0x0',
        description:
          'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean dolor.',
      },
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'NewFreeform',
        },
      },
    })
  );
  // For a rationale over 100 chars, we expect the header to be truncated at
  // 100 chars with ellipsis and the details-one element to contain the rest.
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean…'
  );
  expect(screen.getByTestId('proposal-details-one')).toHaveTextContent('dolor');
  expect(screen.getByTestId('proposal-details-two')).toHaveTextContent('long');
});

it('Freeform network - extra long rationale (165 chars)', () => {
  render(
    renderComponent({
      ...proposal,
      id: 'extraLong',
      rationale: {
        ...proposal.rationale,
        hash: '0x0',
        description:
          'Aenean sem odio, eleifend non sodales vitae, porttitor eu ex. Aliquam erat volutpat. Fusce pharetra libero quis risus lobortis, sed ornare leo efficitur turpis duis.',
      },
      terms: {
        ...proposal.terms,
        change: {
          __typename: 'NewFreeform',
        },
      },
    })
  );
  // For a rationale over 160 chars, we expect the header to be truncated at 100
  // chars with ellipsis and the details-one element to contain 60 chars and also
  // be truncated with an ellipsis.
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'Aenean sem odio, eleifend non sodales vitae, porttitor eu ex. Aliquam erat volutpat. Fusce pharetra…'
  );
  expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
    'libero quis risus lobortis, sed ornare leo efficitur turpis…'
  );
  expect(screen.getByTestId('proposal-details-two')).toHaveTextContent(
    'extraLong'
  );
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
  expect(screen.getByTestId('proposal-header')).toHaveTextContent(
    'Unknown proposal'
  );
});
