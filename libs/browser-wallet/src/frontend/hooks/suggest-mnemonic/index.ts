import { useCallback, useEffect, useState } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { getExtensionApi } from '@/lib/extension-apis';

export const SUGGESTED_MNEMONIC_KEY = 'suggested-mnemonic';

/**
 * Clears the mnemonic from memory, should be called after the wallet has been created
 * */
export const clearMnemonic = () => {
  const {
    storage: { session },
  } = getExtensionApi();
  return session.remove(SUGGESTED_MNEMONIC_KEY);
};

/**
 * Suggests a mnemonic to the user and stores it in memory
 * once the user creates the wallet the mnemonic should be cleared from memory
 * using the clear mnemonic function above
 */
export const useSuggestMnemonic = () => {
  const {
    storage: { session },
  } = getExtensionApi();
  const { request } = useJsonRpcClient();
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const suggestMnemonic = useCallback(async () => {
    const response = await request(RpcMethods.GenerateRecoveryPhrase, null);
    const { recoveryPhrase } = response;
    await session.set({
      [SUGGESTED_MNEMONIC_KEY]: recoveryPhrase,
    });
    setMnemonic(recoveryPhrase);
  }, [request, session]);

  const getMnemonic = useCallback(async () => {
    const response = await session.get(SUGGESTED_MNEMONIC_KEY);
    const recoveryPhrase = response[SUGGESTED_MNEMONIC_KEY];
    // If one exists in memory then use it, otherwise generate a new one
    if (recoveryPhrase) {
      setMnemonic(recoveryPhrase);
    } else {
      suggestMnemonic();
    }
  }, [session, suggestMnemonic]);

  useEffect(() => {
    getMnemonic();
  }, [getMnemonic]);

  return {
    mnemonic,
  };
};
