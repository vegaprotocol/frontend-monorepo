import {
  ActionsDropdown,
  DropdownMenuCopyItem,
} from '@vegaprotocol/ui-toolkit';
import { useT } from './use-t';

export const FillActionsDropdown = ({
  tradeId,
  buyOrderId,
  sellOrderId,
}: {
  tradeId: string;
  buyOrderId: string;
  sellOrderId: string;
}) => {
  const t = useT();
  return (
    <ActionsDropdown data-testid="fill-actions-content">
      <DropdownMenuCopyItem value={tradeId} text={t('Copy trade ID')} />
      <DropdownMenuCopyItem value={buyOrderId} text={t('Copy buy order ID')} />
      <DropdownMenuCopyItem
        value={sellOrderId}
        text={t('Copy sell order ID')}
      />
    </ActionsDropdown>
  );
};
