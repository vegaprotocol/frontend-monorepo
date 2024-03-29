import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';

export const AccountsMenu = () => {
  const t = useT();
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
