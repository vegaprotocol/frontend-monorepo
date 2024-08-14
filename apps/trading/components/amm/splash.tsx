import type { ReactNode } from 'react';

export const Splash = ({ children }: { children: ReactNode }) => (
  <div className="relative h-full w-full text-xs">
    <div className="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 transform">
      {children}
    </div>
  </div>
);
