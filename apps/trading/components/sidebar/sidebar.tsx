import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { create } from 'zustand';
import { TransferContainer } from '@vegaprotocol/accounts';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { DepositContainer } from '@vegaprotocol/deposits';
import { t } from '@vegaprotocol/i18n';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { TinyScroll, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { NodeHealthContainer } from '../node-health';
import { Settings } from '../settings';
import { Tooltip } from '../../components/tooltip';
import { WithdrawContainer } from '../withdraw-container';
import { Routes as AppRoutes } from '../../pages/client-router';
import { persist } from 'zustand/middleware';
import { GetStarted } from '../welcome-dialog';
import { useVegaWallet, useViewAsDialog } from '@vegaprotocol/wallet';

const STORAGE_KEY = 'vega_sidebar_store';

export enum ViewType {
  Order = 'Order',
  Info = 'Info',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer',
  Settings = 'Settings',
  ViewAs = 'ViewAs',
}

type SidebarView =
  | {
      type: ViewType.Deposit;
      assetId?: string;
    }
  | {
      type: ViewType.Withdraw;
      assetId?: string;
    }
  | {
      type: ViewType.Transfer;
      assetId?: string;
    }
  | {
      type: ViewType.Order;
    }
  | {
      type: ViewType.Info;
    }
  | {
      type: ViewType.Settings;
    };

export const Sidebar = () => {
  const navClasses = 'flex lg:flex-col items-center gap-2 lg:gap-4 p-1';
  const setViewAsDialogOpen = useViewAsDialog((state) => state.setOpen);
  const { pubKeys } = useVegaWallet();
  return (
    <div className="flex lg:flex-col gap-2 h-full p-1" data-testid="sidebar">
      <nav className={navClasses}>
        {/* sidebar options that always show */}
        <SidebarButton
          view={ViewType.Deposit}
          icon={VegaIconNames.DEPOSIT}
          tooltip={t('Deposit')}
        />
        <SidebarButton
          view={ViewType.Withdraw}
          icon={VegaIconNames.WITHDRAW}
          tooltip={t('Withdraw')}
        />
        <SidebarButton
          view={ViewType.Transfer}
          icon={VegaIconNames.TRANSFER}
          tooltip={t('Transfer')}
        />
        {/* buttons for specific routes */}
        <Routes>
          <Route
            path={AppRoutes.MARKETS}
            // render nothing for markets/all, otherwise markets/:marketId will match with markets/all
            element={null}
          />
          <Route
            // render nothing for portfolio
            path={AppRoutes.PORTFOLIO}
            element={null}
          />
          <Route
            path={AppRoutes.MARKET}
            element={
              <>
                <SidebarDivider />
                <SidebarButton
                  view={ViewType.Order}
                  icon={VegaIconNames.TICKET}
                  tooltip={t('Order')}
                />
                <SidebarButton
                  view={ViewType.Info}
                  icon={VegaIconNames.BREAKDOWN}
                  tooltip={t('Market specification')}
                />
              </>
            }
          />
        </Routes>
      </nav>
      <nav className={classNames(navClasses, 'ml-auto lg:mt-auto lg:ml-0')}>
        <SidebarButton
          view={ViewType.ViewAs}
          onClick={() => {
            setViewAsDialogOpen(true);
          }}
          icon={VegaIconNames.EYE}
          tooltip={t('View as party')}
          disabled={Boolean(pubKeys)}
        />

        <SidebarButton
          view={ViewType.Settings}
          icon={VegaIconNames.COG}
          tooltip={t('Settings')}
        />
        <NodeHealthContainer />
      </nav>
    </div>
  );
};

export const SidebarButton = ({
  view,
  icon,
  tooltip,
  disabled = false,
  onClick,
}: {
  view?: ViewType;
  icon: VegaIconNames;
  tooltip: string;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  const { currView, setView } = useSidebar((store) => ({
    currView: store.view,
    setView: store.setView,
  }));

  const onSelect = (view: SidebarView['type']) => {
    if (view === currView?.type) {
      setView(null);
    } else {
      setView({ type: view });
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
    <Tooltip
      description={tooltip}
      align="center"
      side="right"
      sideOffset={10}
      delayDuration={0}
    >
      <button
        className={buttonClasses}
        data-testid={view}
        onClick={onClick || (() => onSelect(view as SidebarView['type']))}
        disabled={disabled}
      >
        <VegaIcon name={icon} size={20} />
      </button>
    </Tooltip>
  );
};

const SidebarDivider = () => {
  return (
    <div
      className="bg-vega-clight-600 dark:bg-vega-cdark-600 w-px h-4 lg:w-4 lg:h-px"
      role="separator"
    />
  );
};

export const SidebarContent = () => {
  const params = useParams();
  const { view, setView } = useSidebar();

  if (!view) return null;

  if (view.type === ViewType.Order) {
    if (params.marketId) {
      return (
        <ContentWrapper>
          <DealTicketContainer
            marketId={params.marketId}
            onDeposit={(assetId) =>
              setView({ type: ViewType.Deposit, assetId })
            }
          />
          <GetStarted />
        </ContentWrapper>
      );
    } else {
      return <CloseSidebar />;
    }
  }

  if (view.type === ViewType.Info) {
    if (params.marketId) {
      return (
        <ContentWrapper>
          <MarketInfoAccordionContainer marketId={params.marketId} />
        </ContentWrapper>
      );
    } else {
      return <CloseSidebar />;
    }
  }

  if (view.type === ViewType.Deposit) {
    return (
      <ContentWrapper title={t('Deposit')}>
        <DepositContainer assetId={view.assetId} />
        <GetStarted />
      </ContentWrapper>
    );
  }

  if (view.type === ViewType.Withdraw) {
    return (
      <ContentWrapper title={t('Withdraw')}>
        <WithdrawContainer assetId={view.assetId} />
        <GetStarted />
      </ContentWrapper>
    );
  }

  if (view.type === ViewType.Transfer) {
    return (
      <ContentWrapper title={t('Transfer')}>
        <TransferContainer assetId={view.assetId} />
        <GetStarted />
      </ContentWrapper>
    );
  }

  if (view.type === ViewType.Settings) {
    return (
      <ContentWrapper title={t('Settings')}>
        <Settings />
      </ContentWrapper>
    );
  }

  throw new Error('invalid sidebar');
};

const ContentWrapper = ({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) => {
  return (
    <TinyScroll
      className="h-full overflow-auto py-4 pl-3 pr-4"
      // panes have p-1, since sidebar is on the right make pl less to account for additional pane space
      data-testid="sidebar-content"
    >
      {title && <h2 className="mb-4">{title}</h2>}
      {children}
    </TinyScroll>
  );
};

/** If rendered will close sidebar */
const CloseSidebar = () => {
  const setView = useSidebar((store) => store.setView);
  useEffect(() => {
    setView(null);
  }, [setView]);
  return null;
};

export const useSidebar = create<{
  init: boolean;
  view: SidebarView | null;
  setView: (view: SidebarView | null) => void;
}>()(
  persist(
    (set) => ({
      init: true,
      view: null,
      setView: (x) =>
        set(() => {
          if (x == null) {
            return { view: null, init: false };
          }

          return { view: x, init: false };
        }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
