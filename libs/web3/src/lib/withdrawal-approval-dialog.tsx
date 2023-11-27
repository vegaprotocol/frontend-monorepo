import {
  Button,
  CopyWithTooltip,
  Dialog,
  KeyValueTable,
  KeyValueTableRow,
  Splash,
  SyntaxHighlighter,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { useWithdrawalApprovalQuery } from './__generated__/WithdrawalApproval';
import omit from 'lodash/omit';
import { create } from 'zustand';
import { useT } from './use-t';

type WithdrawalApprovalDialogProps = {
  withdrawalId: string | undefined;
  trigger?: HTMLElement | null;
  open: boolean;
  onChange: (open: boolean) => void;
  asJson?: boolean;
};
export const WithdrawalApprovalDialog = ({
  withdrawalId,
  trigger,
  open,
  onChange,
  asJson,
}: WithdrawalApprovalDialogProps) => {
  const t = useT();
  return (
    <Dialog
      title={t('Save withdrawal details')}
      icon={<VegaIcon name={VegaIconNames.BREAKDOWN} size={16} />}
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
      <div className="pr-8">
        <p>
          {t(
            `If the network is reset or has an outage, records of your withdrawal may be lost. It is recommended that you save these details in a safe place so you can still complete your withdrawal.`
          )}
        </p>
        {withdrawalId ? (
          <WithdrawalApprovalDialogContent
            withdrawalId={withdrawalId}
            asJson={Boolean(asJson)}
          />
        ) : (
          <NoDataContent />
        )}
      </div>
      <div className="w-1/4">
        <Button
          data-testid="close-withdrawal-approval-dialog"
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

type WithdrawalApprovalDialogContentProps = {
  withdrawalId: string;
  asJson: boolean;
};

const NoDataContent = ({ msg }: { msg?: string }) => {
  const t = useT();
  return (
    <div className="py-12" data-testid="splash">
      <Splash>{msg || t('No data')}</Splash>
    </div>
  );
};

const WithdrawalApprovalDialogContent = ({
  withdrawalId,
  asJson,
}: WithdrawalApprovalDialogContentProps) => {
  const t = useT();
  const { data, loading } = useWithdrawalApprovalQuery({
    variables: {
      withdrawalId,
    },
  });

  if (loading) {
    return <NoDataContent msg={t('Loading')} />;
  }

  if (data?.erc20WithdrawalApproval) {
    const details = omit(data.erc20WithdrawalApproval, '__typename');

    if (asJson) {
      return (
        <div className="py-4">
          <SyntaxHighlighter size="smaller" data={details} />
        </div>
      );
    } else {
      return (
        <div className="py-4 flex flex-col">
          <div className="self-end mb-1" data-testid="copy-button">
            <CopyWithTooltip text={JSON.stringify(details, undefined, 2)}>
              <Button
                className="flex gap-1 items-center no-underline"
                size="xs"
                variant="primary"
              >
                <VegaIcon name={VegaIconNames.COPY} size={14} />
                <span className="text-sm no-underline">{t('Copy')}</span>
              </Button>
            </CopyWithTooltip>
          </div>
          <KeyValueTable>
            {Object.entries(details).map(([key, value]) => (
              <KeyValueTableRow key={key}>
                <div data-testid={`${key}_label`}>{key}</div>
                <div data-testid={`${key}_value`} className="break-all">
                  {value}
                </div>
              </KeyValueTableRow>
            ))}
          </KeyValueTable>
        </div>
      );
    }
  }

  return <NoDataContent />;
};

export type WithdrawalApprovalDialogStore = {
  isOpen: boolean;
  id: string;
  trigger: HTMLElement | null | undefined;
  asJson: boolean;
  setOpen: (isOpen: boolean) => void;
  open: (id: string, trigger?: HTMLElement | null, asJson?: boolean) => void;
};

export const useWithdrawalApprovalDialog =
  create<WithdrawalApprovalDialogStore>()((set) => ({
    isOpen: false,
    id: '',
    trigger: null,
    asJson: false,
    setOpen: (isOpen) => {
      set({ isOpen: isOpen });
    },
    open: (id, trigger?, asJson = false) => {
      set({
        isOpen: true,
        id,
        trigger,
        asJson,
      });
    },
  }));

export const WithdrawalApprovalDialogContainer = () => {
  const { isOpen, id, trigger, setOpen, asJson } =
    useWithdrawalApprovalDialog();
  return (
    <WithdrawalApprovalDialog
      withdrawalId={id}
      trigger={trigger || null}
      open={isOpen}
      onChange={setOpen}
      asJson={asJson}
    />
  );
};
