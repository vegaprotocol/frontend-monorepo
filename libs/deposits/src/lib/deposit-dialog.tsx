import create from 'zustand';
import { t } from '@vegaprotocol/react-helpers';
import type { Intent } from '@vegaprotocol/ui-toolkit';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useCallback, useState } from 'react';
import { DepositContainer } from './deposit-container';
import { useWeb3ConnectDialog } from '@vegaprotocol/web3';

interface State {
  isOpen: boolean;
  assetId?: string;
}

interface Actions {
  open: (assetId?: string) => void;
  close: () => void;
}

export const useDepositDialog = create<State & Actions>((set) => ({
  isOpen: false,
  assetId: undefined,
  open: (assetId) => set(() => ({ assetId, isOpen: true })),
  close: () => set(() => ({ assetId: undefined, isOpen: false })),
}));

export type DepositDialogStyleProps = {
  title: string;
  icon?: JSX.Element;
  intent?: Intent;
};

export type DepositDialogStylePropsSetter = (
  props?: DepositDialogStyleProps
) => void;

const DEFAULT_STYLE: DepositDialogStyleProps = {
  title: t('Deposit'),
  intent: undefined,
  icon: undefined,
};

export const DepositDialog = () => {
  const { assetId, isOpen, open, close } = useDepositDialog();
  const connectWalletDialogIsOpen = useWeb3ConnectDialog(
    (state) => state.isOpen
  );
  const [dialogStyleProps, _setDialogStyleProps] = useState(DEFAULT_STYLE);
  const setDialogStyleProps: DepositDialogStylePropsSetter =
    useCallback<DepositDialogStylePropsSetter>(
      (props) =>
        props
          ? _setDialogStyleProps(props)
          : _setDialogStyleProps(DEFAULT_STYLE),
      [_setDialogStyleProps]
    );
  return (
    <Dialog
      open={isOpen && !connectWalletDialogIsOpen}
      onChange={(isOpen) => (isOpen ? open() : close())}
      {...dialogStyleProps}
    >
      <DepositContainer
        assetId={assetId}
        setDialogStyleProps={setDialogStyleProps}
      />
    </Dialog>
  );
};
