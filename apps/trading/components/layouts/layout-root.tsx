import { Outlet } from 'react-router-dom';

export const LayoutRoot = () => {
  return (
    <>
      <Outlet />
      <Background />
    </>
  );
};

const Background = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-cover bg-no-repeat bg-local bg-[url(/home-bg.webp)] opacity-70">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-0 via-transparent to-surface-0 from-0% via-50% to-90%" />
    </div>
  );
};
