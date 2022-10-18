import '../styles.scss';
import { Header } from './components/header';
import { Intro } from './components/intro';
import { MarketList } from './components/market-list';

export function App() {
  return (
    <div className="max-h-full min-h-full bg-white">
      <Header />
      <Intro />
      <MarketList />
    </div>
  );
}

export default App;
