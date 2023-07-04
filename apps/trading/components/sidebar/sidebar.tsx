import { TransferContainer } from '@vegaprotocol/accounts';
import { DepositContainer } from '@vegaprotocol/deposits';
import { VLogo, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Tooltip } from '../../components/tooltip';
import { create } from 'zustand';
import { Route, Routes, useParams } from 'react-router-dom';
import { Settings } from '../settings';
import classNames from 'classnames';
import { NodeHealthContainer } from '../node-health';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { WithdrawContainer } from '../withdraw-container';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

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
    <>
      <div className="flex flex-col items-center gap-2 py-2 px-1 h-full">
        <div>
          <VLogo className="w-[20px]" />
        </div>
        <nav className="flex flex-col items-stretch gap-2 p-1">
          {/* sidebar options that always show */}
          <SidebarButton
            view={ViewType.Deposit}
            icon={VegaIconNames.DEPOSIT}
            tooltip="Deposit"
          />
          <SidebarButton
            view={ViewType.Withdraw}
            icon={VegaIconNames.WITHDRAW}
            tooltip="Withdraw"
          />
          <SidebarButton
            view={ViewType.Transfer}
            icon={VegaIconNames.TRANSFER}
            tooltip="Transfer"
          />
          {/* buttons for specific routes */}
          <Routes>
            <Route path="/markets/all" element={null} />
            <Route
              path="/markets/:marketId"
              element={
                <>
                  <SidebarDivider />
                  <SidebarButton
                    view={ViewType.Order}
                    icon={VegaIconNames.TREND_UP}
                    tooltip="Order"
                  />
                  <SidebarButton
                    view={ViewType.Info}
                    icon={VegaIconNames.BREAKDOWN}
                    tooltip="Market specification"
                  />
                </>
              }
            />
          </Routes>
        </nav>
        <nav className="mt-auto flex flex-col items-stretch gap-2 p-1">
          <SidebarButton
            view={ViewType.Settings}
            icon={VegaIconNames.COG}
            tooltip="Settings"
          />
          <NodeHealthContainer />
        </nav>
      </div>
    </>
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
  const { view: currView, setView } = useSidebar();
  const buttonClasses = classNames('flex items-center p-2 rounded', {
    'text-vega-clight-200 dark:text-vega-cdark-200 hover:bg-vega-clight-500 dark:hover:bg-vega-cdark-500':
      view !== currView?.type,
    'bg-vega-yellow hover:bg-vega-yellow-550 text-black':
      view === currView?.type,
  });
  return (
    <Tooltip description={tooltip} align="center" side="right" sideOffset={10}>
      <button
        className={buttonClasses}
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
    <div className="p-4">
      {title && <h2 className="mb-4">{title}</h2>}
      {children}
    </div>
  );
};

/** If rendered will close sidebar */
const CloseSidebar = () => {
  const { setView } = useSidebar();
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
