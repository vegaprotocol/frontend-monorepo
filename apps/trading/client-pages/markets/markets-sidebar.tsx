import { Route, Routes } from 'react-router-dom';
import { VegaIconNames } from '@vegaprotocol/ui-toolkit';
import {
  SidebarButton,
  SidebarDivider,
  ViewType,
  useSidebar,
} from '../../components/sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';

const ViewInitializer = () => {
  const currentRouteId = useGetCurrentRouteId();
  const { setViews, getView } = useSidebar();
  const view = getView(currentRouteId);
  const { screenSize } = useScreenDimensions();
  const largeScreen = ['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize);
  useEffect(() => {
    if (largeScreen && view === undefined) {
      setViews({ type: ViewType.Order }, currentRouteId);
    }
  }, [setViews, view, currentRouteId, largeScreen]);
  return null;
};

export const MarketsSidebar = () => {
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
      <Routes>
        <Route
          path=":marketId"
          element={
            <>
              <ViewInitializer />
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
          }
        />
      </Routes>
    </>
  );
};
