import { useMutation } from '@tanstack/react-query';
import { type QuickStartConnector } from '@vegaprotocol/wallet';
import { useConfig } from './use-config';
import { useChainId, useSignTypedData, useSwitchChain } from 'wagmi';

export const ETHEREUM_CHAIN_ID = 1;

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
  const { appName } = useConfig();

  const mutationResult = useMutation({
    retry: false,
    mutationKey: ['ethereum.signTypedData', address],
    mutationFn: async () => {
      try {
        if (!address)
          {throw new Error(
            'Attempted to create a dervided wallet while not connected'
          );}
        state.store.setState({
          status: 'creating',
        });
        if (chainId !== ETHEREUM_CHAIN_ID) {
          await switchChainAsync({
            chainId: ETHEREUM_CHAIN_ID,
          });
        }
        const hasWallet = await connector.hasWallet();
        if (!hasWallet) {
          const signedMessage = await signTypedDataAsync({
            domain: { name: 'Onboarding', chainId: BigInt(ETHEREUM_CHAIN_ID) },
            message: { action: `${appName} Onboarding` },
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
          await connector.importWallet(mnemonicString, address);
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
