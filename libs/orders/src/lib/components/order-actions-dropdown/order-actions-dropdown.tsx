import {
  ActionsDropdown,
  DropdownMenuCopyItem,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

export const OrderActionsDropdown = ({ id }: { id: string }) => {
  return (
    <ActionsDropdown data-testid="market-actions-content">
      <DropdownMenuCopyItem value={id} text={t('Copy order ID')} />
    </ActionsDropdown>
  );
};
