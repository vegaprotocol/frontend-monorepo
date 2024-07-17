import { TradingDialog } from '@vegaprotocol/ui-toolkit';
import { type ReactNode, useEffect } from 'react';

type TransactionDialogProps = {
  open: boolean;
  setOpen?: (open: boolean) => void;
  title: NonNullable<ReactNode>;
  description?: ReactNode;
};

export const TransactionDialog = ({
  open,
  setOpen,
  title,
  description,
}: TransactionDialogProps) => {
  useEffect(() => {
    if (!open) return;

    // sending tx
  }, [open]);

  return (
    <TradingDialog
      title={title}
      open={open}
      onOpenChange={(isOpen) => {
        setOpen?.(isOpen);
      }}
      description={description}
    >
      BLAH BLAH BLAH
    </TradingDialog>
  );
};
