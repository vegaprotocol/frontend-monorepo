import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';

export const WithdrawalsMenu = () => {
  const t = useT();
  const setViews = useSidebar((store) => store.setViews);
  const currentRouteId = useGetCurrentRouteId();
  return (
    <TradingButton
      size="extra-small"
      onClick={() => setViews({ type: ViewType.Withdraw }, currentRouteId)}
      data-testid="withdraw-dialog-button"
    >
      {t('Make withdrawal')}
    </TradingButton>
  );
};
