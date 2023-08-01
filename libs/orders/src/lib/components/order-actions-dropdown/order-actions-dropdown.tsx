import {
  ActionsDropdown,
  TradingDropdownCopyItem,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

export const OrderActionsDropdown = ({ id }: { id: string }) => {
  return (
    <ActionsDropdown data-testid="order-actions-content">
      <TradingDropdownCopyItem value={id} text={t('Copy order ID')} />
    </ActionsDropdown>
  );
};
