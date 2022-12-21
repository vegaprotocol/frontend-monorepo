import {
  BackgroundVideo,
  VegaLogo,
  ThemeSwitcher,
} from '@vegaprotocol/ui-toolkit';

export const Header = () => {
  return (
    <header className="relative overflow-hidden py-2 mb-10 md:mb-16">
      <BackgroundVideo />

      <div className="relative flex justify-center px-2 dark:bg-black bg-white">
        <div className="w-full max-w-3xl p-5 flex items-center justify-between">
          <VegaLogo />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
};
