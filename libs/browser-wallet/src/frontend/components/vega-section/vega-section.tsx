export const locators = {
  vegaSection: 'vega-section',
};

export const VegaSection = ({ children }: { children: React.ReactNode }) => (
  <section
    data-testid={locators.vegaSection}
    className="border-b border-1 last-of-type:border-0 border-surface-0-fg-muted py-4"
  >
    {children}
  </section>
);
