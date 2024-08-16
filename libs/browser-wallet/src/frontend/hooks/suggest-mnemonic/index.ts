import { useCallback, useEffect, useState } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';

const SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4';

export const useDerivedMnemonic = (account: `0x${string}`, chainId: number) => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const { request } = useJsonRpcClient();

  useEffect(() => {
    const run = async () => {
      const params = {
        domain: { name: 'Vega', chainId },
        message: { action: 'Vega Onboarding' },
        primaryType: 'Vega',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'chainId', type: 'uint256' },
          ],
          Vega: [{ name: 'action', type: 'string' }],
        },
      };
      const res = await window.ethereum.request({
        method: SIGN_TYPED_DATA_V4,
        params: [account, JSON.stringify(params)],
      });
      // TODO if res is not successful then throw an error
      console.log(res);
      // TODO take the value of the signed message and pass it to the backend
      const { derivedMnemonic } = await request(
        RpcMethods.CreateDerivedMnemonic,
        {
          signedData: res,
        }
      );
      console.log(derivedMnemonic);
      setMnemonic(derivedMnemonic);
    };
    run();
  }, [account, chainId, request]);

  return {
    mnemonic,
  };
};

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
