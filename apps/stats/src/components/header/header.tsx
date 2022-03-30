import { VegaLogo, ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { VegaBackgroundVideo } from '../videos';

interface ThemeToggleProps {
  toggleTheme: () => void;
}

export const Header = ({ toggleTheme }: ThemeToggleProps) => {
  return (
    <header className="relative overflow-hidden py-8 mb-40 md:mb-64">
      <VegaBackgroundVideo />

      <div className="relative flex justify-center px-8 dark:bg-black bg-white">
        <div className="w-full max-w-3xl p-20 flex items-center justify-between">
          <VegaLogo />
          <ThemeSwitcher onToggle={toggleTheme} />
        </div>
      </div>
    </header>
  );
};
