import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-path-id';

export const AccountsMenu = () => {
  const currentPathId = useGetCurrentRouteId();
  const setViews = useSidebar((store) => store.setViews);

  return (
    <>
      <TradingButton
        size="extra-small"
        data-testid="open-transfer"
        onClick={() => setViews({ type: ViewType.Transfer }, currentPathId)}
      >
        {t('Transfer')}
      </TradingButton>
      <TradingButton
        size="extra-small"
        onClick={() => setViews({ type: ViewType.Deposit }, currentPathId)}
      >
        {t('Deposit')}
      </TradingButton>
    </>
  );
};
