import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutPriority } from 'allotment';
import { useScreenDimensions } from '@vegaprotocol/react-helpers';

import { useFeatureFlags } from '@vegaprotocol/environment';
import {
  Intent,
  Notification,
  Tab,
  LocalStoragePersistTabs as Tabs,
  TinyScroll,
  TradingInput,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { TransferContainer } from '@vegaprotocol/accounts';

import { SidebarAccountsContainer } from '../../components/accounts-container';
import { DepositsContainer } from '../../components/deposits-container';
import {
  FillsContainer,
  FillsSettings,
} from '../../components/fills-container';
import {
  FundingPaymentsContainer,
  FundingPaymentsSettings,
} from '../../components/funding-payments-container';
import {
  PositionsContainer,
  PositionsSettings,
} from '../../components/positions-container';
import { PositionsMenu } from '../../components/positions-menu';
import { WithdrawalsContainer } from '../../components/withdrawals-container';
import {
  OrdersContainer,
  OrdersSettings,
} from '../../components/orders-container';
import { LedgerContainer } from '../../components/ledger-container';
import {
  ResizableGrid,
  ResizableGridPanel,
  ResizableGridPanelChild,
  usePaneLayout,
} from '../../components/resizable-grid';
import { DepositsMenu } from '../../components/deposits-menu';
import { WithdrawalsMenu } from '../../components/withdrawals-menu';
import { useT } from '../../lib/use-t';
import { ErrorBoundary } from '../../components/error-boundary';
import { usePageTitle } from '../../lib/hooks/use-page-title';
import { Links } from '../../lib/links';

import { DepositContainer } from '../../components/deposit-container';
import { WithdrawContainer } from '../../components/withdraw-container';
import { SwapContainer } from '../../components/swap/swap-container';
import { SquidContainer } from '../../components/squid-container';

import { useIncompleteWithdrawals } from '../../lib/hooks/use-incomplete-withdrawals';
import classNames from 'classnames';

const WithdrawalsIndicator = () => {
  const { ready } = useIncompleteWithdrawals();
  if (!ready || ready.length === 0) {
    return null;
  }
  return (
    <span className="p-1 leading-none rounded bg-vega-clight-500 dark:bg-vega-cdark-500 text-default">
      {ready.length}
    </span>
  );
};

export const Portfolio = () => {
  const t = useT();
  const { screenSize } = useScreenDimensions();
  const largeScreen = ['lg', 'xl', 'xxl', 'xxxl'].includes(screenSize);

  usePageTitle(t('Portfolio'));

  return largeScreen ? <PortfolioGrid /> : <PortfolioSmall />;
};

const PortfolioGrid = () => {
  const [sizes, handleOnLayoutChange] = usePaneLayout({ id: 'portfolio' });
  const [sizesHorizontal, handleOnHorizontalChange] = usePaneLayout({
    id: 'portfolio-horizontal',
  });
  return (
    <div className="p-0.5 h-full max-h-full flex flex-col">
      <ResizableGrid onChange={handleOnHorizontalChange}>
        <ResizableGridPanel
          minSize={460}
          maxSize={700}
          preferredSize={sizesHorizontal[0] || 460}
        >
          <ResizableGridPanelChild>
            <PortfolioAssets />
          </ResizableGridPanelChild>
        </ResizableGridPanel>
        <ResizableGridPanel>
          <ResizableGrid vertical onChange={handleOnLayoutChange}>
            <ResizableGridPanel minSize={75}>
              <ResizableGridPanelChild>
                <PortfolioTopTabs />
              </ResizableGridPanelChild>
            </ResizableGridPanel>
            <ResizableGridPanel
              priority={LayoutPriority.Low}
              preferredSize={sizes[1] || 300}
              minSize={50}
            >
              <ResizableGridPanelChild>
                <PortfolioBottomTabs />
              </ResizableGridPanelChild>
            </ResizableGridPanel>
          </ResizableGrid>
        </ResizableGridPanel>
      </ResizableGrid>
    </div>
  );
};

const PortfolioSmall = () => {
  return (
    <div className="overflow-y-auto h-full">
      <div>
        <PortfolioActionTabs />
      </div>
      <div className="h-[300px] border-t border-default">
        <PortfolioTopTabs />
      </div>
      <div className="h-[300px] border-t border-default">
        <PortfolioBottomTabs />
      </div>
    </div>
  );
};

const PortfolioAssets = () => {
  const t = useT();
  const [searchTerm, setSearchTerm] = useState('');
  return (
    <ErrorBoundary feature="portfolio-assets">
      <div className="flex justify-between bg-vega-clight-700 dark:bg-vega-cdark-700">
        <h3 className="px-2 py-3 text-sm leading-4">{t('Assets')}</h3>
        <div
          className={classNames('transition-all w-1/3 p-1 relative', {
            '!w-1/2': searchTerm?.length > 10,
          })}
        >
          <TradingInput
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearchTerm(searchTerm);
            }}
            value={searchTerm}
            type="text"
            placeholder={t('Search')}
            data-testid="search-term"
            className="w-full !py-0.5 text-xs !h-8 pl-7 pr-8 border rounded peer bg-vega-clight-800 dark:bg-vega-cdark-800"
            prependElement={
              <VegaIcon
                className="fill-vega-clight-300 dark:fill-vega-cdark-300"
                name={VegaIconNames.SEARCH}
              />
            }
          />
          <button
            title={t('Clear')}
            className="absolute top-1/2 transform -translate-y-1/2 right-3 w-4 h-4"
            onClick={() => {
              setSearchTerm('');
            }}
            hidden={searchTerm.length === 0}
          >
            <VegaIcon
              className="block p-0 m-0 !align-top fill-vega-clight-300 dark:fill-vega-cdark-300"
              name={VegaIconNames.CROSS}
              size={16}
            />
          </button>
        </div>
      </div>
      <TinyScroll>
        <SidebarAccountsContainer
          orderByBalance={true}
          hideZeroBalance={false}
          searchTerm={searchTerm}
        />
      </TinyScroll>
    </ErrorBoundary>
  );
};

