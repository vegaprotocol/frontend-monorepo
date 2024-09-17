import { useMutation } from '@tanstack/react-query';
import { type QuickStartConnector } from '@vegaprotocol/wallet';
import { useConfig } from './use-config';
import { useChainId, useSignTypedData, useSwitchChain } from 'wagmi';
import { ARBITRUM_CHAIN_ID } from '@vegaprotocol/web3';

/**
 * Derives a mnemonic from the user's connected Ethereum wallet
 */
export const useCreateDerivedWallet = (
  connector: QuickStartConnector,
  onSuccess: () => void,
  address?: string
) => {
  const state = useConfig();
  const { signTypedDataAsync } = useSignTypedData();
  const { switchChainAsync } = useSwitchChain();
  const chainId = useChainId();

  const mutationResult = useMutation({
    retry: false,
    mutationKey: ['ethereum.signTypedData', address],
    mutationFn: async () => {
      try {
        state.store.setState({
          status: 'creating',
        });
        if (chainId !== ARBITRUM_CHAIN_ID) {
          await switchChainAsync({
            chainId: ARBITRUM_CHAIN_ID,
          });
        }
        const hasWallet = await connector.hasWallet();
        if (!hasWallet) {
          const signedMessage = await signTypedDataAsync({
            domain: { name: 'Onboarding', chainId: BigInt(ARBITRUM_CHAIN_ID) },
            message: { action: 'Onboarding' },
            primaryType: 'Onboarding',
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'chainId', type: 'uint256' },
              ],
              Onboarding: [{ name: 'action', type: 'string' }],
            },
          });
          const mnemonic = (await connector.deriveMnemonic(
            signedMessage
          )) as unknown as string[];
          const mnemonicString = mnemonic.join(' ');
          await connector.importWallet(mnemonicString);
        }
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
