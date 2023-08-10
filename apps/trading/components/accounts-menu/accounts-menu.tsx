import { t } from '@vegaprotocol/i18n';
import { Intent, TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';

export const AccountsMenu = () => {
  const setView = useSidebar((store) => store.setView);

  return (
    <>
      <TradingButton
        intent={Intent.Primary}
        size="extra-small"
        data-testid="open-transfer"
        onClick={() => setView({ type: ViewType.Transfer })}
      >
        {t('Transfer')}
      </TradingButton>
      <TradingButton
        intent={Intent.Primary}
        size="extra-small"
        onClick={() => setView({ type: ViewType.Deposit })}
      >
        {t('Deposit')}
      </TradingButton>
    </>
  );
};
