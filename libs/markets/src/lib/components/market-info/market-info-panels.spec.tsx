import { render, screen } from '@testing-library/react';
import {
  ConditionOperator,
  ConditionOperatorMapping,
} from '@vegaprotocol/types';
import { DataSourceProof } from './market-info-panels';

jest.mock('../../hooks/use-oracle-markets', () => ({
  useOracleMarkets: () => [],
}));

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
      value: '100',
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
    expect(
      screen.getByText(
        `${ConditionOperatorMapping[condition.operator]} ${condition.value}`
      )
    ).toBeInTheDocument();
  });
});
