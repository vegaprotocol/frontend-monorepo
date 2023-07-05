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
import { VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { NodeHealthContainer } from '../node-health';
import { Settings } from '../settings';
import { Tooltip } from '../../components/tooltip';
import { WithdrawContainer } from '../withdraw-container';
import { Routes as AppRoutes } from '../../pages/client-router';

export enum ViewType {
  Order = 'Order',
  Info = 'Info',
  Deposit = 'Deposit',
  Withdraw = 'Withdraw',
  Transfer = 'Transfer',
  Settings = 'Settings',
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
  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="h-12 flex justify-center items-center border-b border-default">
        <SidebarButton
          view={ViewType.Settings}
          icon={VegaIconNames.COG}
          tooltip={t('Settings')}
        />
      </div>
      <nav className="flex flex-col items-stretch gap-2 p-1">
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
      <nav className="mt-auto flex flex-col items-stretch gap-2 p-1">
        <NodeHealthContainer />
      </nav>
    </div>
  );
};

const SidebarButton = ({
  view,
  icon,
  tooltip,
}: {
  view: ViewType;
  icon: VegaIconNames;
  tooltip: string;
}) => {
  const { currView, setView } = useSidebar((store) => ({
    currView: store.view,
    setView: store.setView,
  }));
  const buttonClasses = classNames('flex items-center p-2 rounded', {
    'text-vega-clight-200 dark:text-vega-cdark-200 hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500':
      view !== currView?.type,
    'bg-vega-yellow hover:bg-vega-yellow-550 text-black':
      view === currView?.type,
  });
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
        onClick={() => {
          if (view === currView?.type) {
            setView(null);
          } else {
            setView({ type: view });
          }
        }}
      >
        <VegaIcon name={icon} size={20} />
      </button>
    </Tooltip>
  );
};

const SidebarDivider = () => {
  return <div className="border-b border-default mx-2" />;
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
        </ContentWrapper>
      );
    } else {
      return <CloseSidebar />;
    }
  }

  if (view.type === ViewType.Info) {
    if (params.marketId) {
      return <MarketInfoAccordionContainer marketId={params.marketId} />;
    } else {
      return <CloseSidebar />;
    }
  }

  if (view.type === ViewType.Deposit) {
    return (
      <ContentWrapper title={t('Deposit')}>
        <DepositContainer assetId={view.assetId} />
      </ContentWrapper>
    );
  }

  if (view.type === ViewType.Withdraw) {
    return (
      <ContentWrapper title={t('Withdraw')}>
        <WithdrawContainer assetId={view.assetId} />
      </ContentWrapper>
    );
  }

  if (view.type === ViewType.Transfer) {
    return (
      <ContentWrapper title={t('Transfer')}>
        <TransferContainer assetId={view.assetId} />
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
    <div
      // panes have p-1, since sidebar is on the right make pl less to account for additional pane space
      className="py-4 pl-3 pr-4"
    >
      {title && <h2 className="mb-4">{title}</h2>}
      {children}
    </div>
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
}>()((set) => ({
  init: true,
  view: null,
  setView: (x) =>
    set(() => {
      if (x === null) {
        return { view: null, init: false };
      }

      return { view: x, init: false };
    }),
}));
