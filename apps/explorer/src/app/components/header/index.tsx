import Search from '../search';

export const Header = () => {
  return (
    <header>
      <h1 className="text-h2" data-testid="explorer-header">
        Vega Explorer
      </h1>
      <Search />
    </header>
  );
};
