import { t } from '@vegaprotocol/i18n';
import { TradingButton } from '@vegaprotocol/ui-toolkit';
import { ViewType, useSidebar } from '../sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-path-id';

export const DepositsMenu = () => {
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
