import { VegaLogo, LightModeToggle, DarkModeToggle } from '../images';
import { VegaBackgroundVideo } from '../videos';
import { DarkModeState } from '../../config/types';

export const Header = ({ darkMode, setDarkMode }: DarkModeState) => {
  return (
    <header className="relative overflow-hidden py-2">
      <VegaBackgroundVideo />

      <div
        className={`relative flex justify-center px-2 ${
          darkMode ? 'bg-black' : 'bg-white'
        }`}
      >
        <div className="w-full max-w-3xl p-5 flex items-center justify-between">
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
