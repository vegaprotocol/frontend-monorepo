import { render, screen, waitFor } from '@testing-library/react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { MockNetworkProvider } from '@/contexts/network/mock-network-provider';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { silenceErrors } from '@/test-helpers/silence-errors';

import { testingNetwork } from '../../../config/well-known-networks';
import { locators } from './team-link';
import { VegaTeam } from './vega-team';

jest.mock('@/contexts/json-rpc/json-rpc-context');

const renderComponent = () => {
  return render(
    <MockNetworkProvider>
      <VegaTeam id={'1'} />
    </MockNetworkProvider>
  );
};

describe('VegaTeam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should show the team id while loading and team name when loading is completed', async () => {
    const mockRequest = jest.fn();
    mockRequest.mockReturnValue(
      new Promise((resolve) =>
        resolve({ teams: { edges: [{ node: { name: 'test' } }] } })
      )
    );
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: mockRequest,
    });
    renderComponent();
    expect(mockRequest).toHaveBeenCalledWith(
      RpcMethods.Fetch,
      { networkId: testingNetwork.chainId, path: 'api/v2/teams?teamId=1' },
      true
    );
    expect(screen.getByTestId(locators.teamLink)).toHaveTextContent('1');
    await waitFor(() =>
      expect(screen.getByTestId(locators.teamLink)).toHaveTextContent('test')
    );
  });
  it('should show the id if there is an error', async () => {
    silenceErrors();
    const mockRequest = jest.fn();
    mockRequest.mockReturnValue(
      new Promise((resolve, reject) => reject(new Error('test error')))
    );
    (useJsonRpcClient as unknown as jest.Mock).mockReturnValue({
      request: mockRequest,
    });
    renderComponent();
    expect(screen.getByTestId(locators.teamLink)).toHaveTextContent('1');
    await waitFor(() =>
      expect(screen.getByTestId(locators.teamLink)).toHaveTextContent('1')
    );
  });
});
