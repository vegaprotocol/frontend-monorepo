import { render, screen, waitFor } from '@testing-library/react';
import {
  ConditionOperator,
  ConditionOperatorMapping,
} from '@vegaprotocol/types';
import { DataSourceProof, SuccessionLineInfoPanel } from './market-info-panels';
import { MockedProvider } from '@apollo/react-testing';
import { SuccessorMarketIdsDocument } from '../../__generated__';
import { getDateTimeFormat } from '@vegaprotocol/utils';

jest.mock('../../hooks/use-oracle-markets', () => ({
  useOracleMarkets: () => [],
}));

describe('MarketInfoPanels', () => {
  describe('DataSourceProof', () => {
    const ORACLE_PUBKEY =
      '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f';

    it('renders message if there are no providers', () => {
      const props = {
        data: {
          sourceType: {
            __typename: 'DataSourceDefinitionExternal' as const,
            sourceType: {
              __typename: 'DataSourceSpecConfiguration' as const,
              signers: [
                {
                  __typename: 'Signer' as const,
                  signer: {
                    __typename: 'PubKey' as const,
                    key: ORACLE_PUBKEY,
                  },
                },
              ],
            },
          },
        },
        providers: [],
        type: 'termination' as const,
      };
      render(<DataSourceProof dataSourceSpecId={''} {...props} />);
      expect(
        screen.getByText('No oracle proof for termination')
      ).toBeInTheDocument();
    });

    it('renders message if there are no matching proofs', () => {
      const props = {
        data: {
          sourceType: {
            __typename: 'DataSourceDefinitionExternal' as const,
            sourceType: {
              __typename: 'DataSourceSpecConfiguration' as const,
              signers: [
                {
                  __typename: 'Signer' as const,
                  signer: {
                    __typename: 'PubKey' as const,
                    key: ORACLE_PUBKEY,
                  },
                },
              ],
            },
          },
        },
        providers: [
          {
            name: 'Another oracle',
            url: 'https://zombo.com',
            description_markdown:
              'Some markdown describing the oracle provider.\n\nTwitter: @FacesPics2\n',
            oracle: {
              status: 'GOOD' as const,
              status_reason: '',
              first_verified: '2022-01-01T00:00:00.000Z',
              last_verified: '2022-12-31T00:00:00.000Z',
              type: 'public_key' as const,
              public_key: 'not-the-pubkey',
            },
            proofs: [
              {
                format: 'signed_message' as const,
                available: true,
                type: 'public_key' as const,
                public_key: 'not-the-pubkey',
                message: 'SOMEHEX',
              },
            ],
            github_link: `https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/PubKey-${ORACLE_PUBKEY}.toml`,
          },
        ],
        type: 'settlementData' as const,
      };
      render(<DataSourceProof dataSourceSpecId={''} {...props} />);
      expect(
        screen.getByText('No oracle proof for settlement data')
      ).toBeInTheDocument();
    });

    it('renders message if no data source on market', () => {
      const props = {
        data: {
          sourceType: {
            __typename: 'Invalid',
          },
        },
        providers: [],
        type: 'termination' as const,
      };
      // @ts-ignore types are invalid
      render(<DataSourceProof {...props} />);
      expect(screen.getByText('Invalid data source')).toBeInTheDocument();
    });

    it('renders conditions for internal data sources', () => {
      const condition = {
        __typename: 'Condition' as const,
        operator: ConditionOperator.OPERATOR_GREATER_THAN,
        value: '1696238009',
      };
      const props = {
        data: {
          sourceType: {
            __typename: 'DataSourceDefinitionInternal' as const,
            sourceType: {
              __typename: 'DataSourceSpecConfigurationTime' as const,
              conditions: [condition],
            },
          },
        },
        providers: [],
        type: 'termination' as const,
      };
      render(<DataSourceProof dataSourceSpecId={''} {...props} />);
      expect(screen.getByText('Internal conditions')).toBeInTheDocument();
      const dateFromUnixTimestamp = condition.value
        ? getDateTimeFormat().format(new Date(parseInt(condition.value) * 1000))
        : '-';
      expect(
        screen.getByText(
          `${
            ConditionOperatorMapping[condition.operator]
          } ${dateFromUnixTimestamp}`
        )
      ).toBeInTheDocument();
    });
  });

  describe('SuccessionLineInfoPanel', () => {
    const mocks = [
      {
        request: {
          query: SuccessorMarketIdsDocument,
        },
        result: {
          data: {
            __typename: 'Query',
            marketsConnection: {
              __typename: 'MarketConnection',
              edges: [
                {
                  __typename: 'MarketEdge',
                  node: {
                    __typename: 'Market',
                    id: 'abc',
                    successorMarketID: 'def',
                    parentMarketID: null,
                  },
                },
                {
                  __typename: 'MarketEdge',
                  node: {
                    __typename: 'Market',
                    id: 'def',
                    successorMarketID: 'ghi',
                    parentMarketID: 'abc',
                  },
                },
                {
                  __typename: 'MarketEdge',
                  node: {
                    __typename: 'Market',
                    id: 'ghi',
                    successorMarketID: null,
                    parentMarketID: 'def',
                  },
                },
              ],
            },
          },
        },
      },
    ];

    it.each([
      ['abc', 1],
      ['def', 2],
      ['ghi', 3],
    ])(
      'renders succession line for %s (current position %d)',
      async (id, number) => {
        render(
          <MockedProvider mocks={mocks}>
            <SuccessionLineInfoPanel
              market={{
                id,
              }}
            />
          </MockedProvider>
        );

        await waitFor(() => {
          const items = screen.getAllByTestId('succession-line-item');
          expect(items.length).toBe(3);
          expect(
            items[0].querySelector(
              '[data-testid="succession-line-item-market-id"]'
            )?.textContent
          ).toBe('abc');
          expect(
            items[1].querySelector(
              '[data-testid="succession-line-item-market-id"]'
            )?.textContent
          ).toBe('def');
          expect(
            items[2].querySelector(
              '[data-testid="succession-line-item-market-id"]'
            )?.textContent
          ).toBe('ghi');

          expect(
            items[number - 1].querySelector('[data-testid="icon-bullet"]')
          ).toBeInTheDocument();
        });
      }
    );
  });
});
