import { TransferContainer } from '@vegaprotocol/accounts';
import { DepositContainer } from '@vegaprotocol/deposits';
import {
  VLogo,
  Tooltip,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { WithdrawFormContainer } from '@vegaprotocol/withdraws';
import { TradingViews } from '../../client-pages/market/trade-views';
import { create } from 'zustand';
import { Route, Routes, useParams } from 'react-router-dom';
import { Settings } from '../settings';
import classNames from 'classnames';
import { NodeHealthContainer } from '../node-health';
import { MarketInfoAccordionContainer } from '@vegaprotocol/markets';

type SidebarView =
  | 'order'
  | 'info'
  | 'deposit'
  | 'withdraw'
  | 'transfer'
  | 'settings';

export const Sidebar = () => {
  return (
    <div className="flex flex-col items-center gap-2 py-2 px-1 h-full">
      <div>
        <VLogo className="w-[20px]" />
      </div>
      <nav className="flex flex-col items-stretch gap-2 p-1">
        {/* sidebar options that always show */}
        <SidebarButton
          view="deposit"
          icon={VegaIconNames.DEPOSIT}
          tooltip="Deposit"
        />
        <SidebarButton
          view="withdraw"
          icon={VegaIconNames.WITHDRAW}
          tooltip="Withdraw"
        />
        <SidebarButton
          view="transfer"
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
                <SidebarButton
                  view="order"
                  icon={VegaIconNames.TREND_UP}
                  tooltip="Order"
                />
                <SidebarButton
                  view="info"
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
          view="settings"
          icon={VegaIconNames.COG}
          tooltip="Settings"
        />
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
  view: SidebarView;
  icon: VegaIconNames;
  tooltip: string;
}) => {
  const { view: currView, setView } = useSidebar();
  const buttonClasses = classNames('flex items-center p-2 rounded', {
    'hover:bg-vega-yellow hover:text-black': view !== currView,
    'bg-vega-yellow hover:bg-vega-yellow-550 text-black': view === currView,
  });
  return (
    <Tooltip
      description={<span className="text-base p-1">{tooltip}</span>}
      align="center"
      side="right"
      sideOffset={10}
    >
      <button className={buttonClasses} onClick={() => setView(view)}>
        <VegaIcon name={icon} size={20} />
      </button>
    </Tooltip>
  );
};

export const SidebarContent = () => {
  const { view } = useSidebar();
  const params = useParams();

  if (view === 'order') {
    if (params.marketId) {
      return <TradingViews.ticket.component marketId={params.marketId} />;
    }

    return <div>No marke selected</div>;
  }

  if (view === 'deposit') {
    return <DepositContainer />;
  }

  if (view === 'withdraw') {
    return <WithdrawFormContainer submit={() => alert('TODO')} />;
  }

  if (view === 'transfer') {
    return <TransferContainer />;
  }

  if (view === 'settings') {
    return <Settings />;
  }

  if (view === 'info') {
    if (params.marketId) {
      return <MarketInfoAccordionContainer marketId={params.marketId} />;
    }

    return <div>No marke selected</div>;
  }

  return null;
};

export const useSidebar = create<{
  view: SidebarView | null;
  setView: (view: SidebarView) => void;
}>()((set) => ({
  view: null,
  setView: (view) =>
    set((state) => {
      if (view === state.view) {
        return { view: null };
      }
      return { view };
    }),
}));
