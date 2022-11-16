import { t } from '@vegaprotocol/react-helpers';
import { ButtonLink, InputError } from '@vegaprotocol/ui-toolkit';
import { useDepositDialog } from '@vegaprotocol/deposits';
interface ZeroBalanceErrorProps {
  asset: {
    id: string;
    symbol: string;
  };
}

export const ZeroBalanceError = ({ asset }: ZeroBalanceErrorProps) => {
  const openDepositDialog = useDepositDialog((state) => state.open);
  return (
    <InputError data-testid="dealticket-error-message-zero-balance">
      <p className="mb-2">
        {t('Insufficient balance. ')}
        <ButtonLink
          data-testid="deal-ticket-deposit-dialog-button"
          onClick={() => openDepositDialog(asset.id)}
        >
          {t(`Deposit ${asset.symbol}`)}
        </ButtonLink>
      </p>
    </InputError>
  );
};
