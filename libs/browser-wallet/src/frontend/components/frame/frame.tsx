import locators from '../locators';

export const Frame = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      data-testid={locators.frame}
      className="border border-vega-dark-200 rounded-lg py-4 px-5 mb-6"
    >
      {children}
    </div>
  );
};
