import { Search } from '../search';

export const Header = () => {
  return (
    <header className="flex px-16 pt-16 pb-8 border-b-1 col-start-1 col-end-3 row-start-1 row-end-2">
      <h1
        className="text-h3 font-alpha uppercase contextual-alternates"
        data-testid="explorer-header"
      >
        Vega Explorer
      </h1>
      <Search />
    </header>
  );
};
