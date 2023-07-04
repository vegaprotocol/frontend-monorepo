import {
  ActionsDropdown,
  DropdownMenuCopyItem,
} from '@vegaprotocol/ui-toolkit';
import { t } from '@vegaprotocol/i18n';

export const FillActionsDropdown = ({
  tradeId,
  buyOrderId,
  sellOrderId,
}: {
  tradeId: string;
  buyOrderId: string;
  sellOrderId: string;
}) => {
  return (
    <ActionsDropdown data-testid="market-actions-content">
      <DropdownMenuCopyItem value={tradeId} text={t('Copy trade ID')} />
      <DropdownMenuCopyItem value={buyOrderId} text={t('Copy buy order ID')} />
      <DropdownMenuCopyItem
        value={sellOrderId}
        text={t('Copy sell order ID')}
      />
    </ActionsDropdown>
  );
};
