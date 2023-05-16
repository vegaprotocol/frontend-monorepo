import { render, screen } from '@testing-library/react';
import type { Property } from '@vegaprotocol/types';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { OracleSpecDataConnectionQuery } from '@vegaprotocol/markets';
import { OracleSpecDataConnectionDocument } from '@vegaprotocol/markets';
import type { SettlementPriceCellProps } from './settlement-price-cell';
import { SettlementPriceCell } from './settlement-price-cell';

describe('SettlementPriceCell', () => {
  const createMock = (
    id: string,
    property: Property
  ): MockedResponse<OracleSpecDataConnectionQuery> => {
    return {
      request: {
        query: OracleSpecDataConnectionDocument,
        variables: {
          oracleSpecId: id,
        },
      },
      result: {
        data: {
          oracleSpec: {
            dataConnection: {
              edges: [
                {
                  node: {
                    externalData: {
                      data: {
                        data: [property],
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
    };
  };
  const createProps = (): SettlementPriceCellProps => {
    return {
      oracleSpecId: 'oracle-spec-id',
      decimalPlaces: 2,
      settlementDataSpecBinding: 'settlement-data-spec-binding',
    };
  };
  it('renders fetches and renders the settlment data value', async () => {
    const props = createProps();
    const property = {
      __typename: 'Property' as const,
      name: props.settlementDataSpecBinding as string,
      value: '1234',
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mock = createMock(props.oracleSpecId!, property);

    render(
      <MockedProvider mocks={[mock]}>
        <SettlementPriceCell {...props} />
      </MockedProvider>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
    const link = await screen.findByRole('link');
    expect(link).toHaveTextContent('12.34');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders "-" if no spec value is found', async () => {
    const props = createProps();
    const property = {
      __typename: 'Property' as const,
      name: 'no matching spec binding',
      value: '1234',
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const mock = createMock(props.oracleSpecId!, property);

    render(
      <MockedProvider mocks={[mock]}>
        <SettlementPriceCell {...props} />
      </MockedProvider>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
    const link = await screen.findByRole('link');
    expect(link).toHaveTextContent('-');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders "-" with no link if oracle spec id is not provided', () => {
    const props = createProps();
    props.oracleSpecId = undefined;

    render(
      <MockedProvider mocks={[]}>
        <SettlementPriceCell {...props} />
      </MockedProvider>
    );

    expect(screen.getByText('-')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
