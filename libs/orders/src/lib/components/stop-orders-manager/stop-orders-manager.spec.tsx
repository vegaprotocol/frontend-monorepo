import { render, screen, act } from '@testing-library/react';
import { StopOrdersManager } from './stop-orders-manager';
import * as useDataProviderHook from '@vegaprotocol/data-provider';
import type { StopOrder } from '../order-data-provider/stop-orders-data-provider';
import * as stopOrdersTableMock from '../stop-orders-table/stop-orders-table';
import { forwardRef } from 'react';
import type { VegaWalletContextShape } from '@vegaprotocol/wallet';
import { VegaWalletContext } from '@vegaprotocol/wallet';
import { MockedProvider } from '@apollo/client/testing';

// @ts-ignore StopOrdersTable is read only but we need to override with the forwardRef to
// avoid warnings about padding refs
stopOrdersTableMock.StopOrdersTable = forwardRef(() => (
  <div>StopOrdersTable</div>
));

const generateJsx = () => {
  const pubKey = '0x123';
  return (
    <MockedProvider>
      <VegaWalletContext.Provider value={{ pubKey } as VegaWalletContextShape}>
        <StopOrdersManager partyId={pubKey} isReadOnly={false} />
      </VegaWalletContext.Provider>
    </MockedProvider>
  );
};

describe('StopOrdersManager', () => {
  it('should render the stop orders table if data provided', async () => {
    jest.spyOn(useDataProviderHook, 'useDataProvider').mockReturnValue({
      data: [{ id: '1' } as StopOrder],
      loading: false,
      error: undefined,
      flush: jest.fn(),
      reload: jest.fn(),
      load: jest.fn(),
    });
    await act(async () => {
      render(generateJsx());
    });
    expect(await screen.findByText('StopOrdersTable')).toBeInTheDocument();
  });
});
