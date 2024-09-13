import { useAccount, useAccountEffect, useChainId } from 'wagmi';
import { useCreateDerivedWallet } from './use-derived-wallet';
import { type QuickStartConnector } from '@vegaprotocol/wallet';
import { useModal } from 'connectkit';
import { type Address } from 'viem';
import { useRef } from 'react';

export const useQuickstart = ({
  connector,
  onSuccess,
}: {
  connector: QuickStartConnector;
  onSuccess: () => void;
}) => {
  const awaitingWallet = useRef(false);
  const chainId = useChainId();
  const modal = useModal();
  const account = useAccount();
  const mutationResult = useCreateDerivedWallet(
    connector,
    chainId,
    onSuccess,
    account.address
  );

  const createWallet = (args: { address?: Address }) => {
    if (!args.address) {
      awaitingWallet.current = true;
      modal.setOpen(true);
      return;
    }

    mutationResult.mutate();
  };

  useAccountEffect({
    onConnect: (data) => {
      if (awaitingWallet.current) {
        createWallet(data);
      }
    },
  });

  return {
    ...mutationResult,
    createWallet: () => createWallet(account),
  };
};
