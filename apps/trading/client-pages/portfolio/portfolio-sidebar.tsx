import { VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { SidebarButton, ViewType } from '../../components/sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';
import { MobileButton } from '../markets/mobile-buttons';

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
      <SidebarButton
        view={ViewType.Swap}
        icon={VegaIconNames.SWAP}
        tooltip={t('Swap')}
        routeId={currentRouteId}
      />
    </>
  );
};

export const PortfolioMobileSidebar = () => {
  const t = useT();
  const currentRouteId = useGetCurrentRouteId();

  return (
    <div className="grid grid-cols-3 grow md:grow-0 md:flex lg:flex-col items-center gap-2 lg:gap-4 p-1">
      <MobileButton
        view={ViewType.Deposit}
        tooltip={t('Deposit')}
        routeId={currentRouteId}
      />
      <MobileButton
        view={ViewType.Withdraw}
        tooltip={t('Withdraw')}
        routeId={currentRouteId}
      />
      <MobileButton
        view={ViewType.Transfer}
        tooltip={t('Transfer')}
        routeId={currentRouteId}
      />
      <SidebarButton
        view={ViewType.Swap}
        icon={VegaIconNames.SWAP}
        tooltip={t('Swap')}
        routeId={currentRouteId}
      />
    </div>
  );
};
