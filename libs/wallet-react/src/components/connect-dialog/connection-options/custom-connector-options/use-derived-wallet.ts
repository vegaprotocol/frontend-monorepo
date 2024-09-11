import { useQuery } from '@tanstack/react-query';
import { type QuickStartConnector } from '@vegaprotocol/wallet';
import { useConfig } from '../../../../hooks/use-config';
import { useSignTypedData } from 'wagmi';

/**
 * Derives a mnemonic from the user's connected Ethereum wallet
 */
export const useCreateDerivedWallet = (
  chainId: number,
  connector: QuickStartConnector,
  address: string
) => {
  const state = useConfig();
  const { signTypedDataAsync } = useSignTypedData();
  return useQuery({
    enabled: false,
    retryOnMount: false,
    retry: false,
    queryKey: ['ethereum.signTypedData', chainId, address],
    queryFn: async () => {
      try {
        state.store.setState({
          status: 'creating',
        });
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
        return { success: true };
      } catch (error) {
        state.store.setState({
          status: 'disconnected',
        });
        throw error;
      }
    },
  });
};
