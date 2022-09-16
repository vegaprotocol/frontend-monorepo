const Header = () => {
  return (
    <div className="flex items-stretch px-6 py-6" data-testid="header">
      <h1 className="text-3xl">Top liquidity opportunities</h1>
      <div className="flex items-center gap-2 ml-auto relative z-10">
        Network switcher
      </div>
    </div>
  );
};

export default Header;
