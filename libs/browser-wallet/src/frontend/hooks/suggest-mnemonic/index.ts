import { useCallback, useEffect, useState } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';

/**
 * Suggests a mnemonic to the user and stores it in memory
 * once the user creates the wallet the mnemonic should be cleared from memory
 * using the clear mnemonic function above
 */
export const useSuggestMnemonic = () => {
  const { request } = useJsonRpcClient();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const suggestMnemonic = useCallback(async () => {
    const response = await request(RpcMethods.GenerateRecoveryPhrase, null);
    const { recoveryPhrase } = response;
    setMnemonic(recoveryPhrase);
  }, [request]);

  useEffect(() => {
    suggestMnemonic();
  }, [suggestMnemonic]);

  return {
    mnemonic,
  };
};
