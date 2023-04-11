import { render, screen } from '@testing-library/react';
import type { SettlementDataCellProps } from './closed';
import { SettlementDateCell, SettlementPriceCell } from './closed';
import type { Property } from '@vegaprotocol/types';
import { MarketState } from '@vegaprotocol/types';
import { addDays, subDays } from 'date-fns';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { OracleSpecDataConnectionQuery } from '@vegaprotocol/oracles';
import { OracleSpecDataConnectionDocument } from '@vegaprotocol/oracles';

describe('SettlementDateCell', () => {
  let originalNow: typeof Date.now;
  const mockNowTimestamp = 1672531200000;

  const createProps = (): SettlementDataCellProps => {
    return {
      oracleSpecId: 'oracle-spec-id',
      metaDate: null,
      closeTimestamp: null,
      marketState: MarketState.STATE_SETTLED,
    };
  };

  beforeAll(() => {
    originalNow = Date.now;
    Date.now = jest.fn().mockReturnValue(mockNowTimestamp);
  });

  afterAll(() => {
    Date.now = originalNow;
  });

  it('renders unknown if date cannot be determined', () => {
    const props = createProps();
    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Unknown');
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders using close timestamp if provided', () => {
    const daysAgo = 3;
    const props = createProps();
    props.closeTimestamp = subDays(
      new Date(mockNowTimestamp),
      daysAgo
    ).toISOString();

    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(`${daysAgo} days ago`);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders using meta tag date if no close timestamp provided', () => {
    const daysAgo = 4;
    const props = createProps();
    props.metaDate = subDays(new Date(mockNowTimestamp), daysAgo);

    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(`${daysAgo} days ago`);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders past expected settlement date', () => {
    const daysAgo = 3;
    const props = createProps();
    props.metaDate = subDays(new Date(mockNowTimestamp), daysAgo);
    props.marketState = MarketState.STATE_TRADING_TERMINATED;

    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(`Expected ${daysAgo} days ago`);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });

  it('renders future expected settlement date', () => {
    const daysAgo = 3;
    const props = createProps();
    props.metaDate = addDays(new Date(mockNowTimestamp), daysAgo);
    props.marketState = MarketState.STATE_TRADING_TERMINATED;

    render(<SettlementDateCell {...props} />);

    const link = screen.getByRole('link');
    expect(link).toHaveTextContent(`Expected in ${daysAgo} days`);
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining(`/oracles/${props.oracleSpecId}`)
    );
  });
});

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

  it('renders fetches and renders the settlment data value', async () => {
    const props = {
      oracleSpecId: 'oracle-spec-id',
      decimalPlaces: 2,
      settlementDataSpecBinding: 'settlement-data-spec-binding',
    };
    const property = {
      __typename: 'Property' as const,
      name: props.settlementDataSpecBinding,
      value: '1234',
    };
    const mock = createMock(props.oracleSpecId, property);

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

  it('renders unknown if no spec value is found', async () => {
    const props = {
      oracleSpecId: 'oracle-spec-id',
      decimalPlaces: 2,
      settlementDataSpecBinding: 'settlement-data-spec-binding',
    };
    const property = {
      __typename: 'Property' as const,
      name: 'no matching spec binding',
      value: '1234',
    };
    const mock = createMock(props.oracleSpecId, property);

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

  it('renders unknown with no link if oracle spec id is not provided', () => {
    const props = {
      oracleSpecId: undefined,
      decimalPlaces: 2,
      settlementDataSpecBinding: 'settlement-data-spec-binding',
    };
    render(
      <MockedProvider mocks={[]}>
        <SettlementPriceCell {...props} />
      </MockedProvider>
    );

    expect(screen.getByText('Unknown')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
