import { EnvironmentProvider } from '@vegaprotocol/environment';
import { Header } from './components/header';
import { StatsManager } from '@vegaprotocol/network-stats';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();

  return (
    <EnvironmentProvider>
      <ThemeContext.Provider value={theme}>
        <div className="w-screen min-h-screen grid pb-24 bg-white text-black-95 dark:bg-black dark:text-white-80">
          <div className="layout-grid w-screen justify-self-center">
            <Header toggleTheme={toggleTheme} />
            <StatsManager className="max-w-3xl px-24" />
          </div>
        </div>
      </ThemeContext.Provider>
    </EnvironmentProvider>
  );
}

export default App;
