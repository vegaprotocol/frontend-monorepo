import { type ReactNode } from 'react';

export const LayoutWithGradient = ({ children }: { children: ReactNode }) => {
  return (
    <div className="relative h-full pt-5 overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-[40%] -z-10 bg-[40%_0px] bg-cover bg-no-repeat bg-local bg-[url(/cover.png)]">
        <div className="absolute top-o left-0 w-full h-full bg-gradient-to-t from-white dark:from-vega-cdark-900 to-transparent from-20% to-60%" />
      </div>
      <div className="flex flex-col gap-4 lg:gap-6 container p-4 mx-auto">
        {children}
      </div>
    </div>
  );
};
