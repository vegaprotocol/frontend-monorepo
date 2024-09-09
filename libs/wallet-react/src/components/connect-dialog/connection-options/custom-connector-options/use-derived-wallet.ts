import { useQuery } from '@tanstack/react-query';
import { type QuickStartConnector } from '@vegaprotocol/wallet';
import { useSignTypedData } from 'wagmi';

/**
 * Derives a mnemonic from the user's connected Ethereum wallet
 */
export const useCreateDerivedWallet = (
  chainId: number,
  connector: QuickStartConnector,
  address: string,
  executeImmediately: boolean
) => {
  const { signTypedDataAsync } = useSignTypedData();
  return useQuery({
    enabled: executeImmediately,
    retryOnMount: false,
    retry: false,
    queryKey: ['ethereum.signTypedData', chainId, address],
    queryFn: async () => {
      try {
        const signedMessage = await signTypedDataAsync({
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
        const mnemonic = (await connector.deriveMnemonic(
          signedMessage
        )) as unknown as string[];
        const mnemonicString = mnemonic.join(' ');
        await connector.importWallet(mnemonicString);
      } catch (e) {
        const err = e as Error;
        if ('code' in err && err.code === 4001) {
          throw new Error('User denied message signature');
        }
        throw e;
      }
    },
  });
};
