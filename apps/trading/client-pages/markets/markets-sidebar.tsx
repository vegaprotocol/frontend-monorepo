import { Route, Routes, useParams } from 'react-router-dom';
import { MarketState } from '@vegaprotocol/types';
import { useMarket } from '@vegaprotocol/markets';
import { VegaIconNames } from '@vegaprotocol/ui-toolkit';
import {
  SidebarButton,
  SidebarDivider,
  ViewType,
} from '../../components/sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';

export const MarketsSidebar = () => {
  const t = useT();
  const { marketId } = useParams();
  const currentRouteId = useGetCurrentRouteId();
  const { data } = useMarket(marketId);
  const active =
    data &&
    [MarketState.STATE_ACTIVE, MarketState.STATE_PENDING].includes(data.state);

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
              <SidebarDivider />
              {active && (
                <SidebarButton
                  view={ViewType.Order}
                  icon={VegaIconNames.TICKET}
                  tooltip={t('Order')}
                  routeId={currentRouteId}
                />
              )}
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
