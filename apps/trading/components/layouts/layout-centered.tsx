import { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

export const LayoutCentered = ({
  variant,
  children,
}: {
  variant?: 'gradient';
  children?: ReactNode;
}) => {
  return (
    <div className="overflow-y-auto h-full relative">
      {variant === 'gradient' && (
        <div className="absolute top-0 left-0 w-full h-[40%] -z-10 bg-[40%_0px] bg-cover bg-no-repeat bg-local bg-[url(/cover.png)]">
          <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-surface-0 to-transparent from-20% to-60%" />
        </div>
      )}
      <div className="flex flex-col gap-6 container min-h-full max-w-screen-xl mx-auto py-12 px-4">
        {children || <Outlet />}
      </div>
    </div>
  );
};
