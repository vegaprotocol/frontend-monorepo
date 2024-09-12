import { useMutation } from '@tanstack/react-query';
import { type QuickStartConnector } from '@vegaprotocol/wallet';
import { useConfig } from './use-config';
import { useSignTypedData } from 'wagmi';

/**
 * Derives a mnemonic from the user's connected Ethereum wallet
 */
export const useCreateDerivedWallet = (
  connector: QuickStartConnector,
  chainId: number,
  onSuccess: () => void,
  address?: string
) => {
  const state = useConfig();
  const { signTypedDataAsync } = useSignTypedData();
  const mutationResult = useMutation({
    retry: false,
    mutationKey: ['ethereum.signTypedData', chainId, address],
    mutationFn: async () => {
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
    onSuccess,
  });

  return mutationResult;
};
