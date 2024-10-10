import { useAccount, useAccountEffect } from 'wagmi';
import { useCreateDerivedWallet } from './use-derived-wallet';
import { type QuickStartConnector } from '@vegaprotocol/wallet';
import { useModal } from 'connectkit';
import { type Address } from 'viem';

export const useQuickstart = ({
  connector,
  onSuccess,
}: {
  connector: QuickStartConnector;
  onSuccess: () => void;
}) => {
  const modal = useModal();
  const account = useAccount();
  const mutation = useCreateDerivedWallet(connector, onSuccess);

  // Create the wallet if address is provided otherwise open the
  // connect dialog
  const createWallet = (args: { address?: Address }) => {
    if (args.address) {
      mutation.mutate(args.address);
      return;
    }

    modal.setOpen(true);
  };

  // When the user connects create the wallet
  useAccountEffect({
    onConnect: (data) => mutation.mutate(data.address),
  });

  return {
    ...mutation,
    createWallet: () => createWallet(account),
  };
};
