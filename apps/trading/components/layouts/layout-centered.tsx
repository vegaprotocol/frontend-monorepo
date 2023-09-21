import { Outlet } from 'react-router-dom';

export const LayoutCentered = () => {
  return (
    <div className="mx-auto lg:min-w-[700px] min-w-[300px] max-w-[700px] px-4 lg:px-8 py-8 lg:py-16">
      <Outlet />
    </div>
  );
};
