import { render, screen } from '@testing-library/react';
import type { OrderListManagerProps } from './order-list-manager';
import { OrderListManager, Filter } from './order-list-manager';
import * as useDataProviderHook from '@vegaprotocol/data-provider';
import type { OrderFieldsFragment } from '../';
import { MockedProvider } from '@apollo/client/testing';
import {
  MockedWalletProvider,
  mockConfig,
} from '@vegaprotocol/wallet-react/testing';

describe('OrderListManager', () => {
  const pubKey = '0x123';

  const generateJsx = (props: Partial<OrderListManagerProps> | null = null) => {
    return (
      <MockedProvider>
        <MockedWalletProvider>
          <OrderListManager partyId={pubKey} isReadOnly={false} {...props} />
        </MockedWalletProvider>
      </MockedProvider>
    );
  };

  beforeAll(() => {
    mockConfig.store.setState({ pubKey });
  });

  afterAll(() => {
    mockConfig.reset();
  });
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
      await screen.findByRole('treegrid', {
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
      await screen.findByText('Something went wrong: Query error')
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
