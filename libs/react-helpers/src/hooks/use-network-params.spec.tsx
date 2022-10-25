import { renderHook, waitFor } from '@testing-library/react';
import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing';
import type { NetworkParamsKey } from './use-network-params';
import {
  NetworkParams,
  NETWORK_PARAMETERS_QUERY,
  NETWORK_PARAMETER_QUERY,
  useNetworkParam,
  useNetworkParams,
} from './use-network-params';
import type { ReactNode } from 'react';
import type { NetworkParams as NetworkParamsResponse } from './__generated__/NetworkParams';

describe('useNetworkParam', () => {
  const setup = (arg: NetworkParamsKey) => {
    const mock: MockedResponse = {
      request: {
        query: NETWORK_PARAMETER_QUERY,
        variables: {
          key: arg,
        },
      },
      result: {
        data: {
          networkParameter: {
            __typename: 'NetworkParameter',
            key: 'reward.staking.delegation.payoutDelay',
            value: '200',
          },
        },
      },
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={[mock]}>{children}</MockedProvider>
    );

    return renderHook(() => useNetworkParam(arg), { wrapper });
  };

  it('returns a single param value', async () => {
    const { result } = setup(
      NetworkParams.reward_staking_delegation_payoutDelay
    );
    expect(result.current.param).toBe(null);
    await waitFor(() => {
      expect(result.current.param).toEqual('200');
    });
  });
});

describe('useNetworkParams', () => {
  const setup = (args?: NetworkParamsKey[]) => {
    const mock: MockedResponse<NetworkParamsResponse> = {
      request: {
        query: NETWORK_PARAMETERS_QUERY,
      },
      result: {
        data: {
          networkParameters: [
            {
              __typename: 'NetworkParameter',
              key: 'spam.protection.proposal.min.tokens',
              value: '1',
            },
            {
              __typename: 'NetworkParameter',
              key: 'governance.proposal.updateMarket.minProposerBalance',
              value: '2',
            },
            {
              __typename: 'NetworkParameter',
              key: 'reward.staking.delegation.payoutDelay',
              value: '200',
            },
          ],
        },
      },
    };
    const wrapper = ({ children }: { children: ReactNode }) => (
      <MockedProvider mocks={[mock]}>{children}</MockedProvider>
    );

    return renderHook(() => useNetworkParams(args), { wrapper });
  };
  it('returns an object with only desired params', async () => {
    const { result } = setup([
      NetworkParams.spam_protection_proposal_min_tokens,
      NetworkParams.governance_proposal_updateMarket_minProposerBalance,
    ]);

    expect(result.current.params).toBe(null);

    await waitFor(() => {
      expect(result.current.params).toEqual({
        spam_protection_proposal_min_tokens: '1',
        governance_proposal_updateMarket_minProposerBalance: '2',
      });
    });
  });

  it('returns all params', async () => {
    const { result } = setup();

    expect(result.current.params).toBe(null);

    await waitFor(() => {
      expect(result.current.params).toEqual({
        spam_protection_proposal_min_tokens: '1',
        governance_proposal_updateMarket_minProposerBalance: '2',
        reward_staking_delegation_payoutDelay: '200',
      });
    });
  });
});
