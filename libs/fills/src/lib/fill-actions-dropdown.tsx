import {
  ActionsDropdown,
  TradingDropdownCopyItem,
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
    <ActionsDropdown data-testid="fill-actions-content">
      <TradingDropdownCopyItem value={tradeId} text={t('Copy trade ID')} />
      <TradingDropdownCopyItem
        value={buyOrderId}
        text={t('Copy buy order ID')}
      />
      <TradingDropdownCopyItem
        value={sellOrderId}
        text={t('Copy sell order ID')}
      />
    </ActionsDropdown>
  );
};
