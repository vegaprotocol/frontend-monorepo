import { EnvironmentProvider, NetworkLoader } from '@vegaprotocol/environment';
import { Header } from './components/header';
import { StatsManager } from '@vegaprotocol/network-stats';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';
import { createClient } from './lib/apollo-client';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();

  return (
    <ThemeContext.Provider value={theme}>
      <NetworkLoader createClient={createClient}>
        <div className="w-screen min-h-screen grid pb-24 bg-white text-neutral-900 dark:bg-black dark:text-neutral-100">
          <div className="layout-grid w-screen justify-self-center">
            <Header theme={theme} toggleTheme={toggleTheme} />
            <StatsManager className="max-w-3xl px-24" />
          </div>
        </div>
      </NetworkLoader>
    </ThemeContext.Provider>
  );
}

const Wrapper = () => {
  return (
    <EnvironmentProvider>
      <App />
    </EnvironmentProvider>
  );
};

export default Wrapper;
