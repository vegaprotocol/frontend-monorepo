import React, { useState } from 'react';
import { DATA_SOURCES } from './config';
import { Header } from './components/header';
import { StatsManager } from '@vegaprotocol/network-stats';

const envName = DATA_SOURCES.envName;
const restEndpoint = DATA_SOURCES.restEndpoint;
const statsEndpoint = `${restEndpoint}/statistics`;
const nodesEndpoint = `${restEndpoint}/nodes-data`;

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(
    document.documentElement.classList.contains('dark-mode-preferred')
  );

  return (
    <div
      className={`w-screen min-h-screen grid pb-24 ${
        darkMode ? 'bg-black text-white-80' : 'bg-white text-black-95'
      }`}
    >
      <div className="layout-grid w-screen justify-self-center">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <StatsManager
          envName={envName}
          statsEndpoint={statsEndpoint}
          nodesEndpoint={nodesEndpoint}
          className="max-w-3xl px-24"
        />
      </div>
    </div>
  );
}

export default App;
