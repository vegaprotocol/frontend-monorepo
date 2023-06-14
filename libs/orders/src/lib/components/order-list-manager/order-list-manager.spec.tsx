import { render, screen, act } from '@testing-library/react';
import { OrderListManager } from './order-list-manager';
import * as useDataProviderHook from '@vegaprotocol/data-provider';
import type { OrderFieldsFragment } from '../';
import * as orderListMock from '../order-list/order-list';
import { forwardRef } from 'react';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';

// @ts-ignore OrderList is read only but we need to override with the forwardRef to
// avoid warnings about padding refs
orderListMock.OrderListTable = forwardRef(() => <div>OrderList</div>);

const generateJsx = () => {
  const pubKey = '0x123';
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={{ pubKey } as VegaWalletContextShape}>
        <OrderListManager partyId={pubKey} isReadOnly={false} />
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
    });
    await act(async () => {
      render(generateJsx());
    });
    expect(await screen.findByText('OrderList')).toBeInTheDocument();
  });
});
