import { TransferContainer } from '@vegaprotocol/accounts';
import { DepositContainer } from '@vegaprotocol/deposits';
import { VLogo, VegaIcon, VegaIconNames } from '@vegaprotocol/ui-toolkit';
import { Tooltip } from '../../components/tooltip';
import { WithdrawFormContainer } from '@vegaprotocol/withdraws';
import { create } from 'zustand';
import { Route, Routes, useParams } from 'react-router-dom';
import { Settings } from '../settings';
import classNames from 'classnames';
import { NodeHealthContainer } from '../node-health';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';
import { t } from '@vegaprotocol/i18n';
import { DealTicketContainer } from '@vegaprotocol/deal-ticket';
import { WithdrawContainer } from '../withdraw-container';

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
        <DealTicketContainer
          marketId={params.marketId}
          onDeposit={(assetId) => setView({ type: ViewType.Deposit, assetId })}
        />
      );
    } else {
      return <p>{t('No market selected')}</p>;
    }
  }

  if (view.type === ViewType.Deposit) {
    return (
      <div className="py-1">
        <h2 className="mb-4">{t('Deposit')}</h2>
        <DepositContainer assetId={view.assetId} />
      </div>
    );
  }

  if (view.type === ViewType.Withdraw) {
    return (
      <div className="py-1">
        <h2 className="mb-4">{t('Withdraw')}</h2>
        <WithdrawContainer assetId={view.assetId} />
      </div>
    );
  }

  if (view.type === ViewType.Transfer) {
    return (
      <div className="py-1">
        <h2 className="mb-4">{t('Transfer')}</h2>
        <TransferContainer assetId={view.assetId} />;
      </div>
    );
  }

  if (view.type === ViewType.Settings) {
    return (
      <div className="py-1">
        <h2 className="mb-4">{t('Settings')}</h2>
        <Settings />
      </div>
    );
  }

  if (view.type === ViewType.Info) {
    if (params.marketId) {
      return <MarketInfoAccordionContainer marketId={params.marketId} />;
    } else {
      return <p>{t('No market selected')}</p>;
    }
  }

  throw new Error('invalid sidebar');
};

export const useSidebar = create<{
  view: SidebarView | null;
  setView: (view: SidebarView | null) => void;
}>()((set) => ({
  view: null,
  setView: (x) =>
    set(() => {
      if (x === null) {
        return { view: null };
      }

      return { view: x };
    }),
}));
