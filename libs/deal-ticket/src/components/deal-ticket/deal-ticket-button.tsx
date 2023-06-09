import { t } from '@vegaprotocol/i18n';
import type { ButtonVariant } from '@vegaprotocol/ui-toolkit';
import { Button } from '@vegaprotocol/ui-toolkit';

interface Props {
  variant: ButtonVariant;
}

export const DealTicketButton = ({ variant }: Props) => {
  return (
    <div className="mb-2">
      <Button variant={variant} fill type="submit" data-testid="place-order">
        {t('Place order')}
      </Button>
    </div>
  );
};
