import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';

export const AccountsMenu = () => {
  const currentRouteId = useGetCurrentRouteId();
  const setViews = useSidebar((store) => store.setViews);

  return (
    <>
      <TradingButton
        size="extra-small"
        data-testid="open-transfer"
        onClick={() => setViews({ type: ViewType.Transfer }, currentRouteId)}
      >
        {t('Transfer')}
      </TradingButton>
      <TradingButton
        size="extra-small"
        onClick={() => setViews({ type: ViewType.Deposit }, currentRouteId)}
      >
        {t('Deposit')}
      </TradingButton>
    </>
  );
};
