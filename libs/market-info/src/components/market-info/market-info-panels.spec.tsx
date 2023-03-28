import { render, screen } from '@testing-library/react';
import {
  ConditionOperator,
  ConditionOperatorMapping,
} from '@vegaprotocol/types';
import { DataSourceProof } from './market-info-panels';

describe('DataSourceProof', () => {
  const ORACLE_PUBKEY =
    '69464e35bcb8e8a2900ca0f87acaf252d50cf2ab2fc73694845a16b7c8a0dc6f';
  it('renders correct proof for external data sources', () => {
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
            public_key: ORACLE_PUBKEY,
          },
          proofs: [
            {
              format: 'signed_message' as const,
              available: true,
              type: 'public_key' as const,
              public_key: ORACLE_PUBKEY,
              message: 'SOMEHEX',
            },
          ],
          github_link: `https://github.com/vegaprotocol/well-known/blob/main/oracle-providers/PubKey-${ORACLE_PUBKEY}.toml`,
        },
      ],
      linkText: 'Termination proof',
    };
    render(<DataSourceProof {...props} />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      props.providers[0].github_link
    );
  });

  it('renders message if no matching proof is found', () => {
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
      linkText: 'Termination proof',
    };
    render(<DataSourceProof {...props} />);
    expect(
      screen.getByText('No oracle proof for data source')
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
      linkText: 'Termination proof',
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
      linkText: 'Termination proof',
    };
    render(<DataSourceProof {...props} />);
    expect(screen.getByText('Internal conditions')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${ConditionOperatorMapping[condition.operator]} ${condition.value}`
      )
    ).toBeInTheDocument();
  });
});
