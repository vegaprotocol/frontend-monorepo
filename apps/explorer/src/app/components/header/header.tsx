import { ThemeSwitcher } from '@vegaprotocol/ui-toolkit';
import { Search } from '../search';

interface ThemeToggleProps {
  toggleTheme: () => void;
}

export const Header = ({ toggleTheme }: ThemeToggleProps) => {
  return (
    <header className="flex items-center px-16 py-16 border-b-1 col-start-1 col-end-3 row-start-1 row-end-2">
      <h1
        className="text-h3 font-alpha uppercase contextual-alternates"
        data-testid="explorer-header"
      >
        Vega Explorer
      </h1>
      <Search />
      <ThemeSwitcher onToggle={toggleTheme} />
    </header>
  );
};
