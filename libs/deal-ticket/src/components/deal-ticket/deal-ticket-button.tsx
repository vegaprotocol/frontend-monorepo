import { t } from '@vegaprotocol/i18n';
import type { ButtonVariant } from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';

interface Props {
  disabled: boolean;
  variant: ButtonVariant;
}

export const DealTicketButton = ({ disabled, variant }: Props) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const isDisabled = !pubKey || isReadOnly || disabled;
  return (
    <div className="mb-2">
      <Button
        variant={variant}
        fill
        type="submit"
        disabled={isDisabled}
        data-testid="place-order"
      >
        {t('Place order')}
      </Button>
    </div>
  );
};
