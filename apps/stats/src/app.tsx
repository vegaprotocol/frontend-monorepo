import React from 'react';
import { DATA_SOURCES } from './config';
import { Header } from './components/header';
import { StatsManager } from '@vegaprotocol/network-stats';
import { ThemeContext } from '@vegaprotocol/react-helpers';
import { useThemeSwitcher } from '@vegaprotocol/react-helpers';

const envName = DATA_SOURCES.envName;
const restEndpoint = DATA_SOURCES.restEndpoint;
const statsEndpoint = `${restEndpoint}/statistics`;
const nodesEndpoint = `${restEndpoint}/nodes-data`;

function App() {
  const [theme, toggleTheme] = useThemeSwitcher();

  return (
    <ThemeContext.Provider value={theme}>
      <div className="w-screen min-h-screen grid pb-24 bg-white text-black-95 dark:bg-black dark:text-white-80">
        <div className="layout-grid w-screen justify-self-center">
          <Header toggleTheme={toggleTheme} />
          <StatsManager
            envName={envName}
            statsEndpoint={statsEndpoint}
            nodesEndpoint={nodesEndpoint}
            className="max-w-3xl px-24"
          />
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
