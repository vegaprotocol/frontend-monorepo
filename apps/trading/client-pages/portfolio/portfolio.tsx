import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutPriority } from 'allotment';
import { cn } from '@vegaprotocol/ui-toolkit';

import { useScreenDimensions } from '@vegaprotocol/react-helpers';
import {
  Intent,
  Notification,
  Tab,
  LocalStoragePersistTabs as Tabs,
  TinyScroll,
  Input,
  VegaIcon,
  VegaIconNames,
} from '@vegaprotocol/ui-toolkit';
import { TransferContainer } from '@vegaprotocol/accounts';

import { SidebarAccountsContainer } from '../../components/accounts-container';
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

import { useT } from '../../lib/use-t';
import { Links } from '../../lib/links';
import { usePageTitle } from '../../lib/hooks/use-page-title';

import { ErrorBoundary } from '../../components/error-boundary';
import { DepositContainer } from '../../components/deposit-container';
import { WithdrawContainer } from '../../components/withdraw-container';
import { SwapContainer } from '../../components/swap/swap-container';
import { AssetActivity } from '../../components/asset-activity';

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
          minSize={350}
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
      <div className="h-[300px] border-t border-gs-300 dark:border-gs-700">
        <PortfolioTopTabs />
      </div>
      <div className="h-[300px] border-t border-gs-300 dark:border-gs-700">
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
      <div className="flex justify-between bg-surface-2/70">
        <h3 className="px-2 py-3 text-sm leading-4">{t('Assets')}</h3>
        <div
          className={cn('transition-all w-1/3 p-1 relative', {
            '!w-1/2': searchTerm?.length > 10,
          })}
        >
          <Input
            onChange={(e) => {
              const searchTerm = e.target.value;
              setSearchTerm(searchTerm);
            }}
            value={searchTerm}
            type="text"
            placeholder={t('Search')}
            data-testid="search-term"
            className="bg-surface-1 pr-8"
            prependElement={
              <VegaIcon className="fill-gs-300 " name={VegaIconNames.SEARCH} />
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
              className="block p-0 m-0 !align-top fill-gs-300 "
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
      <Tab id="swap" name={t('Swap')}>
        <ErrorBoundary feature="assets-swap">
          <div className="p-4">
            <SwapContainer onDeposit={onDeposit} />
          </div>
        </ErrorBoundary>
      </Tab>
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
      {[
        <Tab
          id="asset-activity"
          name={t('Asset activity')}
          key="asset-activity"
        >
          <ErrorBoundary feature="portfolio-asset-activity">
            <AssetActivity />
          </ErrorBoundary>
        </Tab>,
      ]}
    </Tabs>
  );
};
