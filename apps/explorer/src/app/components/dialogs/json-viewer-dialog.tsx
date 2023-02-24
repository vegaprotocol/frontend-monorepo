import { t } from '@vegaprotocol/utils';
import {
  Button,
  Dialog,
  Icon,
  SyntaxHighlighter,
} from '@vegaprotocol/ui-toolkit';

type JsonViewerDialogProps = {
  title: string;
  content: unknown;
  open: boolean;
  onChange: (isOpen: boolean) => void;
  trigger?: HTMLElement;
};
export const JsonViewerDialog = ({
  title,
  content,
  open,
  onChange,
  trigger,
}: JsonViewerDialogProps) => {
  return (
    <Dialog
      size="medium"
      title={title}
      icon={<Icon name="info-sign"></Icon>}
      open={open}
      onChange={(isOpen) => onChange(isOpen)}
      onCloseAutoFocus={(e) => {
        /**
         * This mimics radix's default behaviour that focuses the dialog's
         * trigger after closing itself
         */
        if (trigger) {
          e.preventDefault();
          trigger.focus();
        }
      }}
    >
      <div className="pr-8 mb-8 max-h-[70vh] overflow-y-scroll">
        <SyntaxHighlighter size="smaller" data={content} />
      </div>
      <div className="w-1/4">
        <Button
          data-testid="close-asset-details-dialog"
          fill={true}
          size="sm"
          onClick={() => onChange(false)}
        >
          {t('Close')}
        </Button>
      </div>
    </Dialog>
  );
};
