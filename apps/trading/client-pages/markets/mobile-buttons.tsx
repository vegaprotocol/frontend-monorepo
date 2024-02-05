import { Route, Routes } from 'react-router-dom';
import {
  Intent,
  MobileActionsDropdown,
  Tooltip,
  TradingButton,
  TradingDropdownItem,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { type BarView, ViewType, useSidebar } from '../../components/sidebar';
import { useGetCurrentRouteId } from '../../lib/hooks/use-get-current-route-id';
import { useT } from '../../lib/use-t';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import { useEffect } from 'react';
import classNames from 'classnames';
import { useVegaWallet, useVegaWalletDialogStore } from '@vegaprotocol/wallet';

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

export const MarketsMobileSidebar = () => {
  const t = useT();
  const currentRouteId = useGetCurrentRouteId();
  const { pubKeys, isReadOnly } = useVegaWallet();
  const openVegaWalletDialog = useVegaWalletDialogStore(
    (store) => store.openVegaWalletDialog
  );

  return (
    <Routes>
      <Route
        path=":marketId"
        element={
          <>
            <ViewInitializer />
            {!pubKeys || isReadOnly ? (
              <>
                <TradingButton
                  intent={Intent.Primary}
                  size="medium"
                  onClick={() => {
                    // onClick?.();
                    openVegaWalletDialog();
                  }}
                >
                  {t('Connect')}
                </TradingButton>
                <MobileButton
                  view={ViewType.Order}
                  tooltip={t('Trade')}
                  routeId={currentRouteId}
                />
                <MobileBarActionsDropdown currentRouteId={currentRouteId} />
              </>
            ) : (
              <>
                <MobileButton
                  view={ViewType.Order}
                  tooltip={t('Trade')}
                  routeId={currentRouteId}
                />
                <MobileButton
                  view={ViewType.Deposit}
                  tooltip={t('Deposit')}
                  routeId={currentRouteId}
                />
                <MobileBarActionsDropdown currentRouteId={currentRouteId} />
              </>
            )}
          </>
        }
      />
    </Routes>
  );
};

export const MobileButton = ({
  view,
  tooltip: label,
  disabled = false,
  onClick,
  routeId,
}: {
  view?: ViewType;
  tooltip: string;
  disabled?: boolean;
  onClick?: () => void;
  routeId: string;
}) => {
  const { setViews, getView } = useSidebar((store) => ({
    setViews: store.setViews,
    getView: store.getView,
  }));
  const currView = getView(routeId);
  const onSelect = (view: BarView['type']) => {
    if (view === currView?.type) {
      setViews(null, routeId);
    } else {
      setViews({ type: view }, routeId);
    }
  };

  const buttonClasses = classNames(
    'flex items-center p-1 rounded',
    'disabled:cursor-not-allowed disabled:text-vega-clight-500 dark:disabled:text-vega-cdark-500',
    {
      'text-vega-clight-200 dark:text-vega-cdark-200 enabled:hover:bg-vega-clight-500 dark:enabled:hover:bg-vega-cdark-500':
        !view || view !== currView?.type,
      'bg-vega-yellow enabled:hover:bg-vega-yellow-550 text-black':
        view && view === currView?.type,
    }
  );

  return (
    <Tooltip description={label} align="center" side="right" sideOffset={10}>
      <TradingButton
        className={buttonClasses}
        data-testid={view}
        onClick={onClick || (() => onSelect(view as BarView['type']))}
        disabled={disabled}
      >
        {label}
      </TradingButton>
    </Tooltip>
  );
};

export const MobileDropdownItem = ({
  view,
  icon,
  tooltip,
  disabled = false,
  onClick,
  routeId,
}: {
  view?: ViewType;
  icon: VegaIconNames;
  tooltip: string;
  disabled?: boolean;
  onClick?: () => void;
  routeId: string;
}) => {
  const { setViews, getView } = useSidebar((store) => ({
    setViews: store.setViews,
    getView: store.getView,
  }));
  const currView = getView(routeId);
  const onSelect = (view: BarView['type']) => {
    if (view === currView?.type) {
      setViews(null, routeId);
    } else {
      setViews({ type: view }, routeId);
    }
  };

  const buttonClasses = classNames(
    'flex items-center p-1 rounded',
    'disabled:cursor-not-allowed disabled:text-vega-clight-500 dark:disabled:text-vega-cdark-500',
    {
      'text-vega-clight-200 dark:text-vega-cdark-200 enabled:hover:bg-vega-clight-500 dark:enabled:hover:bg-vega-cdark-500':
        !view || view !== currView?.type,
      'bg-vega-yellow enabled:hover:bg-vega-yellow-550 text-black':
        view && view === currView?.type,
    }
  );

  return (
    <Tooltip description={tooltip} align="center" side="right" sideOffset={10}>
      <TradingDropdownItem
        className={buttonClasses}
        data-testid={view}
        onClick={onClick || (() => onSelect(view as BarView['type']))}
        disabled={disabled}
      >
        <VegaIcon name={icon} size={20} />
        {tooltip}
      </TradingDropdownItem>
    </Tooltip>
  );
};

export const MobileBarActionsDropdown = ({
  currentRouteId,
}: {
  currentRouteId: string;
}) => {
  const t = useT();
  return (
    <MobileActionsDropdown>
      <MobileDropdownItem
        view={ViewType.Deposit}
        icon={VegaIconNames.DEPOSIT}
        tooltip={t('Deposit')}
        routeId={currentRouteId}
      />
      <MobileDropdownItem
        view={ViewType.Withdraw}
        icon={VegaIconNames.WITHDRAW}
        tooltip={t('Withdraw')}
        routeId={currentRouteId}
      />
      <MobileDropdownItem
        view={ViewType.Transfer}
        icon={VegaIconNames.TRANSFER}
        tooltip={t('Transfer')}
        routeId={currentRouteId}
      />
      <MobileDropdownItem
        view={ViewType.Info}
        icon={VegaIconNames.BREAKDOWN}
        tooltip={t('Market specification')}
        routeId={currentRouteId}
      />
      <MobileDropdownItem
        view={ViewType.Settings}
        icon={VegaIconNames.COG}
        tooltip={t('Settings')}
        routeId={currentRouteId}
      />
    </MobileActionsDropdown>
  );
};
