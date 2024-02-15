import { render, screen, act } from '@testing-library/react';
import { StopOrdersManager } from './stop-orders-manager';
import * as useDataProviderHook from '@vegaprotocol/data-provider';
import type { StopOrder } from '../order-data-provider/stop-orders-data-provider';
import { MockedProvider } from '@apollo/client/testing';
import { MockedWalletProvider } from '@vegaprotocol/wallet-react';

jest.mock('../stop-orders-table/stop-orders-table', () => ({
  StopOrdersTable: () => <div>StopOrdersTable</div>,
}));

const generateJsx = () => {
  const pubKey = '0x123';
  return (
    <MockedProvider>
      <MockedWalletProvider store={{ pubKey }}>
        <StopOrdersManager partyId={pubKey} isReadOnly={false} />
      </MockedWalletProvider>
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
      pageInfo: null,
    });
    await act(async () => {
      render(generateJsx());
    });
    expect(await screen.findByText('StopOrdersTable')).toBeInTheDocument();
  });
});
