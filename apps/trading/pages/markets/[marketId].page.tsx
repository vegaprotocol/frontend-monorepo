import { gql, useQuery } from '@apollo/client';
import AutoSizer from 'react-virtualized-auto-sizer';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
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
        <div className="h-full max-h-full grid gap-[1px] bg-black grid-cols-[300px_2fr_1fr_1fr] grid-rows-[min-content_1fr_200px]">
          <header className="bg-white col-span-4 p-8">
            <h1>Market: {query.marketId}</h1>
          </header>
          <GridChild name="Ticket">Content</GridChild>
          <GridChild name="Chart">Content</GridChild>
          <GridChild name="Order book">Content</GridChild>
          <GridChild name="Trades">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </GridChild>
          <GridChild name="Portfolio" className="col-span-4">
            Content
          </GridChild>
        </div>
      )}
    </>
  );
};

export default MarketPage;

interface GridChildProps {
  children: ReactNode;
  name?: string;
  className?: string;
}

const GridChild = ({ children, className, name }: GridChildProps) => {
  const gridChildClasses = classNames('bg-white', className);
  return (
    <section className={gridChildClasses}>
      <div className="h-full grid grid-rows-[min-content_1fr]">
        <div className="p-8 border-b-1">
          <h2>{name}</h2>
        </div>
        <div>
          <AutoSizer>
            {({ width, height }) => (
              <div style={{ width, height }} className="overflow-auto">
                {children}
              </div>
            )}
          </AutoSizer>
        </div>
      </div>
    </section>
  );
};
