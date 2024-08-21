import { useEffect } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { useNetwork } from '@/contexts/network/network-context';

import { useAccountsStore } from './accounts-store';

export const useAccounts = (publicKey: string) => {
  const { chainId } = useNetwork();
  const { request } = useJsonRpcClient();
  const { startPoll, stopPoll, reset, fetchParty, accountsByAsset } =
    useAccountsStore((state) => ({
      startPoll: state.startPoll,
      stopPoll: state.stopPoll,
      reset: state.reset,
      fetchParty: state.fetchAccounts,
      accountsByAsset: state.accountsByAsset,
    }));
  useEffect(() => {
    fetchParty(request, publicKey, chainId);
    startPoll(request, publicKey, chainId);
    return () => {
      stopPoll();
      reset();
    };
  }, [fetchParty, chainId, publicKey, request, reset, startPoll, stopPoll]);
  return {
    accountsByAsset,
  };
};
