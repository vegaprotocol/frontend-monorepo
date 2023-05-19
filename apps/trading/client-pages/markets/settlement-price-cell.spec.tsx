import { render, screen } from '@testing-library/react';
import type { Property } from '@vegaprotocol/types';
import { PropertyKeyType } from '@vegaprotocol/types';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { OracleSpecDataConnectionQuery } from '@vegaprotocol/markets';
import { OracleSpecDataConnectionDocument } from '@vegaprotocol/markets';
import type { SettlementPriceCellProps } from './settlement-price-cell';
import { SettlementPriceCell } from './settlement-price-cell';
import { addDecimalsFormatNumber } from '@vegaprotocol/utils';

describe('SettlementPriceCell', () => {
  const settlementDataSpecBinding = 'settlement-data-spec-binding';

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
  const createProps = (
    filterKey = {
      name: settlementDataSpecBinding,
      type: PropertyKeyType.TYPE_INTEGER,
      numberDecimalPlaces: 2,
    }
  ): SettlementPriceCellProps => {
    return {
      oracleSpecId: 'oracle-spec-id',
      filter: {
        key: filterKey,
      },
      settlementDataSpecBinding,
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
    expect(link).toHaveTextContent(
      addDecimalsFormatNumber(
        property.value,
        props.filter?.key.numberDecimalPlaces || 0
      )
    );
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders "Unknown" if no spec value is found', async () => {
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
    expect(link).toHaveTextContent('Unknown');
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

  it('does not format value if property key type is not integer', async () => {
    const props = createProps({
      name: settlementDataSpecBinding,
      type: PropertyKeyType.TYPE_TIMESTAMP,
      numberDecimalPlaces: 2,
    });
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
    expect(link).toHaveTextContent(property.value);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });
});
