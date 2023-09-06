import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';

export const DepositsMenu = () => {
  const setView = useSidebar((store) => store.setView);

  return (
    <TradingButton
      size="extra-small"
      onClick={() => setView({ type: ViewType.Deposit })}
      data-testid="deposit-button"
    >
      {t('Deposit')}
    </TradingButton>
  );
};
