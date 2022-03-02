import { gql } from '@apollo/client';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, {
  Children,
  isValidElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import debounce from 'lodash/debounce';
import { Market, MarketVariables, Market_market } from './__generated__/Market';
import { PageQueryContainer } from '../../components/page-query-container';

// Top level page query
const MARKET_QUERY = gql`
  query Market($marketId: ID!) {
    market(id: $marketId) {
      id
      name
      trades {
        id
        price
        size
        createdAt
      }
    }
  }
`;

const MarketPage = () => {
  const { query } = useRouter();
  const { w } = useWindowSize();

  return (
    <PageQueryContainer<Market, MarketVariables>
      query={MARKET_QUERY}
      options={{
        variables: { marketId: query.marketId as string },
        skip: !query.marketId,
      }}
    >
      {(data) =>
        w > 1050 ? (
          <TradeGrid market={data.market} />
        ) : (
          <TradePanels market={data.market} />
        )
      }
      {}
    </PageQueryContainer>
  );
};

export default MarketPage;

interface TradeGridProps {
  market: Market_market;
}

const TradeGrid = ({ market }: TradeGridProps) => {
  const wrapperClasses = classNames(
    'h-full max-h-full',
    'grid gap-[1px] grid-cols-[1fr_325px_325px] grid-rows-[min-content_1fr_200px]',
    'bg-neutral-200',
    'text-ui'
  );
  return (
    <div className={wrapperClasses}>
      <header className="col-start-1 col-end-2 row-start-1 row-end-1 bg-white p-8">
        <h1>Market: {market.name}</h1>
      </header>
      <TradeGridChild className="col-start-1 col-end-2">
        <Chart />
      </TradeGridChild>
      <TradeGridChild className="row-start-1 row-end-3">
        <Ticket />
      </TradeGridChild>
      <TradeGridChild className="row-start-1 row-end-3">
        <GridTabs group="trade">
          <GridTab name="trades">
            <pre>{JSON.stringify(market.trades, null, 2)}</pre>
          </GridTab>
          <GridTab name="orderbook">
            <Orderbook />
          </GridTab>
        </GridTabs>
      </TradeGridChild>
      <TradeGridChild className="col-span-3">
        <GridTabs group="portfolio">
          <GridTab name="orders">
            <Orders />
          </GridTab>
          <GridTab name="positions">
            <Positions />
          </GridTab>
          <GridTab name="collateral">
            <Collateral />
          </GridTab>
        </GridTabs>
      </TradeGridChild>
    </div>
  );
};

interface TradeGridChildProps {
  children: ReactNode;
  className?: string;
}

const TradeGridChild = ({ children, className }: TradeGridChildProps) => {
  const gridChildClasses = classNames('bg-white', className);
  return (
    <section className={gridChildClasses}>
      <AutoSizer>
        {({ width, height }) => (
          <div style={{ width, height }} className="overflow-auto">
            {children}
          </div>
        )}
      </AutoSizer>
    </section>
  );
};

interface GridTabsProps {
  children: ReactNode;
  group: string;
}

const GridTabs = ({ children, group }: GridTabsProps) => {
  const { query, asPath, replace } = useRouter();
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (query[group]) {
      return query[group];
    }

    // Default to first tab
    return children[0].props.name;
  });

  // Using replace inside an effect causes a render loop. Seems like its not using useCallback
  // eslint-disable-next-line
  const safeReplace = useCallback((path: string) => replace(path), []);

  useEffect(() => {
    const [url, queryString] = asPath.split('?');
    const searchParams = new URLSearchParams(queryString);
    searchParams.set(group, activeTab as string);
    safeReplace(`${url}?${searchParams.toString()}`);
  }, [activeTab, group, asPath, safeReplace]);

  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      {/* the tabs */}
      <div className="flex gap-[2px] bg-neutral-200" role="tablist">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          const isActive = activeTab === child.props.name;
          const buttonClass = classNames(
            'py-4',
            'px-12',
            'border-t border-neutral-200',
            'capitalize',
            {
              'text-vega-pink': isActive,
              'bg-white': isActive,
            }
          );
          return (
            <button
              className={buttonClass}
              onClick={() => setActiveTab(child.props.name)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${group}-${child.props.name}`}
              id={`tab-${group}-${child.props.name}`}
            >
              {child.props.name}
            </button>
          );
        })}
      </div>
      {/* the content */}
      <div className="h-full overflow-auto">
        {Children.map(children, (child) => {
          if (isValidElement(child) && activeTab === child.props.name) {
            return (
              <div
                role="tabpanel"
                id={`tabpanel-${group}-${child.props.name}`}
                aria-labelledby={`tab-${group}-${child.props.name}`}
              >
                {child.props.children}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

interface GridTabProps {
  children: ReactNode;
  name: string;
}

const GridTab = ({ children }: GridTabProps) => {
  return <div>{children}</div>;
};

///// SMALL SCREENS ///////

type View = keyof typeof Views;

interface TradePanelsProps {
  market: Market_market;
}

const TradePanels = ({ market }: TradePanelsProps) => {
  const [view, setView] = React.useState<View>('chart');

  const renderView = () => {
    const Component = Views[view];

    if (!Component) {
      throw new Error(`No component for view: ${view}`);
    }

    return <Component />;
  };

  return (
    <div className="h-full grid grid-rows-[min-content_1fr_min-content]">
      <header className="bg-white p-8">
        <h1>Market: {market.name}</h1>
      </header>
      <div className="h-full">
        <AutoSizer>
          {({ width, height }) => (
            <div style={{ width, height }}>{renderView()}</div>
          )}
        </AutoSizer>
      </div>
      <div className="flex flex-nowrap gap-2 bg-neutral-200 border-neutral-200 border-t overflow-x-auto">
        {Object.keys(Views).map((key: View) => {
          const className = classNames(
            'p-8',
            'border-t',
            'border-neutral-200',
            'capitalize',
            {
              'text-vega-pink': view === key,
              'bg-white': view === key,
            }
          );
          return (
            <button
              onClick={() => setView(key)}
              className={className}
              key={key}
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Chart = () => <div>TODO: Chart</div>;
const Ticket = () => <div>TODO: Ticket</div>;
const Orderbook = () => <div>TODO: Orderbook</div>;
const Orders = () => <div>TODO: Orders</div>;
const Positions = () => <div>TODO: Positions</div>;
const Collateral = () => <div>TODO: Collateral</div>;

const Views = {
  chart: Chart,
  ticket: Ticket,
  orderbook: Orderbook,
  orders: Orders,
  positions: Positions,
  collateral: Collateral,
};

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return {
        w: window.innerWidth,
        h: window.innerHeight,
      };
    }

    // Something sensible for server rendered page
    return {
      w: 1200,
      h: 900,
    };
  });

  useEffect(() => {
    const handleResize = debounce((event) => {
      setWindowSize({
        w: event.target.innerWidth,
        h: event.target.innerHeight,
      });
    }, 300);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
