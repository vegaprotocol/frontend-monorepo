import type { components } from '../../../types/explorer';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import { MemoryRouter } from 'react-router-dom';
import AmendOrderDetails from './amend-order-details';
import { ExplorerDeterministicOrderDocument } from './__generated__/Order';
import { render } from '@testing-library/react';
import * as Schema from '@vegaprotocol/types';
import { ExplorerMarketDocument } from '../links/market-link/__generated__/Market';

type Amend = components['schemas']['v1OrderAmendment'];

function renderAmendOrderDetails(
  id: string,
  version: number | undefined,
  amend: Amend,
  mocks: MockedResponse[]
) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <AmendOrderDetails version={version} id={id} amend={amend} />
      </MemoryRouter>
    </MockedProvider>
  );
}

function renderExistingAmend(
  id: string,
  version: number | undefined,
  amend: Amend
) {
  const mocks = [
    {
      request: {
        query: ExplorerDeterministicOrderDocument,
        variables: {
          orderId: '123',
          version: 1,
        },
      },
      result: {
        data: {
          orderByID: {
            __typename: 'Order',
            id: '123',
            type: 'GTT',
            status: Schema.OrderStatus.STATUS_ACTIVE,
            version: version,
            createdAt: '123',
            updatedAt: '456',
            expiresAt: '789',
            timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
            price: '200',
            side: 'BUY',
            peggedOrder: null,
            remaining: '99',
            rejectionReason: 'rejection',
            reference: '123',
            size: '100',
            party: {
              __typename: 'Party',
              id: '234',
            },
            market: {
              __typename: 'Market',
              id: '789',
              state: 'STATUS_ACTIVE',
              positionDecimalPlaces: 2,
              decimalPlaces: '5',
              tradableInstrument: {
                instrument: {
                  name: 'test',
                  product: {
                    __typename: 'Future',
                    quoteName: '123',
                    settlementAsset: {
                      decimals: 8,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      request: {
        query: ExplorerDeterministicOrderDocument,
        variables: {
          orderId: '123',
        },
      },
      result: {
        data: {
          orderByID: {
            __typename: 'Order',
            id: '123',
            type: 'GTT',
            status: Schema.OrderStatus.STATUS_ACTIVE,
            version: 100,
            createdAt: '123',
            updatedAt: '456',
            expiresAt: '789',
            timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
            peggedOrder: null,
            price: '200',
            side: 'BUY',
            remaining: '99',
            rejectionReason: 'rejection',
            reference: '123',
            size: '200',
            party: {
              __typename: 'Party',
              id: '234',
            },
            market: {
              __typename: 'Market',
              id: 'amend-to-order-latest-version',
              state: 'STATUS_ACTIVE',
              positionDecimalPlaces: 2,
              decimalPlaces: '5',
              tradableInstrument: {
                instrument: {
                  name: 'amend-to-order-latest-version-test',
                  product: {
                    __typename: 'Future',
                    quoteName: '123',
                    settlementAsset: {
                      decimals: 8,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      request: {
        query: ExplorerMarketDocument,
        variables: {
          id: '789',
        },
      },
      result: {
        data: {
          market: {
            id: '789',
            decimalPlaces: 5,
            positionDecimalPlaces: 2,
            state: 'irrelevant-test-data',
            tradableInstrument: {
              instrument: {
                name: 'test-label',
                product: {
                  __typename: 'Future',
                  quoteName: 'dai',
                  settlementAsset: {
                    decimals: 8,
                  },
                },
              },
            },
          },
        },
      },
    },
  ];

  return renderAmendOrderDetails(id, version, amend, mocks);
}

describe('Amend order details', () => {
  it('Renders price if price changed', async () => {
    const amend: Amend = {
      sizeDelta: '123',
    };

    const res = renderExistingAmend('123', 1, amend);
    expect(await res.findByText('New size')).toBeInTheDocument();
  });

  it('Renders Reference if provided', async () => {
    const amend: Amend = {
      peggedReference: 'PEGGED_REFERENCE_MID',
    };

    const res = renderExistingAmend('123', 1, amend);
    expect(await res.findByText('New reference')).toBeInTheDocument();
    expect(await res.findByText('Mid')).toBeInTheDocument();
  });

  it('Renders offset if provided: positive', async () => {
    const amend: Amend = {
      peggedOffset: '1',
    };

    const res = renderExistingAmend('123', 1, amend);
    expect(await res.findByText('New offset')).toBeInTheDocument();
    expect(await res.findByText('1')).toBeInTheDocument();
  });

  it('Renders positive price if provided', async () => {
    const amend: Amend = {
      price: '7879',
    };

    const res = renderExistingAmend('123', 1, amend);
    expect(await res.findByText('New price')).toBeInTheDocument();
    expect(await res.findByText('7879')).toBeInTheDocument();
  });

  it('Renders negative price if provided', async () => {
    const amend: Amend = {
      price: '-7879',
    };

    const res = renderExistingAmend('123', 1, amend);
    expect(await res.findByText('New price')).toBeInTheDocument();
    expect(await res.findByText('-7879')).toBeInTheDocument();
  });

  it('Fetches latest version when version is not specified', async () => {
    const amend: Amend = {
      price: '-7879',
    };

    const res = renderExistingAmend('123', undefined, amend);
    expect(
      await res.findByText('amend-to-order-latest-version')
    ).toBeInTheDocument();
  });
});
