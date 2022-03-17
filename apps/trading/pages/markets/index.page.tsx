import { gql } from '@apollo/client';
import { Markets } from '@vegaprotocol/graphql';
import { PageQueryContainer } from '../../components/page-query-container';
import Link from 'next/link';
import { useRouter } from 'next/router';

const MARKETS_QUERY = gql`
  query Markets {
    markets {
      id
    }
  }
`;

const Markets = () => {
  const { pathname } = useRouter();

  return (
    <PageQueryContainer<Markets> query={MARKETS_QUERY}>
      {(data) => (
        <>
          <h1>Markets</h1>
          <ul>
            {data.markets.map((m) => (
              <li key={m.id}>
                <Link
                  href={`${pathname}/${m.id}?portfolio=orders&trade=orderbook`}
                  passHref={true}
                >
                  <a>View market: {m.id}</a>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageQueryContainer>
  );
};

export default Markets;
