import { EXPLORER_URL } from '@/env';
import { type Result, TxStatus } from '@/lib/hooks/use-tx';
import { type TKey, t } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { Badge, type BadgeProps } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';
import { Progress } from '../ui/progress';

type TxDialogProps = {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  txStatus: TxStatus;
  result?: Result;
  error?: string;
};

export const TxDialog = ({
  title,
  open,
  onOpenChange,
  txStatus,
  result,
  error,
}: TxDialogProps) => {
  let progress = 0;
  switch (txStatus) {
    case TxStatus.Idle:
      progress = 0;
      break;
    case TxStatus.Rejected:
    case TxStatus.Requested:
      progress = 25;
      break;
    case TxStatus.Pending:
      progress = 50;
      break;
    case TxStatus.Failed:
      progress = 75;
      break;
    case TxStatus.Confirmed:
      progress = 100;
      break;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{t('TX_DIALOG_DESCRIPTION')}</DialogDescription>
        <div className="flex flex-col gap-1 text-base">
          <Progress value={progress} />
          <div className="flex items-baseline justify-between">
            <div>
              {t('TX_DIALOG_CURRENT_STATUS')}:{' '}
              <StatusPill txStatus={txStatus} />
            </div>
            {result?.txHash && (
              <div className="text-xs">
                <a
                  className="inline-flex items-center gap-1 hover:underline"
                  href={`${EXPLORER_URL}/txs/${result.txHash}`}
                >
                  {t('LINK_VIEW_ON_EXPLORER')} <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
          <div className="text-destructive-foreground text-sm">{error}</div>
        </div>
        <Button variant="secondary" onClick={() => onOpenChange(false)}>
          {t('TX_DIALOG_DISMISS')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const StatusPill = ({ txStatus }: { txStatus: TxStatus }) => {
  let variant: BadgeProps['variant'] = 'outline';
  switch (txStatus) {
    case TxStatus.Pending:
    case TxStatus.Requested:
      variant = 'secondary';
      break;
    case TxStatus.Confirmed:
      variant = 'default';
      break;
    case TxStatus.Rejected:
    case TxStatus.Failed:
      variant = 'destructive';
      break;
  }
  return <Badge variant={variant}>{t(`TX_STATUS_${txStatus}` as TKey)}</Badge>;
};
