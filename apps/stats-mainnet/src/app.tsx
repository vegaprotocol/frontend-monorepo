import React, { useState } from 'react';
import { Header } from './components/header';
import { StatsManager } from '@vegaprotocol/mainnet-stats-manager';

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
        <StatsManager className="max-w-3xl" />
      </div>
    </div>
  );
}

export default App;
