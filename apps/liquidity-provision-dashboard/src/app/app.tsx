import { useMarketsLiquidity } from '@vegaprotocol/liquidity';
import '../styles.scss';
import { Header } from './components/header';
import { Intro } from './components/intro';
import { MarketList } from './components/market-list';

export function App() {
  const { data, error, loading } = useMarketsLiquidity();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( </p>;

  return (
    <div className="max-h-full min-h-full bg-white flex flex-col">
      <Header />
      <Intro />
      {data && <MarketList data={data} />}
    </div>
  );
}

export default App;
