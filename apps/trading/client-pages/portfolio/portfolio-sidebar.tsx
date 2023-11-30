import { VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { SidebarButton, ViewType } from '../../components/sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';

export const PortfolioSidebar = () => {
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
    </>
  );
};
