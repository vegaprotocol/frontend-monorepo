import { VegaIconNames } from '@vegaprotocol/ui-toolkit';
import {
  SidebarButton,
  SidebarDivider,
  ViewType,
} from '../../components/sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';

export const LiquiditySidebar = () => {
  const t = useT();
  const currentRouteId = useGetCurrentRouteId();

  return (
    <>
      <SidebarButton
        view={ViewType.Deposit}
        icon={VegaIconNames.DEPOSIT}
        tooltip={t('Deposit')}
        routeId={currentRouteId}
      />
      <SidebarButton
        view={ViewType.Withdraw}
        icon={VegaIconNames.WITHDRAW}
        tooltip={t('Withdraw')}
        routeId={currentRouteId}
      />
      <SidebarButton
        view={ViewType.Transfer}
        icon={VegaIconNames.TRANSFER}
        tooltip={t('Transfer')}
        routeId={currentRouteId}
      />
      <SidebarDivider />
      <SidebarButton
        view={ViewType.Order}
        icon={VegaIconNames.TICKET}
        tooltip={t('Order')}
        routeId={currentRouteId}
      />
      <SidebarButton
        view={ViewType.Info}
        icon={VegaIconNames.BREAKDOWN}
        tooltip={t('Market specification')}
        routeId={currentRouteId}
      />
    </>
  );
};
