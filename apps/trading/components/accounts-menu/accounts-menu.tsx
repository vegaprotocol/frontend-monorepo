import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';

export const AccountsMenu = () => {
  const setView = useSidebar((store) => store.setView);

  return (
    <>
      <TradingButton
        size="extra-small"
        data-testid="open-transfer"
        onClick={() => setView({ type: ViewType.Transfer })}
      >
        {t('Transfer')}
      </TradingButton>
      <TradingButton
        size="extra-small"
        onClick={() => setView({ type: ViewType.Deposit })}
      >
        {t('Deposit')}
      </TradingButton>
    </>
  );
};
