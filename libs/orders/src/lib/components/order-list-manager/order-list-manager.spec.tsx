import { render, screen } from '@testing-library/react';
import type { OrderListManagerProps } from './order-list-manager';
import { OrderListManager, Filter } from './order-list-manager';
import * as useDataProviderHook from '@vegaprotocol/data-provider';
import type { OrderFieldsFragment } from '../';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';

const generateJsx = (props: Partial<OrderListManagerProps> | null = null) => {
  const pubKey = '0x123';
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={{ pubKey } as VegaWalletContextShape}>
        <OrderListManager partyId={pubKey} isReadOnly={false} {...props} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
};

describe('OrderListManager', () => {
  it('should render the order list if orders provided', async () => {
    jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
      data: [{ id: '1' } as OrderFieldsFragment],
      loading: false,
      error: undefined,
      flush: jest.fn(),
      reload: jest.fn(),
      load: jest.fn(),
      pageInfo: null,
    });
    render(generateJsx());

    expect(
      await screen.getByRole('treegrid', {
        name: (_, element) => element.classList.contains('ag-root'),
      })
    ).toBeInTheDocument();
  });

  it('should display order info', async () => {
    jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
      data: [{ id: '1' } as OrderFieldsFragment],
      loading: false,
      error: new Error('Query error'),
      flush: jest.fn(),
      reload: jest.fn(),
      load: jest.fn(),
      pageInfo: null,
    });

    render(generateJsx());

    expect(
      await screen.getByText('Something went wrong: Query error')
    ).toBeInTheDocument();
  });

  it('should display no rows overlay', async () => {
    jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
      data: [],
      loading: false,
      error: undefined,
      flush: jest.fn(),
      reload: jest.fn(),
      load: jest.fn(),
      pageInfo: null,
    });

    render(
      generateJsx({ filter: Filter.Closed, noRowsMessage: 'no rows message' })
    );

    expect(screen.getByText('no rows message')).toBeInTheDocument();
  });
});
