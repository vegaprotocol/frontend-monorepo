import { t } from '@vegaprotocol/react-helpers';
import type { Intent } from '@vegaprotocol/ui-toolkit';
import { Dialog } from '@vegaprotocol/ui-toolkit';
import { useCallback, useState } from 'react';
import { DepositContainer } from './deposit-container';

export interface DepositDialogProps {
  assetId?: string;
  depositDialog: boolean;
  setDepositDialog: (open: boolean) => void;
}

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

export const DepositDialog = ({
  assetId,
  depositDialog,
  setDepositDialog,
}: DepositDialogProps) => {
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
      open={depositDialog}
      onChange={setDepositDialog}
      {...dialogStyleProps}
    >
      <DepositContainer
        assetId={assetId}
        setDialogStyleProps={setDialogStyleProps}
      />
    </Dialog>
  );
};
