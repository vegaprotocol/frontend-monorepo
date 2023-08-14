import { t } from '@vegaprotocol/i18n';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';

export const DepositsMenu = () => {
  const setView = useSidebar((store) => store.setView);

  return (
    <TradingButton
      intent={Intent.Primary}
      size="extra-small"
      onClick={() => setView({ type: ViewType.Deposit })}
      data-testid="deposit-button"
    >
      {t('Deposit')}
    </TradingButton>
  );
};
