import { gql, useQuery } from '@apollo/client';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import React, { Children, isValidElement, ReactNode } from 'react';
import { Market, MarketVariables } from './__generated__/Market';

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
  const { data, loading, error } = useQuery<Market, MarketVariables>(
    MARKET_QUERY,
    {
      variables: { marketId: query.marketId as string },
      skip: !query.marketId,
    }
  );

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {error ? (
        <div>Something went wrong: {error.message}</div>
      ) : (
        <div className="h-full max-h-full grid gap-[1px] bg-black grid-cols-[1fr_400px_400px] grid-rows-[min-content_1fr_200px]">
          <header className="bg-white col-span-4 p-8">
            <h1>Market: {query.marketId}</h1>
          </header>
          <GridChild>TODO: Chart</GridChild>
          <GridChild>TODO: Ticket</GridChild>
          <GridChild>
            <GridTabs group="trade">
              <GridTab name="trades">
                <pre>{JSON.stringify(data, null, 2)}</pre>
              </GridTab>
              <GridTab name="orderbook">Orderbook TODO:</GridTab>
            </GridTabs>
          </GridChild>
          <GridChild className="col-span-4">
            <GridTabs group="portfolio">
              <GridTab name="orders">TODO: Orders</GridTab>
              <GridTab name="positions">TODO: Positions</GridTab>
              <GridTab name="collateral">TODO: Collateral</GridTab>
            </GridTabs>
          </GridChild>
        </div>
      )}
    </>
  );
};

export default MarketPage;

interface GridChildProps {
  children: ReactNode;
  className?: string;
}

const GridChild = ({ children, className }: GridChildProps) => {
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

  return (
    <div className="h-full grid grid-rows-[min-content_1fr]">
      {/* the tabs */}
      <div className="flex gap-[2px] bg-[#ededed]">
        {Children.map(children, (child) => {
          if (!isValidElement(child)) return null;
          const buttonClass = classNames('p-8', {
            'text-vega-pink': query[group] === child.props.name,
          });
          return (
            <button
              className={buttonClass}
              onClick={() => {
                const [url, queryString] = asPath.split('?');
                const searchParams = new URLSearchParams(queryString);
                searchParams.set(group, child.props.name);
                replace(`${url}?${searchParams.toString()}`);
              }}
            >
              {child.props.name}
            </button>
          );
        })}
      </div>
      {/* the content */}
      <div className="h-full overflow-auto">
        {Children.map(children, (child) => {
          if (isValidElement(child) && query[group] === child.props.name) {
            return <div>{child.props.children}</div>;
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
