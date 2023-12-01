import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';

export const DepositsMenu = () => {
  const t = useT();
  const currentRouteId = useGetCurrentRouteId();
  const setViews = useSidebar((store) => store.setViews);

  return (
    <TradingButton
      size="extra-small"
      onClick={() => setViews({ type: ViewType.Deposit }, currentRouteId)}
      data-testid="deposit-button"
    >
      {t('Deposit')}
    </TradingButton>
  );
};