const PortfolioActionTabs = () => {
  const t = useT();
  const flags = useFeatureFlags((state) => state.flags);
  const navigate = useNavigate();
  const onDeposit = () => navigate(Links.DEPOSIT());

  return (
    <Tabs storageKey="portfolio-sidebar">
      <Tab id="assets" name={t('Assets')}>
        <ErrorBoundary feature="portfolio-assets">
          <TinyScroll>
            <SidebarAccountsContainer
              orderByBalance={true}
              hideZeroBalance={false}
            />
          </TinyScroll>
        </ErrorBoundary>
      </Tab>
      <Tab id="deposit" name={t('Deposit (Basic)')}>
        <ErrorBoundary feature="portfolio-deposit">
          <div className="p-2 flex flex-col gap-4">
            <Notification
              intent={Intent.Info}
              message={t(
                'Use this form to deposit Ethereum or Arbitrum assets to the Vega network'
              )}
            />
            <DepositContainer />
          </div>
        </ErrorBoundary>
      </Tab>
      {flags.CROSS_CHAIN_DEPOSITS_ENABLED ? (
        <Tab id="cross-chain-deposit" name={t('Deposit (Cross-chain)')}>
          <ErrorBoundary feature="portfolio-transfer">
            <div className="p-2 flex flex-col gap-4">
              <Notification
                intent={Intent.Info}
                message={t(
                  'Use this form to utilise Squid Router to make cross-chain deposits from any supported chain onto Vega. The amount you receive will be deposited directly to the network. To ensure users enjoy the cheapest fees possible this mode only supports deposits into Arbitrum assets'
                )}
              />
              <SquidContainer />
            </div>
          </ErrorBoundary>
        </Tab>
      ) : null}
      <Tab id="withdraw" name={t('Withdraw')}>
        <ErrorBoundary feature="portfolio-withdraw">
          <div className="p-2">
            <WithdrawContainer />
          </div>
        </ErrorBoundary>
      </Tab>
      <Tab id="transfer" name={t('Transfer')}>
        <ErrorBoundary feature="portfolio-transfer">
          <div className="p-2">
            <TransferContainer />
          </div>
        </ErrorBoundary>
      </Tab>
      {flags.SWAP ? (
        <Tab id="swap" name={t('Swap')}>
          <ErrorBoundary feature="assets-swap">
            <div className="p-4">
              <SwapContainer onDeposit={onDeposit} />
            </div>
          </ErrorBoundary>
        </Tab>
      ) : null}
    </Tabs>
  );
};

export const PORTFOLIO_TOP_TABS = 'console-portfolio-top-1';

const PortfolioTopTabs = () => {
  const t = useT();

  return (
    <Tabs storageKey={PORTFOLIO_TOP_TABS}>
      <Tab
        id="positions"
        name={t('Positions')}
        menu={<PositionsMenu />}
        settings={<PositionsSettings />}
      >
        <ErrorBoundary feature="portfolio-positions">
          <PositionsContainer allKeys />
        </ErrorBoundary>
      </Tab>
      <Tab id="orders" name={t('Orders')} settings={<OrdersSettings />}>
        <ErrorBoundary feature="portfolio-orders">
          <OrdersContainer />
        </ErrorBoundary>
      </Tab>
      <Tab id="fills" name={t('Trades')} settings={<FillsSettings />}>
        <ErrorBoundary feature="portfolio-fills">
          <FillsContainer />
        </ErrorBoundary>
      </Tab>
      <Tab
        id="funding-payments"
        name={t('Funding payments')}
        settings={<FundingPaymentsSettings />}
      >
        <ErrorBoundary feature="portfolio-funding-payments">
          <FundingPaymentsContainer />
        </ErrorBoundary>
      </Tab>
      <Tab id="ledger-entries" name={t('Ledger entries')}>
        <ErrorBoundary feature="portfolio-ledger">
          <LedgerContainer />
        </ErrorBoundary>
      </Tab>
    </Tabs>
  );
};

const PortfolioBottomTabs = () => {
  const t = useT();
  return (
    <Tabs storageKey="console-portfolio-bottom">
      <Tab id="deposits" name={t('Deposits')} menu={<DepositsMenu />}>
        <ErrorBoundary feature="portfolio-deposit">
          <DepositsContainer />
        </ErrorBoundary>
      </Tab>
      <Tab
        id="withdrawals"
        name={t('Withdrawals')}
        indicator={<WithdrawalsIndicator />}
        menu={<WithdrawalsMenu />}
      >
        <ErrorBoundary feature="portfolio-deposit">
          <WithdrawalsContainer />
        </ErrorBoundary>
      </Tab>
    </Tabs>
  );
};
