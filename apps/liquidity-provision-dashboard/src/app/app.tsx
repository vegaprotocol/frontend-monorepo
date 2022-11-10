import { useRoutes } from 'react-router-dom';

import '../styles.scss';
import { Navbar } from './components/navbar';

import { routerConfig } from './routes/router-config';

const AppRouter = () => useRoutes(routerConfig);

export function App() {
  return (
    <div className="max-h-full min-h-full bg-white">
      <Navbar />
      <AppRouter />
    </div>
  );
}

export default App;
