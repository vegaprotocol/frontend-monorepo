import { t } from '@vegaprotocol/react-helpers';
import type { ButtonVariant } from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';
import { useVegaWallet } from '@vegaprotocol/wallet';

interface Props {
  disabled: boolean;
  variant: ButtonVariant;
}

export const DealTicketButton = ({ disabled, variant }: Props) => {
  const { pubKey, isReadOnly } = useVegaWallet();
  const isDisabled = Boolean(pubKey) && !isReadOnly ? disabled : true;
  return (
    <div className="mb-4">
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
