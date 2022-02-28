import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Markets } from './__generated__/Markets';

const MARKETS_QUERY = gql`
  query Markets {
    markets {
      id
    }
  }
`;

const Markets = () => {
  const router = useRouter();
  const { data, loading, error } = useQuery<Markets>(MARKETS_QUERY);

  if (loading || !data) {
    return <div>Loading...</div>;
  }

  console.log(data);

  return (
    <div>
      <h1>Markets</h1>
      {error ? (
        <div>Could not load markets {error.message}</div>
      ) : (
        <ul>
          {data.markets.map((m) => (
            <li key={m.id}>
              <Link href={`${router.pathname}/${m.id}`} passHref={true}>
                <a>View market: {m.id}</a>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Markets;
