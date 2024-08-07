import type { ReactNode } from 'react';

import locators from '../locators';

export const StarsWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <section
      data-testid={locators.splashWrapper}
      className="text-center h-full"
      style={{
        backgroundImage: 'url(./stars.png)',
        backgroundPosition: 'center',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="h-full w-full py-6 px-5">{children}</div>
    </section>
  );
};
