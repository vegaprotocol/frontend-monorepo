import { VegaLogo } from '@vegaprotocol/ui-toolkit';
import { LightModeToggle, DarkModeToggle } from '../images';
import { VegaBackgroundVideo } from '../videos';
import { DarkModeState } from '../../config/types';

export const Header = ({ darkMode, setDarkMode }: DarkModeState) => {
  return (
    <header className="relative overflow-hidden py-8">
      <VegaBackgroundVideo />

      <div
        className={`relative flex justify-center px-8 ${
          darkMode ? 'bg-black' : 'bg-white'
        }`}
      >
        <div className="w-full max-w-3xl p-20 flex items-center justify-between">
          <VegaLogo />

          <button
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Switch theme color"
            className={`transition-colors rounded-full cursor-pointer ${
              darkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-200'
            }`}
          >
            {darkMode ? <LightModeToggle /> : <DarkModeToggle />}
          </button>
        </div>
      </div>
    </header>
  );
};
