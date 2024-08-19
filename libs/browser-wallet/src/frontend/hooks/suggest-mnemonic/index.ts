import { useCallback, useState } from 'react';

import { useJsonRpcClient } from '@/contexts/json-rpc/json-rpc-context';
import { RpcMethods } from '@/lib/client-rpc-methods';
import { useSignTypedData } from 'wagmi';

export const useDeriveMnemonic = (chainId: number) => {
  const { signTypedDataAsync } = useSignTypedData();
  const { request } = useJsonRpcClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const derivedMnemonic: () => Promise<string> = useCallback(async () => {
    try {
      setLoading(true);
      const res = await signTypedDataAsync({
        domain: { name: 'Vega', chainId: BigInt(chainId) },
        message: { action: 'Vega Onboarding' },
        primaryType: 'Vega',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'chainId', type: 'uint256' },
          ],
          Vega: [{ name: 'action', type: 'string' }],
        },
      });
      const { derivedMnemonic } = await request(
        RpcMethods.CreateDerivedMnemonic,
        {
          signedData: res,
        },
        true
      );
      return derivedMnemonic.join(' ');
    } catch (e) {
      const err = e as Error;
      if ('code' in err && err.code === 4001) {
        setError('User denied message signature');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [chainId, request, signTypedDataAsync]);

  return {
    derivedMnemonic,
    loading,
    error,
  };
};
