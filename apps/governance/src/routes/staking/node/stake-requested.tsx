import { Dialog, Intent } from '@vegaprotocol/ui-toolkit';
import { useTranslation } from 'react-i18next';
import React from 'react';

interface StakeRequestedProps {
  isDialogVisible: boolean;
  toggleDialog: () => void;
}

export const StakeRequested = ({
  isDialogVisible,
  toggleDialog,
}: StakeRequestedProps) => {
  const { t } = useTranslation();
  return (
    <Dialog
      title={t('txRequested')}
      intent={Intent.Warning}
      open={isDialogVisible}
      onChange={toggleDialog}
    >
      <p>{t('stakingConfirm')}</p>
    </Dialog>
  );
};
