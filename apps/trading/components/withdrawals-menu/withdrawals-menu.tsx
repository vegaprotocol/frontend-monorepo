import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';

export const WithdrawalsMenu = () => {
  const setView = useSidebar((store) => store.setView);

  return (
    <TradingButton
      size="extra-small"
      onClick={() => setView({ type: ViewType.Withdraw })}
      data-testid="withdraw-dialog-button"
    >
      {t('Make withdrawal')}
    </TradingButton>
  );
};
