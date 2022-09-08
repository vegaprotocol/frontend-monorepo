import { render, screen } from '@testing-library/react';
import { generateProposal } from '../../test-helpers/generate-proposals';
import { ProposalHeader } from './proposal-header';
import type { Proposals_proposals } from '../../proposals/__generated__/Proposals';

const renderComponent = (proposal: Proposals_proposals) => (
  <ProposalHeader proposal={proposal} />
);

describe('Proposal header', () => {
  it('Renders New market proposal', () => {
    render(
      renderComponent(
        generateProposal({
          terms: {
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
      )
    );
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'New market: Some market'
    );
    expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
      'tGBP settled future.'
    );
  });

  it('Renders Update market proposal', () => {
    render(
      renderComponent(
        generateProposal({
          terms: {
            change: {
              __typename: 'UpdateMarket',
              marketId: 'MarketId',
            },
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'Market change: MarketId'
    );
  });

  it('Renders New asset proposal - ERC20', () => {
    render(
      renderComponent(
        generateProposal({
          terms: {
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
      )
    );
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'New asset: Fake currency'
    );
    expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
      'Symbol: FAKE. ERC20 0x0'
    );
  });

  it('Renders New asset proposal - BuiltInAsset', () => {
    render(
      renderComponent(
        generateProposal({
          terms: {
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
      )
    );
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'New asset: Fake currency'
    );
    expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
      'Symbol: BIA. Max faucet amount mint: 300'
    );
  });

  it('Renders Update network', () => {
    render(
      renderComponent(
        generateProposal({
          terms: {
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
      )
    );
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'Network parameter'
    );
    expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
      'Network key to Network value'
    );
  });

  // Skipped until proposals have rationale - https://github.com/vegaprotocol/frontend-monorepo/issues/824
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Renders Freeform network - short rationale', () => {
    render(
      renderComponent(
        generateProposal({
          id: 'short',
          // rationale: {
          //   hash: '0x0',
          //   description: 'freeform description',
          // },
          terms: {
            change: {
              __typename: 'NewFreeform',
            },
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'freeform description'
    );
    expect(screen.getByTestId('proposal-details-one')).toBeEmptyDOMElement();
    expect(screen.getByTestId('proposal-details-two')).toHaveTextContent(
      'short'
    );
  });

  // Skipped until proposals have rationale
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Renders Freeform proposal - long rationale (105 chars)', () => {
    render(
      renderComponent(
        generateProposal({
          id: 'long',
          // rationale: {
          //   hash: '0x0',
          //   description:
          //     'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean dolor.',
          // },
          terms: {
            change: {
              __typename: 'NewFreeform',
            },
          },
        })
      )
    );
    // For a rationale over 100 chars, we expect the header to be truncated at
    // 100 chars with ellipsis and the details-one element to contain the rest.
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean…'
    );
    expect(screen.getByTestId('proposal-details-one')).toHaveTextContent(
      'dolor'
    );
    expect(screen.getByTestId('proposal-details-two')).toHaveTextContent(
      'long'
    );
  });

  // Skipped until proposals have rationale
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('Renders Freeform proposal - extra long rationale (165 chars)', () => {
    render(
      renderComponent(
        generateProposal({
          id: 'extraLong',
          // rationale: {
          //   hash: '0x0',
          //   description:
          //     'Aenean sem odio, eleifend non sodales vitae, porttitor eu ex. Aliquam erat volutpat. Fusce pharetra libero quis risus lobortis, sed ornare leo efficitur turpis duis.',
          // },
          terms: {
            change: {
              __typename: 'NewFreeform',
            },
          },
        })
      )
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

  // Remove once proposals have rationale and re-enable above tests
  it('Renders Freeform proposal - id for title', () => {
    render(
      renderComponent(
        generateProposal({
          id: 'freeform id',
          terms: {
            change: {
              __typename: 'NewFreeform',
            },
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'Freeform proposal: freeform id'
    );
    expect(
      screen.queryByTestId('proposal-details-one')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('proposal-details-two')
    ).not.toBeInTheDocument();
  });

  it("Renders unknown proposal if it's a different proposal type", () => {
    render(
      renderComponent(
        generateProposal({
          terms: {
            change: {
              // @ts-ignore unknown proposal
              __typename: 'Foo',
            },
          },
        })
      )
    );
    expect(screen.getByTestId('proposal-header')).toHaveTextContent(
      'Unknown proposal'
    );
  });
});
